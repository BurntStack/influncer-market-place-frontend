// Auth state: real token + user session backed by the Collivra API (docs/API.md
// section 1). The backend issues a Supabase JWT; we keep it (and the user) in
// localStorage. Token storage itself lives in apiClient.js.
import { api, getToken, setToken, clearToken } from './apiClient.js'

const USER_KEY = 'collivra_user'

// --- synchronous reads (used by route guards + layout chrome) ---

export const isAuthed = () => !!getToken()

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

const setUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

const persistSession = ({ token, user } = {}) => {
  if (token) setToken(token)
  if (user) setUser(user)
}

// Merge local-only profile edits (e.g. onboarding) into the stored user.
// There is no profile-update endpoint in the contract yet, so these stay
// client-side; swap for a PATCH /auth/me (or similar) once it exists.
export const updateLocalUser = (patch) => {
  const next = { ...(getUser() || {}), ...patch }
  setUser(next)
  return next
}

// --- async auth actions ---

export const signup = async ({ name, email, password, companyName }) => {
  const data = await api.post('/auth/signup', { name, email, password, companyName })
  persistSession(data)
  return data
}

export const login = async ({ email, password }) => {
  const data = await api.post('/auth/login', { email, password })
  persistSession(data)
  return data
}

// Fire-and-forget so existing call sites can stay `logout(); navigate('/')`.
// We clear locally first, then best-effort invalidate the server session.
export const logout = () => {
  const hadToken = !!getToken()
  clearToken()
  setUser(null)
  if (hadToken) api.post('/auth/logout').catch(() => {})
}

// Re-fetch the current user (e.g. on app load) and refresh the cached copy.
export const fetchMe = async () => {
  const data = await api.get('/auth/me')
  if (data?.user) setUser(data.user)
  return data?.user ?? null
}
