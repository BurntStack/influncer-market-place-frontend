import { creators as demoCreators } from '../data/creators.js'
import { apiData, apiRequest, fromPaise, getRefreshToken, getToken, listPage, toPaise } from '../lib/apiClient.js'

const followers = value => {
  if (typeof value === 'number') return value
  const text = String(value || '').toLowerCase()
  return (parseFloat(text) || 0) * (text.endsWith('m') ? 1000000 : text.endsWith('k') ? 1000 : 1)
}

export const normalizeCreator = creator => ({
  ...creator,
  id: creator.id,
  name: creator.name || creator.displayName || creator.fullName || 'Creator',
  image: creator.image || creator.avatar || creator.avatarUrl || creator.profileImage || '',
  category: creator.category || creator.categories?.join(', ') || '',
  location: creator.location || creator.city || '',
  platform: creator.platform || creator.primaryPlatform || '',
  followers: creator.followers || (creator.followerCount ? Intl.NumberFormat('en', { notation: 'compact' }).format(creator.followerCount) : ''),
  priceFrom: fromPaise(creator.priceFrom ?? creator.minPrice ?? creator.price),
})

const demoList = params => {
  let results = demoCreators.filter(creator => {
    const q = String(params.q || '').toLowerCase()
    return (!q || `${creator.name} ${creator.category} ${creator.location}`.toLowerCase().includes(q))
      && (!params.platform || params.platform === 'All' || creator.platform === params.platform)
      && (!params.category || creator.category.toLowerCase().includes(String(params.category).toLowerCase()))
      && (!params.city || creator.location.toLowerCase().includes(String(params.city).toLowerCase()))
      && (!params.priceMin || creator.priceFrom >= Number(params.priceMin))
      && (!params.priceMax || creator.priceFrom <= Number(params.priceMax))
  })
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 8
  return { results: results.slice((page - 1) * pageSize, page * pageSize), total: results.length, page, pageSize, totalPages: Math.max(1, Math.ceil(results.length / pageSize)) }
}

export const listCreators = async (params = {}, options = {}) => {
  if (!getToken() && !getRefreshToken()) return demoList(params)
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 8))
  const query = {
    q: params.q, category: params.category,
    location: params.city || params.location,
    platform: params.platform === 'All' ? undefined : params.platform,
    minPrice: params.priceMin ? toPaise(params.priceMin) : undefined,
    maxPrice: params.priceMax ? toPaise(params.priceMax) : undefined,
    limit: pageSize,
  }
  let cursor = null
  let result = { results: [], total: null, nextCursor: null }
  for (let index = 1; index <= page; index++) {
    result = listPage(await apiRequest('/creators/', { query: { ...query, cursor }, signal: options.signal }))
    cursor = result.nextCursor
    if (!cursor) break
  }
  let results = result.results.map(normalizeCreator)
  if (params.followersMin) results = results.filter(c => followers(c.followerCount ?? c.followers) >= Number(params.followersMin))
  if (params.followersMax) results = results.filter(c => followers(c.followerCount ?? c.followers) <= Number(params.followersMax))
  if (params.sort === 'price_asc') results.sort((a, b) => a.priceFrom - b.priceFrom)
  if (params.sort === 'price_desc') results.sort((a, b) => b.priceFrom - a.priceFrom)
  if (params.sort === 'followers') results.sort((a, b) => followers(b.followerCount ?? b.followers) - followers(a.followerCount ?? a.followers))
  const total = result.total ?? (cursor ? page * pageSize + 1 : (page - 1) * pageSize + results.length)
  return { results, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export const getFilters = async () => ({
  platforms: ['Instagram', 'YouTube', 'Facebook', 'X', 'LinkedIn'],
  cities: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kochi', 'Kolkata'],
  categories: ['Beauty', 'Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Comedy'],
  languages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam'],
})
export const getSuggestions = async () => []
export const saveMyCreatorProfile = profile => apiData('/creators/me/', {
  method: 'PATCH', body: {
    displayName: profile.displayName,
    bio: profile.bio,
    categories: profile.categories,
    location: profile.location,
    primaryPlatform: profile.primaryPlatform,
  },
})
export const getCreator = async (id, options = {}) => normalizeCreator(await apiData(`/creators/${encodeURIComponent(id)}/`, options))
export const getCreatorReviews = async (id, _params, options = {}) => listPage(await apiRequest(`/creators/${encodeURIComponent(id)}/reviews/`, options)).results
// A creator detail may embed packages. There is no documented brand-facing
// packages route, so avoid calling the creator-only /creators/me/packages/ URL.
export const getCreatorPackages = async (id, options = {}) => {
  const creator = await apiData(`/creators/${encodeURIComponent(id)}/`, options)
  return (creator?.packages || []).map(pkg => ({ ...pkg, price: fromPaise(pkg.price) }))
}
export const getSimilarCreators = async () => []
export const saveCreator = async () => { throw new Error('Choose a list to save this creator.') }
export const unsaveCreator = async () => { throw new Error('Choose a list to remove this creator.') }
export const addCartItem = async ({ packageId, brief = '' }) => apiData('/cart/', { method: 'POST', body: { packageId, brief } })
export const createOffer = async ({ creatorId, deliverable, budget, deadline, message, usageRights }) => apiData('/offers/', {
  method: 'POST', body: { creatorId, deliverable, budget: toPaise(budget), deadline: deadline || undefined, message, usageRights },
})
