import parseLink from 'parse-link-header';

import { registryAPI, deleteEnabled, repositoriesPerPage, tagsPerPage, usePortusExplore } from '@/options';

function parseWWWAuthenticate(text) {
	const result = {};
	// extract auth-scheme
	const schemeParts = text.split(' ');
	[result.scheme] = schemeParts;
	// extract auth-params
	const remain = schemeParts.slice(1).join(' ');
	const parts = remain.split(/ ?, ?/);
	parts.forEach((part) => {
		// parse auth-param
		const kv = part.split('=');
		if (kv.length === 2) {
			const key = kv[0].trim();
			const value = kv[1].trim();
			if (value.startsWith('"') && value.endsWith('"')) {
				result[key] = value.substring(1, value.length - 1);
			} else {
				result[key] = value;
			}
		} else {
			result[parts] = true;
		}
	});
	return result;
}

const cachedTokens = {};
async function doAuth(scope) {
	if (cachedTokens[scope] !== undefined) {
		return cachedTokens[scope];
	}

	// try accessing registry API
	const response = await fetch(`${await registryAPI()}/v2/`);
	if (response.ok) {
		// token not needed for registry
		cachedTokens[scope] = false;
		return cachedTokens[scope];
	}
	if (response.status !== 401) {
		throw new Error(response.statusText);
	}

	// solve authentication challenge
	const { headers } = response;
	if (!headers.has('Www-Authenticate')) {
		throw new Error('no challenge presented');
	}
	const chal = parseWWWAuthenticate(headers.get('Www-Authenticate'));
	if (chal.scheme !== 'Bearer') {
		throw new Error('unsupported scheme');
	}

	const tokURL = new URL(chal.realm);
	tokURL.searchParams.append('client_id', 'dri-client');
	tokURL.searchParams.append('service', chal.service);
	tokURL.searchParams.append('scope', scope);
	const tokResponse = await fetch(tokURL);
	const tok = await tokResponse.json();
	cachedTokens[scope] = tok.token;
	return tok.token;
}

async function paginatable(path, scope, n, last = null) {
	const url = new URL(`${await registryAPI()}${path}`);
	if (n) url.searchParams.append('n', n);
	if (last) url.searchParams.append('last', last);

	const headers = {};
	if (scope) {
		const token = await doAuth(scope);
		if (token) headers.Authorization = `Bearer ${token}`;
	}
	const response = await fetch(url, { headers });
	let nextLast = null;
	if (response.headers.has('Link')) {
		const links = parseLink(response.headers.get('Link'));
		if (links && links.next) {
			nextLast = links.next.last;
		}
	}
	return Object.assign(await response.json(), { nextLast });
}

async function request(method, path, scope, accept) {
	const url = new URL(`${await registryAPI()}${path}`);
	const headers = {};
	if (accept) {
		headers.Accept = accept;
	}
	if (scope) {
		const token = await doAuth(scope);
		if (token) headers.Authorization = `Bearer ${token}`;
	}
	const response = await fetch(url, { method, headers });
	if (!response.ok) {
		if (method === 'HEAD') {
			throw new Error(`${response.statusText}`);
		} else if (response.headers.get('Content-Type').startsWith('application/json')) {
			const r = await response.json();
			const firstError = r.errors[0];
			if (firstError) {
				throw new Error(`${firstError.code}: ${firstError.message}`);
			}
		}
		throw new Error(`${response.statusText}`);
	}
	if (!response.headers.get('Content-Type').startsWith('application/json')) {
		console.warn('response returned was not JSON, parsing may fail');
	}
	if (method === 'HEAD' || parseInt(response.headers.get('Content-Length'), 10) < 1) {
		return { headers: response.headers };
	}
	return {
		...(await response.json()),
		headers: response.headers,
	};
}

async function portus() {
// TODO: Use the Portus API when it enables anonymous access
	const response = await fetch(`${await registryAPI()}/explore?explore%5Bsearch%5D=`);
	const html = await response.text();

	// unconventionally parse out JSON from HTML
	const startString = 'window.repositories = ';
	const endString = ';</script>';
	const string = html.substring(
		html.lastIndexOf(startString) + startString.length,
		html.indexOf(endString),
	);
	const object = JSON.parse(string);
	return object;
}

async function repos(last = null) {
	if (await usePortusExplore()) {
		const p = await portus();
		return {
			repositories: p.map(r => r.full_name),
		};
	}
	return paginatable('/v2/_catalog', null, await repositoriesPerPage(), last);
}

async function tags(name, last = null) {
	if (await usePortusExplore()) {
		const p = await portus();
		return {
			tags: p.find(r => r.full_name === name)
				.tags.map(t => t[0].name),
		};
	}
	return paginatable(`/v2/${name}/tags/list`, `repository:${name}:pull`, await tagsPerPage(), last);
}

async function tag(name, ref) {
	return request('GET', `/v2/${name}/manifests/${ref}`, `repository:${name}:pull`, 'application/vnd.docker.distribution.manifest.v2+json');
}

async function tagCanDelete(name, ref) {
	if (!await deleteEnabled()) {
		return false;
	}
	try {
		const { headers } = await request('HEAD', `/v2/${name}/manifests/${ref}`, `repository:${name}:delete`, 'application/vnd.docker.distribution.manifest.v2+json');
		request('HEAD', `/v2/${name}/manifests/${headers.get('Docker-Content-Digest')}`, `repository:${name}:delete`);
		return true;
	} catch (e) {
		return false;
	}
}

async function tagDelete(name, ref) {
	const tagManifest = await tag(name, ref);
	// delete each blob
	// await Promise.all(tagManifest.layers.map(l =>
	//	request('DELETE', `/v2/${name}/blobs/${l.digest}`, `repository:${name}:delete`)));
	return request('DELETE', `/v2/${name}/manifests/${tagManifest.headers.get('Docker-Content-Digest')}`, `repository:${name}:delete`);
}

async function repoCanDelete(name) {
	if (!await deleteEnabled()) {
		return false;
	}
	const r = await request('GET', `/v2/${name}/tags/list`, `repository:${name}:delete`);
	if (!r.tags) {
		return false;
	}
	return Promise.race(r.tags.map(t => tagCanDelete(name, t)));
}

async function repoDelete(name) {
	const r = await request('GET', `/v2/${name}/tags/list`, `repository:${name}:delete`);
	return Promise.all(r.tags.map(t => tagDelete(name, t)));
}

async function blob(name, digest) {
	const { headers } = await request('HEAD', `/v2/${name}/blobs/${digest}`, `repository:${name}:pull`);
	return {
		dockerContentDigest: headers.get('Docker-Content-Digest'),
		contentLength: parseInt(headers.get('Content-Length'), 10),
	};
}

async function configBlob(name, digest) {
	return request('GET', `/v2/${name}/blobs/${digest}`, `repository:${name}:pull`);
}

export {
	repos,
	tags,
	tag,
	tagCanDelete,
	tagDelete,
	repoCanDelete,
	repoDelete,
	blob,
	configBlob,
};
