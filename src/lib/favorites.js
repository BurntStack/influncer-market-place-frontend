import { useSyncExternalStore } from 'react'
import { getUser } from './auth.js'
import { api } from './apiClient.js'
const key = () => `favorites:${getUser()?.id || getUser()?.email || 'guest'}`
const read = () => localStorage.getItem(key()) || '[]'
const subscribe = (fn) => { window.addEventListener('favorites', fn); window.addEventListener('storage', fn); return () => { window.removeEventListener('favorites', fn); window.removeEventListener('storage', fn) } }
export function useFavorites() { const value = useSyncExternalStore(subscribe, read, () => '[]'); try { return JSON.parse(value) } catch { return [] } }
export function toggleFavorite(creator) { let items; try { items = JSON.parse(read()) } catch { items = [] } localStorage.setItem(key(), JSON.stringify(items.some((c) => c.id === creator.id) ? items.filter((c) => c.id !== creator.id) : [...items, creator])); window.dispatchEvent(new Event('favorites')) }

// Refresh older saved snapshots using the current backend profile, including its photo.
export async function refreshFavorites() {
  const storageKey = key()
  let items
  try { items = JSON.parse(read()) } catch { return }
  const results = await Promise.allSettled(items.map(item => api.get(`/creators/${encodeURIComponent(item.id)}`)))
  if (storageKey !== key()) return
  const profiles = new Map(results.flatMap((result,index) => result.status === 'fulfilled' && result.value?.id ? [[String(items[index].id), result.value]] : []))
  let current
  try { current = JSON.parse(read()) } catch { return }
  localStorage.setItem(storageKey, JSON.stringify(current.map(item => profiles.has(String(item.id)) ? { ...item, ...profiles.get(String(item.id)) } : item)))
  window.dispatchEvent(new Event('favorites'))
}
