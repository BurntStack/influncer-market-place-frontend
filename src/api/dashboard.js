import {
  homeStats,
  topCreators,
  jobs as SEED_JOBS,
  jobsCompleted,
  orders as SEED_ORDERS,
  deliverables as SEED_DELIVERABLES,
  lists as SEED_LISTS,
  reportStats,
  viewsByMonth,
  spendByPlatform,
  reportTopCreators,
  getCreator,
} from '../data/dashboard.js'

// In-memory state seeded from mock data. Resets on page reload — fine for demo.

let _campaigns = [
  ...SEED_JOBS.map((j) => ({
    ...j,
    status: j.status === 'Open for bids' ? 'open_for_bids'
      : j.status === 'In progress' ? 'in_progress'
      : j.status.toLowerCase().replace(/ /g, '_'),
    platform: (j.meta || '').split(' · ')[0] || 'Instagram',
    deliverables: (j.meta || '').split(' · ')[1] || '',
    budgetMin: j.budgetMin || 5000,
    budgetMax: j.budgetMax || 15000,
  })),
  ...jobsCompleted.map((j, i) => ({
    id: `completed-${i}`,
    title: j.title,
    status: 'completed',
    platform: 'Instagram',
    deliverables: '1 Instagram Reel',
    budgetMin: j.amount - 1000,
    budgetMax: j.amount,
    bids: 0,
  })),
]

const MOCK_BIDS = {
  'festive-snack': [
    { id: 'b1', creatorId: 'ananya-rao', price: 8500, message: "I'd love to create an authentic Diwali-themed Reel that feels native to Instagram. My beauty audience overlaps with gift-buyers — great fit for a hamper launch.", expectedViews: 52000, deliveryDays: 5, status: 'pending' },
    { id: 'b2', creatorId: 'priya-nair', price: 6000, message: "A food-forward hamper story is exactly in my wheelhouse. I'll style it as an unboxing + recipe tie-in, which always performs well for me.", expectedViews: 28000, deliveryDays: 7, status: 'pending' },
    { id: 'b3', creatorId: 'arjun-das', price: 14000, message: 'My audience loves snack content and I can put your hamper in front of 400k people with a comedy-format Short. High energy, high recall.', expectedViews: 380000, deliveryDays: 4, status: 'pending' },
  ],
  'masala-soda': [
    { id: 'b4', creatorId: 'meera-iyer', price: 6500, message: "Lifestyle + food is my exact lane. I'll shoot 3 UGC clips in natural settings — rooftop, kitchen, street — that feel summer-authentic.", expectedViews: 35000, deliveryDays: 6, status: 'pending' },
    { id: 'b5', creatorId: 'sana-qureshi', price: 7200, message: 'My audience buys what I feature, and summer drinks are highly seasonal content.', expectedViews: 60000, deliveryDays: 5, status: 'pending' },
    { id: 'b6', creatorId: 'ishita-kapoor', price: 8000, message: "I'll work the soda into a summer-ready content format — perfect overlap between beauty self-care and refreshment.", expectedViews: 72000, deliveryDays: 4, status: 'pending' },
  ],
}

let _orders = SEED_ORDERS.map((o) => ({ ...o }))
let _deliverables = SEED_DELIVERABLES.map((d) => ({ ...d }))
let _lists = SEED_LISTS.map((l) => ({ ...l }))

// --- Dashboard home ---

export const getSummary = async () => ({ greetingName: null, stats: homeStats, topCreators })

export const setTodo = async () => null

// --- Lists ---

export const getLists = async () => _lists
export const getList = async (id) => _lists.find((l) => l.id === id) || null

export const createList = async ({ name }) => {
  const item = { id: `l${Date.now()}`, name, count: 0, covers: [], updated: 'Just now' }
  _lists = [..._lists, item]
  return item
}

export const renameList = async (id, { name }) => {
  _lists = _lists.map((l) => (l.id === id ? { ...l, name } : l))
  return null
}

export const duplicateList = async (id) => {
  const original = _lists.find((l) => l.id === id)
  if (!original) return null
  const copy = { ...original, id: `l${Date.now()}`, name: `${original.name} copy`, updated: 'Just now' }
  _lists = [..._lists, copy]
  return copy
}

export const deleteList = async (id) => {
  _lists = _lists.filter((l) => l.id !== id)
  return null
}

// --- Campaigns ---

export const getCampaigns = async () => _campaigns

export const createCampaign = async (body) => {
  const campaign = { ...body, id: `c${Date.now()}`, status: 'open_for_bids', bids: 0, bidCount: 0 }
  _campaigns = [campaign, ..._campaigns]
  return campaign
}

export const updateCampaign = async (id, body) => {
  _campaigns = _campaigns.map((c) => (c.id === id ? { ...c, ...body } : c))
  return _campaigns.find((c) => c.id === id) || null
}

export const deleteCampaign = async (id) => {
  _campaigns = _campaigns.filter((c) => c.id !== id)
  return null
}

export const getCampaignBids = async (id) => {
  const bids = MOCK_BIDS[id] || []
  return bids.map((bid) => ({
    ...bid,
    creator: { ...(getCreator(bid.creatorId) || { id: bid.creatorId, name: 'Creator' }) },
  }))
}

export const selectCampaignBid = async (campaignId) => {
  _campaigns = _campaigns.map((c) => (c.id === campaignId ? { ...c, status: 'in_progress' } : c))
  return null
}

// --- Orders ---

export const getOrders = async () => _orders

export const getOrder = async (id) => _orders.find((o) => o.id === id) || null

export const payOrder = async () => null

export const requestOrderChanges = async (id) => {
  _orders = _orders.map((o) => (o.id === id ? { ...o, status: 'Changes requested' } : o))
  return null
}

export const approveOrder = async (id) => {
  _orders = _orders.map((o) =>
    o.id === id ? { ...o, status: 'Completed', statusTone: 'green', payment: 'Released' } : o,
  )
  return null
}

// --- Deliverables ---

export const getDeliverables = async (params = {}) => {
  let items = _deliverables.slice()
  if (params.q) {
    const q = String(params.q).toLowerCase()
    items = items.filter((d) => (d.content + ' ' + d.job + ' ' + d.type).toLowerCase().includes(q))
  }
  if (params.platform && params.platform !== 'All')
    items = items.filter((d) => d.type?.toLowerCase().includes(String(params.platform).toLowerCase()))
  if (params.jobId) {
    const campaign = _campaigns.find((c) => c.id === params.jobId)
    if (campaign) items = items.filter((d) => d.job === campaign.title || d.jobId === params.jobId)
  }
  return items
}

export const getDeliverable = async (id) => _deliverables.find((d) => d.id === id) || null

export const exportDeliverables = async () => null
export const exportReporting = async () => null

// --- Reporting ---

export const getReporting = async () => ({
  stats: reportStats,
  viewsByMonth,
  spendByPlatform,
  topCreators: reportTopCreators,
})
