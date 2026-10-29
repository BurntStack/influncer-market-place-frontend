// Local replacements for known stock portraits in the frontend and API demos.
// Match only known stock URLs; uploaded creator photos stay intact.
const LEGACY_PHOTOS = {
  15602468: 'ananya-rao',
  6498090: 'rohan-mehta',
  17611594: 'meera-iyer',
  20319696: 'kabir-singh',
  12995512: 'sana-qureshi',
  8720868: 'priya-nair',
  12596735: 'arjun-das',
  6594747: 'ishita-kapoor',
}

const LEGACY_UNSPLASH_PHOTOS = {
  'photo-1507003211169-0a1dd7228f2d': 'rohan-mehta',
  'photo-1506794778202-cad84cf45f1d': 'kabir-singh',
  'photo-1494790108377-be9c29b29330': 'ananya-rao',
  'photo-1534528741775-53994a69daeb': 'priya-nair',
  'photo-1544005313-94ddf0286df2': 'meera-iyer',
  'photo-1500648767791-00dcc994a43e': 'arjun-das',
  'photo-1517841905240-472988babdf9': 'ishita-kapoor',
}

export const creatorPhoto = (id) => `/creators/${id}.jpg?v=women-20261029`

export function refreshDemoPhotos(value) {
  if (typeof value === 'string') {
    const pexels = value.match(/^https:\/\/images\.pexels\.com\/photos\/(\d+)\//)
    const unsplash = value.match(/^https:\/\/images\.unsplash\.com\/(photo-[\w-]+)(?:\?|$)/)
    const replacement = (pexels && LEGACY_PHOTOS[pexels[1]]) || (unsplash && LEGACY_UNSPLASH_PHOTOS[unsplash[1]])
    return replacement ? creatorPhoto(replacement) : value
  }
  if (Array.isArray(value)) return value.map(refreshDemoPhotos)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, refreshDemoPhotos(item)]))
  return value
}
