// Dashboard (logged-in brand app) — docs/API.md section 7.
import { api, qs } from '../lib/apiClient.js'

// Home screen: { greetingName, todos, stats, topCreators }.
export const getSummary = (opts) => api.get('/dashboard/summary', opts)

// Tick / untick an onboarding to-do.
export const setTodo = (id, done) => api.patch(`/dashboard/todos/${id}`, { done })

export const getLists = (opts) => api.get('/lists', opts)
export const getList = (id, opts) => api.get(`/lists/${id}`, opts)
export const createList = (body, opts) => api.post('/lists', body, opts)
export const renameList = (id, body, opts) => api.patch(`/lists/${id}`, body, opts)
export const duplicateList = (id, opts) => api.post(`/lists/${id}/duplicate`, undefined, opts)
export const deleteList = (id, opts) => api.del(`/lists/${id}`, opts)

export const getCampaigns = (opts) => api.get('/campaigns', opts)
export const createCampaign = (body, opts) => api.post('/campaigns', body, opts)
export const updateCampaign = (id, body, opts) => api.patch(`/campaigns/${id}`, body, opts)
export const deleteCampaign = (id, opts) => api.del(`/campaigns/${id}`, opts)
export const getCampaignBids = (id, opts) => api.get(`/campaigns/${id}/bids`, opts)
export const selectCampaignBid = (campaignId, bidId) => api.post(`/campaigns/${campaignId}/bids/${bidId}/select`)
export const getOrders = (opts) => api.get('/orders', opts)
export const getOrder = (id, opts) => api.get(`/orders/${id}`, opts)
export const payOrder = (id, opts) => api.post(`/orders/${id}/pay`, undefined, opts)
export const requestOrderChanges = (id, note, opts) => api.post(`/orders/${id}/request-changes`, { note }, opts)
export const approveOrder = (id, opts) => api.post(`/orders/${id}/approve`, undefined, opts)
export const getDeliverables = (params, opts) => api.get(`/deliverables${qs(params)}`, opts)
export const getDeliverable = (id, opts) => api.get(`/deliverables/${id}`, opts)
export const getReporting = (period, opts) => api.get(`/reporting?period=${encodeURIComponent(period)}`, opts)

export const exportDeliverables = (opts) => api.get('/deliverables/export', opts)
export const exportReporting = (period, opts) => api.get(`/reporting/export?period=${encodeURIComponent(period)}`, opts)
