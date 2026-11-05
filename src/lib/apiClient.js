const BASE_URL = (import.meta.env.VITE_COLLAB_API_URL || 'https://collab-api-ewju.onrender.com/v1').replace(/\/+$/, '')
const ACCESS_KEY = 'linkloom_access'
const REFRESH_KEY = 'linkloom_refresh'

const read = key => { try { return localStorage.getItem(key) } catch { return null } }
const write = (key, value) => { try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key) } catch {} }

export const getToken = () => read(ACCESS_KEY)
export const getRefreshToken = () => read(REFRESH_KEY)
export const setToken = token => write(ACCESS_KEY, token)
export const setRefreshToken = token => write(REFRESH_KEY, token)
export const clearToken = () => { setToken(null); setRefreshToken(null) }

export const toPaise = value => Math.round(Number(value || 0) * 100)
export const fromPaise = value => Number(value?.amount ?? value ?? 0) / 100

const buildUrl = (path, query) => {
  const url = new URL(`${BASE_URL}/${String(path).replace(/^\/+/, '')}`)
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  })
  return url
}

const parseResponse = async response => {
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error?.message || payload?.error?.code || `Request failed (${response.status}).`)
    error.status = response.status
    error.code = payload?.error?.code || 'REQUEST_FAILED'
    error.details = payload?.error
    throw error
  }
  return { data: payload?.data ?? null, meta: payload?.meta ?? {} }
}

let refreshPromise = null
const refreshAccess = async () => {
  if (!getRefreshToken()) return null
  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl('/auth/token/refresh/'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: getRefreshToken() }),
    }).then(parseResponse).then(({ data }) => {
      if (!data?.access) throw new Error('Session refresh returned no access token.')
      setToken(data.access)
      if (data.refresh) setRefreshToken(data.refresh)
      return data.access
    }).catch(() => { clearToken(); return null }).finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

export const apiRequest = async (path, { method = 'GET', body, query, signal, auth = true } = {}) => {
  let token = getToken()
  if (auth && !token) token = await refreshAccess()
  if (auth && !token) {
    const error = new Error('Please log in to continue.')
    error.code = 'AUTH_REQUIRED'
    error.status = 401
    throw error
  }
  const send = access => fetch(buildUrl(path, query), {
    method, signal,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(auth && access ? { Authorization: `Bearer ${access}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  let response = await send(token)
  if (auth && response.status === 401) {
    token = await refreshAccess()
    if (token) response = await send(token)
  }
  return parseResponse(response)
}

export const apiData = async (path, options) => (await apiRequest(path, options)).data

export const listPage = ({ data, meta }) => ({
  results: Array.isArray(data) ? data : data?.results || data?.items || [],
  total: meta?.total ?? data?.total ?? null,
  nextCursor: meta?.nextCursor || null,
})

export const collectPages = async (path, { query = {}, signal } = {}) => {
  const results = []
  let cursor = null
  const seen = new Set()
  do {
    const page = listPage(await apiRequest(path, { query: { ...query, limit: Math.min(Number(query.limit) || 50, 50), cursor }, signal }))
    results.push(...page.results)
    cursor = page.nextCursor
    if (cursor && seen.has(cursor)) throw new Error('The server repeated a pagination cursor.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  return results
}

export const downloadFile = async () => { throw new Error('The backend does not provide an export endpoint yet.') }
