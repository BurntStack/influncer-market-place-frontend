const keyFor = user => `linkloom_creator_demographics:${user?.id || user?.phone || 'guest'}`

export const saveCreatorDemographics = (user, details) => {
  try { localStorage.setItem(keyFor(user), JSON.stringify(details)) } catch {}
}

export const getCreatorDemographics = user => {
  try { return JSON.parse(localStorage.getItem(keyFor(user)) || '{}') } catch { return {} }
}
