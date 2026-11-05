import { apiData, apiRequest, collectPages, listPage } from '../lib/apiClient.js'

export const getConversations = options => collectPages('/conversations/', options)
export const openConversation = ({ creatorId, brandId }) => apiData('/conversations/', {
  method: 'POST', body: creatorId ? { creatorId } : { brandId },
})
export const getConversation = id => apiData(`/conversations/${encodeURIComponent(id)}/`)
export const getMessages = async (id, cursor) => listPage(await apiRequest(`/conversations/${encodeURIComponent(id)}/messages/`, {
  query: cursor ? { cursor } : undefined,
}))
export const sendMessage = (id, { text, attachmentUploadId }) => apiData(`/conversations/${encodeURIComponent(id)}/messages/`, {
  method: 'POST', body: { ...(text?.trim() ? { text: text.trim() } : {}), ...(attachmentUploadId ? { attachmentUploadId } : {}) },
})
export const markConversationRead = id => apiData(`/conversations/${encodeURIComponent(id)}/read/`, { method: 'POST' })
