import { getToken, setToken, clearToken } from './apiClient.js'
import { supabase } from './supabaseClient.js'

const USER_KEY = 'collivra_user'

// Read the Supabase access token straight from localStorage.
// Supabase writes it synchronously when createClient processes the OAuth redirect
// hash, so it's available before any React code runs.
const readSupabaseToken = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('sb-') && k.endsWith('-auth-token')) {
        const raw = localStorage.getItem(k)
        if (!raw) continue
        const session = JSON.parse(raw)
        return session?.access_token || null
      }
    }
  } catch {}
  return null
}

export const isAuthed = () => {
  if (getToken()) return true
  // After an OAuth redirect Supabase has the session before our listener fires —
  // read it directly and sync it so RequireAuth doesn't bounce the user.
  const sbToken = readSupabaseToken()
  if (sbToken) { setToken(sbToken); return true }
  return false
}

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
}

const setUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {}
}

export const updateLocalUser = (patch) => {
  const next = { ...(getUser() || {}), ...patch }
  setUser(next)
  return next
}

// --- Supabase session sync ---

const syncSupabaseSession = (session) => {
  if (!session) return
  setToken(session.access_token)
  const u = session.user
  const existing = getUser() || {}
  setUser({
    ...existing,
    id: u.id,
    email: u.email,
    name: existing.name || u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || '',
    companyName: existing.companyName || u.user_metadata?.companyName || '',
    avatar: u.user_metadata?.avatar_url || '',
  })
}

// Call once at app startup. Returns an unsubscribe function.
export const setupSupabaseAuthListener = () => {
  if (!supabase) return () => {}

  // Sync any session that's already in storage (covers page refreshes + OAuth redirects).
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) syncSupabaseSession(session)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session) syncSupabaseSession(session)
    if (event === 'SIGNED_OUT') { clearToken(); setUser(null) }
  })

  return () => subscription.unsubscribe()
}

// --- Mock email auth (swapped for real API calls once Rohith's backend is live) ---

const mockSession = (user) => {
  setToken('mock-' + Date.now())
  setUser(user)
  return { token: getToken(), user }
}

export const requestSignupVerification = async () => ({ message: 'Verification code sent.' })

export const verifySignupEmail = async () => ({ verificationToken: 'mock-token' })

export const completeSignup = async ({ email, name, companyName, mobile, category }) =>
  mockSession({ id: 'u1', email, name, companyName, mobile, category })

export const signup = async ({ email, name, companyName }) =>
  mockSession({ id: 'u1', email, name, companyName })

export const login = async ({ email }) => {
  const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return mockSession({ id: 'u1', email, name })
}

// OAuth is handled by supabase.auth.signInWithOAuth — this is a no-op fallback.
export const oauthLogin = async () => {}

export const logout = () => {
  clearToken()
  setUser(null)
  supabase?.auth.signOut().catch(() => {})
}

export const fetchMe = async () => {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) { syncSupabaseSession(session); return getUser() }
  }
  return getUser()
}
