import parseLink from 'parse-link-header';

import { registryAPI, repositoriesPerPage, tagsPerPage, usePortusExplore } from '@/options';

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

let cachedToken = null;
async function doAuth() {
	if (cachedToken !== null) {
		return cachedToken;
	}

	// try accessing registry API
	const response = await fetch(`${await registryAPI()}/v2/`);
	if (response.ok) {
		// token not needed for registry
		cachedToken = false;
		return cachedToken;
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
	tokURL.searchParams.append('scope', 'repository:pwd/migrate:pull');
	const tokResponse = await fetch(tokURL);
	const tok = await tokResponse.json();
	cachedToken = tok.token;
	return tok.token;
}

async function paginatable(path, n, last = null) {
	const token = await doAuth();
	const url = new URL(`${await registryAPI()}${path}`);
	if (n) url.searchParams.append('n', n);
	if (last) url.searchParams.append('last', last);

	const headers = {};
	if (token) headers.Authorization = `Bearer ${token}`;
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

async function get(path) {
	const token = await doAuth();
	const url = new URL(`${await registryAPI()}${path}`);
	const headers = {};
	if (token) headers.Authorization = `Bearer ${token}`;
	const response = await fetch(url, { headers });
	return response.json();
}

async function head(path) {
	const token = await doAuth();
	const url = new URL(`${await registryAPI()}${path}`);
	const headers = {};
	if (token) headers.Authorization = `Bearer ${token}`;
	const response = await fetch(url, { method: 'HEAD', headers });
	return response.headers;
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
	return paginatable('/v2/_catalog', await repositoriesPerPage(), last);
}

async function repo(name) {
	return get(`/v2/${name}`);
}

async function tags(name, last = null) {
	if (await usePortusExplore()) {
		const p = await portus();
		return {
			tags: p.find(r => r.full_name === name)
				.tags.map(t => t[0].name),
		};
	}
	return paginatable(`/v2/${name}/tags/list`, await tagsPerPage(), last);
}

async function tag(name, ref) {
	return get(`/v2/${name}/manifests/${ref}`);
}

async function blob(name, digest) {
	const headers = await head(`/v2/${name}/blobs/${digest}`);
	return {
		contentLength: parseInt(headers.get('Content-Length'), 10),
	};
}

export {
	repos,
	repo,
	tags,
	tag,
	blob,
};
