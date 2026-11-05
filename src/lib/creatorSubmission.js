const keyFor = user => `linkloom_creator_submitted:${user?.id || user?.phone || 'guest'}`

export const markCreatorSubmitted = user => {
  const submittedAt = new Date().toISOString()
  try { localStorage.setItem(keyFor(user), submittedAt) } catch {}
  return submittedAt
}

export const getCreatorSubmittedAt = user => {
  try { return localStorage.getItem(keyFor(user)) || '' } catch { return '' }
}
