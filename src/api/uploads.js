import { apiData } from '../lib/apiClient.js'

const limits = { avatar: 10, gallery: 10, brand_logo: 10, deliverable: 50, chat_attachment: 10 }
const imageTypes = ['image/jpeg', 'image/png', 'image/webp']
const allowedTypes = {
  avatar: imageTypes,
  gallery: imageTypes,
  brand_logo: imageTypes,
  deliverable: [...imageTypes, 'application/pdf', 'video/mp4', 'video/quicktime'],
  chat_attachment: [...imageTypes, 'application/pdf'],
}

export const uploadFile = async (file, kind) => {
  if (!file || !allowedTypes[kind]) throw new Error('Choose a supported file.')
  if (!allowedTypes[kind].includes(file.type)) throw new Error('This file type is not supported.')
  if (file.size > limits[kind] * 1024 * 1024) throw new Error(`The file must be ${limits[kind]} MB or smaller.`)
  const reservation = await apiData('/uploads/', {
    method: 'POST', body: { kind, contentType: file.type, size: file.size },
  })
  const uploadId = reservation?.upload?.id
  if (!uploadId || !reservation.uploadUrl) throw new Error('The upload could not be prepared.')
  const response = await fetch(reservation.uploadUrl, {
    method: reservation.method || 'PUT',
    headers: reservation.headers || { 'Content-Type': file.type },
    body: file,
  })
  if (!response.ok) throw new Error('The file transfer failed. Please try again.')
  return apiData(`/uploads/${encodeURIComponent(uploadId)}/complete/`, { method: 'POST' })
}

export const getDownloadUrl = async uploadId => {
  const result = await apiData(`/uploads/${encodeURIComponent(uploadId)}/download-url/`)
  if (!result?.url) throw new Error('The file is not available for download.')
  return result.url
}

export const openPrivateUpload = async uploadId => {
  const url = await getDownloadUrl(uploadId)
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.append(link)
  link.click()
  link.remove()
}
