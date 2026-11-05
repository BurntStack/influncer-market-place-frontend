import { apiData, clearToken, getRefreshToken, getToken, setRefreshToken, setToken } from './apiClient.js'

const USER_KEY = 'linkloom_user'

export const isAuthed = () => Boolean(getToken() || getRefreshToken())
export const getUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null } }
const setUser = user => { try { if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); else localStorage.removeItem(USER_KEY) } catch {} }
export const updateLocalUser = patch => { const user = { ...(getUser() || {}), ...patch }; setUser(user); return user }

const saveSession = session => {
  if (session?.access) setToken(session.access)
  if (session?.refresh) setRefreshToken(session.refresh)
  if (session?.user) setUser(session.user)
  return session
}

export const requestOtp = destination => apiData('/auth/otp/request/', {
  method: 'POST', auth: false, body: { channel: 'sms', destination },
})

export const verifyOtp = async (challengeId, code) => saveSession(await apiData('/auth/otp/verify/', {
  method: 'POST', auth: false, body: { challengeId, code },
}))

export const completeSignup = async profile => {
  const result = await apiData('/auth/signup/complete/', { method: 'POST', body: profile })
  if (result?.user || result?.access) saveSession(result)
  else updateLocalUser({ ...profile, name: profile.fullName || profile.displayName })
  return result
}

export const fetchMe = async () => {
  const result = await apiData('/auth/me/')
  const user = result?.user || result
  if (user) setUser(user)
  return user
}

export const logout = () => {
  const refresh = getRefreshToken()
  if (refresh) apiData('/auth/logout/', { method: 'POST', body: { refresh } }).catch(() => {})
  clearToken()
  setUser(null)
}
