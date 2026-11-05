const PREFIX = 'linkloom_onboarding_draft:'
const PHOTO_STORE = 'photos'

const identity = user => user?.phone || user?.destination || user?.id || ''
const keyFor = user => identity(user) ? `${PREFIX}${identity(user)}` : ''

export const readOnboardingDraft = user => {
  const key = keyFor(user)
  if (!key) return null
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

export const writeOnboardingDraft = (user, draft) => {
  const key = keyFor(user)
  if (!key) return
  try { localStorage.setItem(key, JSON.stringify(draft)) } catch {}
}

export const clearOnboardingDraft = user => {
  const key = keyFor(user)
  if (!key) return
  try { localStorage.removeItem(key) } catch {}
}

const openPhotoDb = () => new Promise((resolve, reject) => {
  if (typeof indexedDB === 'undefined') { reject(new Error('Photo storage is unavailable in this browser.')); return }
  const request = indexedDB.open('linkloom_onboarding', 1)
  request.onupgradeneeded = () => { request.result.createObjectStore(PHOTO_STORE) }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

const photoOperation = async (user, mode, value) => {
  const key = keyFor(user)
  if (!key) return null
  const db = await openPhotoDb()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, mode === 'read' ? 'readonly' : 'readwrite')
      const store = transaction.objectStore(PHOTO_STORE)
      const request = mode === 'read' ? store.get(key) : mode === 'delete' ? store.delete(key) : store.put(value, key)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } finally { db.close() }
}

export const loadDraftPhoto = user => photoOperation(user, 'read')
export const saveDraftPhoto = (user, file) => photoOperation(user, 'write', file)
export const deleteDraftPhoto = user => photoOperation(user, 'delete')
