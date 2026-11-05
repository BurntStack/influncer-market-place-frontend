const keyFor = user => `linkloom_social_accounts:${user?.id || user?.phone || 'guest'}`

export const saveSocialAccounts = (user, accounts) => {
  try { localStorage.setItem(keyFor(user), JSON.stringify(accounts)) } catch {}
}

export const getSocialAccounts = user => {
  try { return JSON.parse(localStorage.getItem(keyFor(user)) || '[]') } catch { return [] }
}
