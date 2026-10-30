// Thin fetch wrapper around the Collivra backend (docs/API.md).
//
// Responsibilities:
//   - prefix every path with the configured base URL (VITE_API_URL)
//   - attach the bearer token when we have one
//   - parse JSON and normalise BOTH documented error shapes:
//       { "error": { "code", "message" } }   (the contract)
//       { "detail": "..." }                   (DRF default, used by most endpoints)
//   - drop a dead session on 401 so the UI can redirect to /login
//
// Token storage lives here (not in auth.js) so this module has no imports and
// there's no circular dependency: auth.js depends on apiClient, never the reverse.

import { refreshDemoPhotos } from './creatorPhotos.js'

const BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '')
const TOKEN_KEY = 'collivra_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore (private mode / storage disabled) */
  }
}

export const clearToken = () => setToken(null)

export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const obj = data && typeof data === 'object' ? data : {}
    const message =
      obj.error?.message ||
      obj.detail ||
      obj.message ||
      (typeof data === 'string' && data) ||
      `Request failed (${res.status})`
    const code = obj.error?.code || obj.code || null

    // An expired/invalid token on a protected call: drop it so route guards
    // bounce the user to /login. Don't touch tokens on the auth endpoints
    // themselves (a wrong password there shouldn't log an existing user out).
    if (res.status === 401 && !path.startsWith('/auth/')) clearToken()

    throw new ApiError(message, { status: res.status, code, data })
  }

  return refreshDemoPhotos(data)
}

// Build a query string from a params object, skipping empty values.
export const qs = (params = {}) => {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.append(k, v)
  })
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

// Download binary/CSV exports without forcing the JSON response parser.
export const downloadFile = async (path, filename) => {
  const res = await fetch(`${BASE_URL}${path}`, { headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} })
  if (!res.ok) {
    let data = null
    try { data = await res.json() } catch { /* download errors may be plain text */ }
    throw new ApiError(data?.error?.message || data?.detail || data?.message || `Download failed (${res.status})`, { status: res.status, data })
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
