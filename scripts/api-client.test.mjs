import assert from 'node:assert/strict'
import { createServer } from 'vite'

const values = new Map()
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
}

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const api = await vite.ssrLoadModule('/src/lib/apiClient.js')
  const auth = await vite.ssrLoadModule('/src/lib/auth.js')
  const dashboard = await vite.ssrLoadModule('/src/api/dashboard.js')
  const creators = await vite.ssrLoadModule('/src/api/creators.js')
  assert.equal(api.toPaise(11180), 1118000)
  assert.equal(api.fromPaise({ amount: 1118000, currency: 'INR' }), 11180)

  const calls = []
  let verifyRole = 'brand'
  let verifyId = 'u1'
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), ...options })
    if (String(url).endsWith('/auth/otp/request/')) return Response.json({ success: true, data: { challengeId: 'challenge-1' }, error: null, meta: {} })
    if (String(url).endsWith('/auth/otp/verify/')) return Response.json({ success: true, data: { access: 'old-token', refresh: 'refresh-1', user: { id: verifyId, ...(verifyRole ? { role: verifyRole } : {}) } }, error: null, meta: {} })
    if (String(url).endsWith('/auth/signup/complete/')) return Response.json({ success: true, data: { user: { id: verifyId, fullName: 'Test User' } }, error: null, meta: {} })
    if (String(url).endsWith('/auth/me/')) return Response.json({ success: true, data: { id: verifyId, fullName: 'Test User' }, error: null, meta: {} })
    if (String(url).endsWith('/brands/me/')) return Response.json({ success: verifyId === 'u3', data: verifyId === 'u3' ? { id: 'brand-3' } : null, error: verifyId === 'u3' ? null : { code: 'NOT_FOUND' }, meta: {} }, { status: verifyId === 'u3' ? 200 : 404 })
    if (String(url).endsWith('/creators/me/')) return Response.json({ success: false, data: null, error: { code: 'NOT_FOUND' }, meta: {} }, { status: 404 })
    if (String(url).endsWith('/auth/token/refresh/')) {
      const refresh = JSON.parse(options.body).refresh
      if (refresh === 'refresh-network') throw new Error('Network offline')
      if (refresh === 'refresh-invalid') return Response.json({ success: false, data: null, error: { code: 'INVALID_REFRESH_TOKEN' }, meta: {} }, { status: 401 })
      return Response.json({ success: true, data: { access: 'new-token', refresh: 'refresh-2' }, error: null, meta: {} })
    }
    if (String(url).endsWith('/orders/')) {
      if (options.headers.Authorization === 'Bearer old-token') return Response.json({ success: false, data: null, error: { code: 'TOKEN_EXPIRED', message: 'Expired' }, meta: {} }, { status: 401 })
      return Response.json({ success: true, data: [{ id: 'o1' }], error: null, meta: { nextCursor: null } })
    }
    if (String(url).endsWith('/campaigns/') && options.method === 'POST') return Response.json({ success: true, data: { id: 'c1', budgetMin: { amount: 500000 }, budgetMax: { amount: 1000000 } }, error: null, meta: {} })
    if (String(url).includes('/creators/?')) return Response.json({ success: true, data: [{ id: 'creator-1', displayName: 'Creator One', priceFrom: { amount: 1118000 } }], error: null, meta: { nextCursor: null } })
    throw new Error(`Unexpected URL: ${url}`)
  }

  assert.equal((await auth.requestOtp('9876543210')).challengeId, 'challenge-1')
  assert.equal(calls[0].headers.Authorization, undefined)
  assert.deepEqual(JSON.parse(calls[0].body), { channel: 'sms', destination: '9876543210' })
  await auth.verifyOtp('challenge-1', '123456')
  assert.equal(auth.postLoginPath(auth.getUser().role), '/dashboard')
  assert.equal(auth.postLoginPath('brand', '/dashboard/orders'), '/dashboard/orders')
  assert.equal(auth.postLoginPath('creator', '/dashboard/orders'), '/creator/workspace')
  assert.equal(auth.postLoginPath(null), '/choose-role')
  assert.equal(api.getToken(), 'old-token')
  const orders = await api.apiRequest('/orders/')
  assert.deepEqual(orders.data, [{ id: 'o1' }])
  assert.equal(api.getToken(), 'new-token')
  assert.equal(api.getRefreshToken(), 'refresh-2')
  assert.equal(calls.filter(call => call.url.endsWith('/orders/')).length, 2)
  const campaign = await dashboard.createCampaign({ title: 'Campaign', brief: 'Brief', platform: 'Instagram', deliverables: 'One Reel', budgetMin: 5000, budgetMax: 10000, applyBy: '2026-12-01', usageRights: 'Organic social' })
  assert.equal(campaign.budgetMin, 5000)
  const campaignBody = JSON.parse(calls.find(call => call.url.endsWith('/campaigns/')).body)
  assert.equal(campaignBody.budgetMax, 1000000)
  assert.equal('applyBy' in campaignBody, false)
  const page = await creators.listCreators({ city: 'Mumbai', priceMin: 5000, pageSize: 8 })
  assert.equal(page.results[0].priceFrom, 11180)
  const creatorUrl = new URL(calls.find(call => call.url.includes('/creators/?')).url)
  assert.equal(creatorUrl.searchParams.get('location'), 'Mumbai')
  assert.equal(creatorUrl.searchParams.get('minPrice'), '500000')
  api.setToken('old-token')
  api.setRefreshToken('refresh-network')
  await assert.rejects(api.apiRequest('/orders/'), /Network offline/)
  assert.equal(api.getRefreshToken(), 'refresh-network')
  api.setRefreshToken('refresh-invalid')
  await assert.rejects(api.apiRequest('/orders/'), error => error.code === 'INVALID_REFRESH_TOKEN')
  assert.equal(auth.isAuthed(), false)
  await auth.verifyOtp('challenge-1', '123456')
  values.set('linkloom_session_started', String(Date.now() - 15 * 24 * 60 * 60 * 1000 - 1))
  assert.equal(auth.isAuthed(), false)
  assert.equal(auth.getUser(), null)
  values.delete('linkloom_account_roles')
  verifyRole = null
  await auth.verifyOtp('challenge-1', '123456', '9876543210')
  await auth.completeSignup({ role: 'brand', fullName: 'Test User', brandName: 'Test Brand' })
  assert.equal(auth.getUser().role, 'brand')
  api.clearToken()
  values.delete('linkloom_user')
  const returningBrand = await auth.verifyOtp('challenge-1', '123456', '9876543210')
  assert.equal((await auth.resolveLoginUser(returningBrand)).role, 'brand')
  verifyId = 'u2'
  api.clearToken()
  values.delete('linkloom_user')
  await auth.verifyOtp('challenge-1', '123456', '9123456789')
  await auth.completeSignup({ role: 'creator', fullName: 'Test Creator', displayName: 'Creator' })
  assert.equal(auth.getUser().role, 'creator')
  api.clearToken()
  values.delete('linkloom_user')
  const returningCreator = await auth.verifyOtp('challenge-1', '123456', '9123456789')
  assert.equal((await auth.resolveLoginUser(returningCreator)).role, 'creator')
  verifyId = 'u3'
  api.clearToken()
  values.delete('linkloom_user')
  const returningBrandOnNewDevice = await auth.verifyOtp('challenge-1', '123456', '9234567890')
  assert.equal((await auth.resolveLoginUser(returningBrandOnNewDevice)).role, 'brand')
  console.log('API envelope, OTP, paise, bearer, refresh, campaign and creator query checks passed.')
} finally {
  await vite.close()
}
