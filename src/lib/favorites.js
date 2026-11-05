import { useSyncExternalStore } from 'react'
import { apiData, collectPages, getRefreshToken, getToken } from './apiClient.js'
import { getUser } from './auth.js'
import { getCreator, normalizeCreator } from '../api/creators.js'

const key = () => `favorites:${getUser()?.id || 'guest'}`
const read = () => { try { return localStorage.getItem(key()) || '[]' } catch { return '[]' } }
const write = items => {
  localStorage.setItem(key(), JSON.stringify(items))
  window.dispatchEvent(new Event('favorites'))
}
const subscribe = fn => {
  window.addEventListener('favorites', fn)
  window.addEventListener('storage', fn)
  return () => { window.removeEventListener('favorites', fn); window.removeEventListener('storage', fn) }
}
const cached = () => { try { return JSON.parse(read()) } catch { return [] } }
const signedIn = () => Boolean(getToken() || getRefreshToken())

export function useFavorites() {
  const value = useSyncExternalStore(subscribe, read, () => '[]')
  try { return JSON.parse(value) } catch { return [] }
}

const favoriteList = async (create = false) => {
  const lists = await collectPages('/lists/')
  const found = lists.find(item => item.name?.toLowerCase() === 'favorites')
  return found || (create ? apiData('/lists/', { method: 'POST', body: { name: 'Favorites' } }) : null)
}

export async function toggleFavorite(creator) {
  const previous = cached()
  const saved = previous.some(item => item.id === creator.id)
  write(saved ? previous.filter(item => item.id !== creator.id) : [...previous, creator])
  if (!signedIn()) return
  try {
    const list = await favoriteList(!saved)
    if (!list) return
    if (saved) await apiData(`/lists/${encodeURIComponent(list.id)}/creators/${encodeURIComponent(creator.id)}/`, { method: 'DELETE' })
    else await apiData(`/lists/${encodeURIComponent(list.id)}/creators/`, { method: 'POST', body: { creatorId: creator.id } })
  } catch (error) {
    write(previous)
    throw error
  }
}

export async function refreshFavorites() {
  if (!signedIn()) return
  const list = await favoriteList()
  if (!list) { write([]); return }
  const detail = await apiData(`/lists/${encodeURIComponent(list.id)}/`)
  const members = detail?.creators || detail?.items || []
  const profiles = await Promise.all(members.map(async item => {
    const creator = item.creator || item
    if (creator.name || creator.displayName) return normalizeCreator(creator)
    try { return await getCreator(creator.creatorId || creator.id || creator) } catch { return null }
  }))
  write(profiles.filter(Boolean))
}
