const version = process.env.VUE_APP_VERSION || '[master]';
const source = process.env.VUE_APP_SOURCE_LINK || 'https://github.com/productionwentdown/dri';

const defaultConfig = {
	merged: false,

	registryHost: process.env.VUE_APP_REGISTRY_HOST,
	registryAPI: process.env.VUE_APP_REGISTRY_API,

	repositoriesPerPage: process.env.VUE_APP_REPOSITORIES_PER_PAGE,
	tagsPerPage: process.env.VUE_APP_TAGS_PER_PAGE,

	usePortusExplore: process.env.VUE_APP_USE_PORTUS_EXPLORE,
};

async function config() {
	if (defaultConfig.merged) {
		return defaultConfig;
	}

	try {
		const response = await fetch('config.json');
		const jsonConfig = await response.json();
		defaultConfig.merged = true;
		return Object.assign(defaultConfig, jsonConfig);
	} catch (_) {
		defaultConfig.merged = true;
		return defaultConfig;
	}
}

async function registryHost() {
	const c = await config();
	if (c.registryHost) {
		return c.registryHost;
	}
	return window.location.host;
}

async function registryAPI() {
	const c = await config();
	if (c.registryAPI) {
		return c.registryAPI;
	}
	const host = await registryHost();
	// assume API uses the same protocol as the page
	// this is because browsers don't allow mixed content
	// if a HTTPS API needs to be accessed over HTTP, configure registryAPI
	return `${window.location.protocol}//${host}`;
}

async function usePortusExplore() {
	const c = await config();
	if (c.usePortusExplore) {
		return true;
	}
	return false;
}

async function repositoriesPerPage() {
	const c = await config();
	try {
		const n = parseInt(c.repositoriesPerPage, 10);
		if (n > 0) return n;
	} catch (_) {
		return 0;
	}
	return 0;
}

async function tagsPerPage() {
	const c = await config();
	try {
		const n = parseInt(c.tagsPerPage, 10);
		if (n > 0) return n;
	} catch (_) {
		return 0;
	}
	return 0;
}

export {
	version,
	source,
	registryHost,
	registryAPI,
	repositoriesPerPage,
	tagsPerPage,
	usePortusExplore,
};
