// Mock data for the logged-in dashboard. Swap for real API responses later.
import { creators, getCreator } from './creators.js'

export const brand = { name: 'Nimbu Foods', plan: 'Free', initial: 'N' }

/* ---------- Home ---------- */
export const homeStats = [
  { label: 'Active jobs', value: '2', sub: '+1 this week', tone: 'green' },
  { label: 'Bids to review', value: '18', sub: '6 new since yesterday', tone: 'green' },
  { label: 'Held in escrow', value: '₹23,500', sub: 'Across 3 orders' },
  { label: 'Content delivered', value: '6', sub: '2 awaiting approval' },
]

// Top creators shown on the home + search (reuse the catalogue with dashboard badges)
export const topCreators = creators.map((c, i) => ({
  ...c,
  badge: [0, 2, 5].includes(i) ? 'Top creator' : 'Responds fast',
}))

/* ---------- Jobs ---------- */
export const jobTabs = [
  { key: 'all', label: 'All', count: 5 },
  { key: 'open', label: 'Open for bids', count: 2 },
  { key: 'progress', label: 'In progress', count: 1 },
  { key: 'completed', label: 'Completed', count: 2 },
  { key: 'drafts', label: 'Drafts', count: 0 },
]

export const jobs = [
  {
    id: 'festive-snack',
    title: 'Festive snack hamper launch',
    status: 'Open for bids',
    tone: 'green',
    meta: 'Instagram · 1 Reel + 2 Stories · Posted 3 days ago',
    budgetMin: 5000,
    budgetMax: 15000,
    bids: 12,
    closes: 'Closes in 2 days',
    bidders: ['ananya-rao', 'priya-nair', 'arjun-das'],
  },
  {
    id: 'masala-soda',
    title: 'Nimbu masala soda — summer UGC',
    status: 'Open for bids',
    tone: 'green',
    meta: 'UGC · 3 short videos · Posted 1 day ago',
    budgetMin: 3000,
    budgetMax: 8000,
    bids: 7,
    closes: 'Closes in 5 days',
    bidders: ['meera-iyer', 'sana-qureshi', 'ishita-kapoor'],
  },
  {
    id: 'diwali-gift',
    title: 'Diwali gift box unboxing',
    status: 'In progress',
    tone: 'orange',
    meta: 'YouTube · 1 Short + community post · Started 4 Oct',
    budgetMin: 10000,
    budgetMax: 25000,
    hired: 'priya-nair',
    escrowNote: '₹12,000 held in escrow · Draft due 30 Oct',
  },
]

export const jobsCompleted = [
  { title: 'Monsoon chai Reel', with: 'Kabir Singh', amount: 9000, paid: 'Paid out 12 Oct', creatorId: 'kabir-singh' },
  { title: 'Independence Day giveaway', with: 'Ananya Rao', amount: 8000, paid: 'Paid out 18 Aug', creatorId: 'ananya-rao' },
]

/* ---------- Orders ---------- */
export const orderStats = [
  { label: 'Held in escrow', value: '₹23,500', sub: '3 active orders', icon: '🔒' },
  { label: 'Released this month', value: '₹17,000', sub: '2 orders completed' },
  { label: 'Awaiting your approval', value: '1', sub: 'Draft submitted yesterday' },
]

export const orderTabs = [
  { key: 'all', label: 'All', count: 5 },
  { key: 'active', label: 'Active', count: 3 },
  { key: 'completed', label: 'Completed', count: 2 },
  { key: 'cancelled', label: 'Cancelled', count: 0 },
]

export const orders = [
  { id: '#XX-1048', deliverable: 'YouTube Short + post', creatorId: 'priya-nair', amount: 12000, payment: 'Held in escrow', due: 'Draft due 30 Oct', status: 'Draft submitted', statusTone: 'blue' },
  { id: '#XX-1047', deliverable: '1 Reel + 2 Stories', creatorId: 'ananya-rao', amount: 7500, payment: 'Held in escrow', due: 'Due 2 Nov', status: 'In progress', statusTone: 'gray' },
  { id: '#XX-1045', deliverable: '3 UGC videos', creatorId: 'meera-iyer', amount: 4000, payment: 'Held in escrow', due: 'Due 28 Oct', status: 'Revision asked', statusTone: 'pink' },
  { id: '#XX-1039', deliverable: '1 Reel + link in bio', creatorId: 'kabir-singh', amount: 9000, payment: 'Released', due: 'Done 12 Oct', status: 'Completed', statusTone: 'green' },
  { id: '#XX-1031', deliverable: 'Giveaway Reel', creatorId: 'ananya-rao', amount: 8000, payment: 'Released', due: 'Done 18 Aug', status: 'Completed', statusTone: 'green' },
]

