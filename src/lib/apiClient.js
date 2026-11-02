const TOKEN_KEY = 'collivra_token'

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {}
}
export const clearToken = () => setToken(null)

export const downloadFile = async () => {
  throw new Error('Export is not available in demo mode.')
}
