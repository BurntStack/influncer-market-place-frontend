import { apiData, clearToken, getRefreshToken, getToken, setRefreshToken, setToken, startSession } from './apiClient.js'

const USER_KEY = 'linkloom_user'
const ROLES_KEY = 'linkloom_account_roles'

const roles = () => { try { return JSON.parse(localStorage.getItem(ROLES_KEY) || '{}') } catch { return {} } }
const identityKeys = user => [user?.id && `id:${user.id}`, user?.phone && `phone:${user.phone}`, user?.destination && `phone:${user.destination}`].filter(Boolean)
const withSavedRole = user => {
  if (!user) return null
  if (user.role) return user
  const saved = roles()
  const role = identityKeys(user).map(key => saved[key]).find(value => value === 'brand' || value === 'creator')
  return role ? { ...user, role } : user
}

export const isAuthed = () => Boolean(getToken() || getRefreshToken())
export const postLoginPath = (role, requested) => {
  if (role === 'creator') return '/creator/workspace'
  if (role === 'brand') {
    const path = typeof requested === 'string' ? requested : ''
    if (/^\/(dashboard(?:\/|\?|$)|creators\/[^/])/.test(path) && !path.startsWith('//')) return path
    return '/dashboard'
  }
  return '/choose-role'
}
export const getUser = () => {
  try {
    const user = withSavedRole(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
    if (user?.role && identityKeys(user).some(key => roles()[key] !== user.role)) setUser(user)
    return user
  } catch { return null }
}
const setUser = user => {
  try {
    if (!user) { localStorage.removeItem(USER_KEY); return }
    const resolved = withSavedRole(user)
    localStorage.setItem(USER_KEY, JSON.stringify(resolved))
    if (resolved.role === 'brand' || resolved.role === 'creator') {
      const saved = roles()
      identityKeys(resolved).forEach(key => { saved[key] = resolved.role })
      localStorage.setItem(ROLES_KEY, JSON.stringify(saved))
    }
  } catch {}
}
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

export const verifyOtp = async (challengeId, code, phone) => {
  const session = await apiData('/auth/otp/verify/', {
    method: 'POST', auth: false, body: { challengeId, code },
  })
  if (session?.access && session?.refresh) startSession()
  saveSession({ ...session, user: { ...(session?.user || {}), phone: session?.user?.phone || phone } })
  return { ...session, user: getUser() }
}

export const completeSignup = async profile => {
  const result = await apiData('/auth/signup/complete/', { method: 'POST', body: profile })
  if (result?.user || result?.access) saveSession({
    ...result,
    user: result.user ? { ...result.user, phone: result.user.phone || getUser()?.phone } : undefined,
  })
  updateLocalUser({ ...profile, name: profile.fullName || profile.displayName })
  return result
}

export const fetchMe = async () => {
  const result = await apiData('/auth/me/')
  const user = result?.user || result
  if (user) setUser({ ...user, phone: user.phone || getUser()?.phone })
  return getUser()
}

export const resolveLoginUser = async session => {
  if (session?.user?.role) return session.user
  const user = await fetchMe()
  if (user?.role) return user
  for (const [role, path] of [['brand', '/brands/me/'], ['creator', '/creators/me/']]) {
    try {
      await apiData(path)
      return updateLocalUser({ role })
    } catch (error) {
      if (error.status !== 403 && error.status !== 404) throw error
    }
  }
  return user
}

export const logout = () => {
  const refresh = getRefreshToken()
  if (refresh) apiData('/auth/logout/', { method: 'POST', body: { refresh } }).catch(() => {})
  clearToken()
  setUser(null)
}
