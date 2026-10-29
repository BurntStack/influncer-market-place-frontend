// Creators: search, discovery, profile, shortlist (docs/API.md sections 2-3).
import { api, qs } from '../lib/apiClient.js'

// GET /creators — paginated search. Returns the pagination envelope
// { results, total, page, pageSize, totalPages }.
export const listCreators = (params, opts) => api.get(`/creators${qs(params)}`, opts)

// Chips under the hero search + data-driven filter dropdown options.
export const getSuggestions = (opts) => api.get('/creators/suggestions', opts)
export const getFilters = (opts) => api.get('/creators/filters', opts)

// GET /creators/:id and its sub-resources (all login-gated).
export const getCreator = (id, opts) => api.get(`/creators/${id}`, opts)
export const getCreatorPackages = (id, opts) => api.get(`/creators/${id}/packages`, opts)
export const getCreatorReviews = (id, params, opts) =>
  api.get(`/creators/${id}/reviews${qs(params)}`, opts)
export const getSimilarCreators = (id, opts) => api.get(`/creators/${id}/similar`, opts)

// Shortlist heart (204 on success).
export const saveCreator = (id) => api.post(`/creators/${id}/save`)
export const unsaveCreator = (id) => api.del(`/creators/${id}/save`)
export const addCartItem = (body, opts) => api.post('/cart/items', body, opts)
export const createOffer = (body, opts) => api.post('/offers', body, opts)
