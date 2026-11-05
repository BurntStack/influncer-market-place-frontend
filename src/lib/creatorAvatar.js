const keyFor = user => `linkloom_creator_avatar:${user?.id || user?.phone || 'guest'}`

export const saveCreatorAvatar = (user, url) => {
  try { localStorage.setItem(keyFor(user), url) } catch {}
}

export const getCreatorAvatar = user => {
  try { return localStorage.getItem(keyFor(user)) || '' } catch { return '' }
}
