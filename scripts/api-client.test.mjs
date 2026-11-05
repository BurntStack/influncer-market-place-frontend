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
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), ...options })
    if (String(url).endsWith('/auth/otp/request/')) return Response.json({ success: true, data: { challengeId: 'challenge-1' }, error: null, meta: {} })
    if (String(url).endsWith('/auth/otp/verify/')) return Response.json({ success: true, data: { access: 'old-token', refresh: 'refresh-1', user: { id: 'u1', role: 'brand' } }, error: null, meta: {} })
    if (String(url).endsWith('/auth/token/refresh/')) return Response.json({ success: true, data: { access: 'new-token', refresh: 'refresh-2' }, error: null, meta: {} })
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
  console.log('API envelope, OTP, paise, bearer, refresh, campaign and creator query checks passed.')
} finally {
  await vite.close()
}
