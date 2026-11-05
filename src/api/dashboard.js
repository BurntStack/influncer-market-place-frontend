import { apiData, collectPages, fromPaise, toPaise } from '../lib/apiClient.js'
import { listCreators } from './creators.js'

const amount = value => fromPaise(value)
const normalizeCampaign = campaign => ({
  ...campaign,
  budgetMin: amount(campaign.budgetMin),
  budgetMax: amount(campaign.budgetMax),
  applyBy: campaign.closesAt || campaign.applyBy,
  bids: campaign.bidCount ?? campaign.bids ?? 0,
})
const normalizeOrder = order => ({ ...order, amount: amount(order.amount ?? order.price) })
const normalizeBid = bid => ({ ...bid, price: amount(bid.price) })

export const getSummary = async () => {
  const [campaigns, orders, creators] = await Promise.all([
    getCampaigns(), getOrders(), listCreators({ pageSize: 8 }),
  ])
  return {
    greetingName: null,
    stats: [
      { label: 'Active jobs', value: String(campaigns.filter(c => !['closed', 'completed', 'cancelled'].includes(c.status)).length), sub: 'Your campaigns' },
      { label: 'Bids to review', value: String(campaigns.reduce((sum, c) => sum + Number(c.bidCount ?? c.bids ?? 0), 0)), sub: 'Across your campaigns' },
      { label: 'Orders', value: String(orders.length), sub: 'Your collaborations' },
      { label: 'Completed', value: String(orders.filter(o => ['completed', 'released'].includes(o.status)).length), sub: 'Approved orders' },
    ],
    topCreators: creators.results,
  }
}
export const setTodo = async () => null

export const getLists = (options = {}) => collectPages('/lists/', options)
export const getList = id => apiData(`/lists/${encodeURIComponent(id)}/`)
export const createList = body => apiData('/lists/', { method: 'POST', body: { name: body.name } })
export const renameList = (id, body) => apiData(`/lists/${encodeURIComponent(id)}/`, { method: 'PATCH', body: { name: body.name } })
export const deleteList = id => apiData(`/lists/${encodeURIComponent(id)}/`, { method: 'DELETE' })
export const duplicateList = async id => {
  const original = await getList(id)
  const copy = await createList({ name: `${original.name} copy` })
  for (const creator of original.creators || []) {
    await apiData(`/lists/${encodeURIComponent(copy.id)}/creators/`, { method: 'POST', body: { creatorId: creator.id || creator } })
  }
  return copy
}

export const getCampaigns = async (options = {}) => (await collectPages('/campaigns/', options)).map(normalizeCampaign)
export const createCampaign = body => apiData('/campaigns/', {
  method: 'POST', body: {
    title: body.title, brief: body.brief, platform: body.platform,
    deliverables: body.deliverables, budgetMin: toPaise(body.budgetMin), budgetMax: toPaise(body.budgetMax),
    closesAt: body.applyBy ? new Date(`${body.applyBy}T23:59:59`).toISOString() : undefined,
    usageRights: body.usageRights,
  },
}).then(normalizeCampaign)
export const updateCampaign = (id, body) => apiData(`/campaigns/${encodeURIComponent(id)}/`, {
  method: 'PATCH', body: {
    title: body.title, brief: body.brief, platform: body.platform,
    deliverables: body.deliverables, budgetMin: toPaise(body.budgetMin), budgetMax: toPaise(body.budgetMax),
    closesAt: body.applyBy ? new Date(`${body.applyBy}T23:59:59`).toISOString() : undefined,
    usageRights: body.usageRights,
  },
}).then(normalizeCampaign)
export const deleteCampaign = id => apiData(`/campaigns/${encodeURIComponent(id)}/close/`, { method: 'POST' })
export const getCampaignBids = async id => (await collectPages(`/campaigns/${encodeURIComponent(id)}/bids/`)).map(normalizeBid)
export const selectCampaignBid = (campaignId, bidId) => apiData(`/campaigns/${encodeURIComponent(campaignId)}/bids/${encodeURIComponent(bidId)}/select/`, { method: 'POST' })

export const getOrders = async (options = {}) => (await collectPages('/orders/', options)).map(normalizeOrder)
export const getOrder = async id => normalizeOrder(await apiData(`/orders/${encodeURIComponent(id)}/`))
export const payOrder = async () => { throw new Error('Payment is handled through checkout, not this screen.') }
export const requestOrderChanges = (id, feedback) => apiData(`/orders/${encodeURIComponent(id)}/revisions/`, { method: 'POST', body: { feedback } })
export const approveOrder = id => apiData(`/orders/${encodeURIComponent(id)}/approve/`, { method: 'POST' })

export const getDeliverables = async (params = {}) => {
  const orders = await getOrders()
  const groups = await Promise.all(orders.map(async order => {
    const results = await collectPages(`/orders/${encodeURIComponent(order.id)}/deliverables/`)
    return results.map(deliverable => ({
      ...deliverable, orderId: order.id, campaignId: order.campaignId || order.campaign?.id, creator: order.creator,
      creatorId: order.creator?.id || order.creatorId,
      job: order.campaign?.title || order.campaignTitle || order.deliverable || '',
      content: deliverable.title || deliverable.note || 'Delivered content',
      type: deliverable.type || order.platform || 'Content',
      url: deliverable.contentUrl,
      deliveredAt: deliverable.createdAt,
    }))
  }))
  let results = groups.flat()
  if (params.q) results = results.filter(item => `${item.content} ${item.job} ${item.type}`.toLowerCase().includes(params.q.toLowerCase()))
  if (params.jobId) results = results.filter(item => item.campaignId === params.jobId)
  if (params.platform) results = results.filter(item => item.type.toLowerCase().includes(params.platform.toLowerCase()))
  if (params.from) results = results.filter(item => !item.deliveredAt || item.deliveredAt.slice(0, 10) >= params.from)
  return results
}
export const getDeliverable = async id => (await getDeliverables()).find(item => String(item.id) === String(id)) || null
export const exportDeliverables = async () => { throw new Error('The backend does not provide an export endpoint yet.') }
export const exportReporting = exportDeliverables
export const getReporting = async () => { throw new Error('Reporting is not available from the backend yet.') }
