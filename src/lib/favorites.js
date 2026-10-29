import { useSyncExternalStore } from 'react'
import { getUser } from './auth.js'
import { refreshDemoPhotos } from './creatorPhotos.js'
const key = () => `favorites:${getUser()?.id || getUser()?.email || 'guest'}`
const read = () => localStorage.getItem(key()) || '[]'
const subscribe = (fn) => { window.addEventListener('favorites', fn); window.addEventListener('storage', fn); return () => { window.removeEventListener('favorites', fn); window.removeEventListener('storage', fn) } }
export function useFavorites() { const value = useSyncExternalStore(subscribe, read, () => '[]'); try { return refreshDemoPhotos(JSON.parse(value)) } catch { return [] } }
export function toggleFavorite(creator) { let items; try { items = JSON.parse(read()) } catch { items = [] } localStorage.setItem(key(), JSON.stringify(items.some((c) => c.id === creator.id) ? items.filter((c) => c.id !== creator.id) : [...items, creator])); window.dispatchEvent(new Event('favorites')) }