/* ---------- Deliverables ---------- */
export const deliverables = [
  { id: 'd1', content: 'Festive hamper Reel', type: 'Instagram Reel', creatorId: 'ananya-rao', job: 'Festive snack hamper launch', delivered: '24 Oct 2026', status: 'Approved', tone: 'green' },
  { id: 'd2', content: 'Gift box unboxing — draft 1', type: 'YouTube Short', creatorId: 'priya-nair', job: 'Diwali gift box unboxing', delivered: '23 Oct 2026', status: 'Needs review', tone: 'yellow' },
  { id: 'd3', content: 'Masala soda UGC #1', type: 'Instagram Reel', creatorId: 'meera-iyer', job: 'Nimbu masala soda — UGC', delivered: '21 Oct 2026', status: 'Live', tone: 'blue' },
  { id: 'd4', content: 'Masala soda UGC #2', type: 'Instagram Reel', creatorId: 'meera-iyer', job: 'Nimbu masala soda — UGC', delivered: '21 Oct 2026', status: 'Revision asked', tone: 'pink' },
  { id: 'd5', content: 'Monsoon chai Reel', type: 'Instagram Reel', creatorId: 'kabir-singh', job: 'Monsoon chai Reel', delivered: '9 Oct 2026', status: 'Live', tone: 'blue' },
  { id: 'd6', content: 'Independence Day giveaway', type: 'Instagram Reel', creatorId: 'ananya-rao', job: 'Independence Day giveaway', delivered: '14 Aug 2026', status: 'Live', tone: 'blue' },
]

/* ---------- Lists ---------- */
export const lists = [
  { id: 'l1', name: 'Diwali campaign shortlist', count: 8, updated: 'Updated 2 days ago', covers: ['ananya-rao', 'priya-nair', 'ishita-kapoor'] },
  { id: 'l2', name: 'Beauty micro-creators', count: 12, updated: 'Updated 5 days ago', covers: ['ishita-kapoor', 'ananya-rao', 'meera-iyer'] },
  { id: 'l3', name: 'Bengaluru food creators', count: 5, updated: 'Updated 1 week ago', covers: ['priya-nair', 'kabir-singh', 'rohan-mehta'] },
  { id: 'l4', name: 'UGC for summer ads', count: 6, updated: 'Updated 2 weeks ago', covers: ['meera-iyer', 'sana-qureshi', 'ishita-kapoor'] },
  { id: 'l5', name: 'Tech reviewers (YouTube)', count: 4, updated: 'Updated 3 weeks ago', covers: ['rohan-mehta', 'arjun-das', 'kabir-singh'] },
  { id: 'l6', name: 'Fitness & wellness', count: 7, updated: 'Updated 1 month ago', covers: ['kabir-singh', 'arjun-das', 'sana-qureshi'] },
]

/* ---------- Reporting ---------- */
export const reportStats = [
  { label: 'Total spend', value: '₹1,42,500', sub: '+18% vs last period', tone: 'green' },
  { label: 'Total views', value: '2.4M', sub: '+32% vs last period', tone: 'green' },
  { label: 'Engagement rate', value: '4.8%', sub: '+0.6 pts', tone: 'green' },
  { label: 'Cost per 1k views', value: '₹59', sub: '−12% (cheaper)', tone: 'green' },
]

export const viewsByMonth = [
  { month: 'May', instagram: 180, youtube: 90 },
  { month: 'Jun', instagram: 230, youtube: 120 },
  { month: 'Jul', instagram: 320, youtube: 150 },
  { month: 'Aug', instagram: 420, youtube: 190 },
  { month: 'Sep', instagram: 380, youtube: 200 },
  { month: 'Oct', instagram: 620, youtube: 210 },
]

export const spendByPlatform = [
  { label: 'Instagram', amount: '₹91,200', pct: 64, color: 'var(--pink)' },
  { label: 'YouTube', amount: '₹34,200', pct: 24, color: '#7c6cff' },
  { label: 'UGC (no posting)', amount: '₹17,100', pct: 12, color: '#f5b02e' },
]

export const reportTopCreators = [
  { creatorId: 'priya-nair', posts: 2, views: '612k', engagement: '6.1%', spend: '₹19,500', cpv: '₹32' },
  { creatorId: 'kabir-singh', posts: 1, views: '488k', engagement: '5.4%', spend: '₹9,000', cpv: '₹18' },
  { creatorId: 'ananya-rao', posts: 3, views: '540k', engagement: '4.9%', spend: '₹23,500', cpv: '₹44' },
  { creatorId: 'meera-iyer', posts: 3, views: '310k', engagement: '4.2%', spend: '₹12,000', cpv: '₹39' },
  { creatorId: 'arjun-das', posts: 1, views: '402k', engagement: '3.6%', spend: '₹15,000', cpv: '₹37' },
]

export { getCreator }
