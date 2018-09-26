import parseLink from 'parse-link-header';

import { registryAPI, repositoriesPerPage, tagsPerPage, usePortusExplore } from '@/options';

async function paginatable(path, n, last = null) {
  const url = new URL(`${await registryAPI()}${path}`);
  if (n) url.searchParams.append('n', n);
  if (last) url.searchParams.append('last', last);

  const response = await fetch(url);
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
  const url = new URL(`${await registryAPI()}${path}`);
  const response = await fetch(url);
  return response.json();
}

async function head(path) {
  const url = new URL(`${await registryAPI()}${path}`);
  const response = await fetch(url, { method: 'HEAD' });
  return response.headers;
}


async function repos(last = null) {
  if (await usePortusExplore()) {
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
    return JSON.parse(string);
  }
  return paginatable('/v2/_catalog', await repositoriesPerPage(), last);
}

async function repo(name) {
  return get(`/v2/${name}`);
}

async function tags(name, last = null) {
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
