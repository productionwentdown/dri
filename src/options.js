const version = import.meta.env.VITE_APP_VERSION || '[master]'
const source = import.meta.env.VITE_APP_SOURCE_LINK || 'https://github.com/productionwentdown/dri'

let cachedConfig = null

async function config() {
  if (cachedConfig !== null) {
    return cachedConfig
  }

  try {
    const response = await fetch('config.json')
    const jsonConfig = await response.json()
    cachedConfig = jsonConfig
  } catch {
    cachedConfig = {}
  }

  return cachedConfig
}

async function registryHost() {
  const c = await config()
  if (c.registryHost) {
    return c.registryHost
  }
  return window.location.host
}

async function registryAPI() {
  const c = await config()
  if (c.registryAPI) {
    return c.registryAPI
  }
  const host = await registryHost()
  // assume API uses the same protocol as the page
  // this is because browsers don't allow mixed content
  // if a HTTPS API needs to be accessed over HTTP, configure registryAPI
  return `${window.location.protocol}//${host}`
}

async function deleteEnabled() {
  const c = await config()
  if (c.deleteEnabled) {
    return true
  }
  return false
}

async function repositoriesPerPage() {
  const c = await config()
  try {
    const n = parseInt(c.repositoriesPerPage, 10)
    if (n > 0) return n
  } catch {
    return 0
  }
  return 0
}

async function tagsPerPage() {
  const c = await config()
  try {
    const n = parseInt(c.tagsPerPage, 10)
    if (n > 0) return n
  } catch {
    return 0
  }
  return 0
}

async function usePortusExplore() {
  const c = await config()
  if (c.usePortusExplore) {
    return true
  }
  return false
}

export {
  version,
  source,
  registryHost,
  registryAPI,
  deleteEnabled,
  repositoriesPerPage,
  tagsPerPage,
  usePortusExplore,
}
