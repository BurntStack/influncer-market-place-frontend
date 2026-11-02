import { creators as ALL } from '../data/creators.js'

const PACKAGES = {
  'ananya-rao': [
    { id: 1, title: '1 Instagram Reel (30-45 sec)', platform: 'Instagram', price: 8000, note: 'Includes 1 revision' },
    { id: 2, title: '1 Reel + 2 Stories', platform: 'Instagram', price: 12000, note: 'Story links included' },
    { id: 3, title: 'UGC Video (no posting)', platform: 'UGC', price: 5500, note: 'Raw file delivery' },
  ],
  'rohan-mehta': [
    { id: 4, title: '1 YouTube Integration (60 sec)', platform: 'YouTube', price: 12500, note: 'Mid-roll placement' },
    { id: 5, title: 'YouTube Short', platform: 'YouTube', price: 7000, note: 'Dedicated short' },
    { id: 6, title: 'Community post', platform: 'YouTube', price: 3000, note: 'Community tab post' },
  ],
  'meera-iyer': [
    { id: 7, title: '3 Instagram Stories', platform: 'Instagram', price: 6500, note: 'Swipe-up link included' },
    { id: 8, title: '1 Instagram Reel', platform: 'Instagram', price: 9000, note: '30-60 sec' },
    { id: 9, title: 'Blog feature', platform: 'Blog', price: 5000, note: 'SEO post' },
  ],
  'kabir-singh': [
    { id: 10, title: '1 Reel + 2 Stories', platform: 'Instagram', price: 9000, note: 'Fitness focus' },
    { id: 11, title: 'UGC Product video', platform: 'UGC', price: 5500, note: 'Raw delivery' },
    { id: 12, title: '3 Instagram Stories', platform: 'Instagram', price: 4500, note: 'Stories only' },
  ],
  'sana-qureshi': [
    { id: 13, title: '1 Instagram Photo Post', platform: 'Instagram', price: 7200, note: 'Styled flatlay or OOTD' },
    { id: 14, title: '1 Reel + 1 Post', platform: 'Instagram', price: 11000, note: 'Combo package' },
    { id: 15, title: 'Story series (5 slides)', platform: 'Instagram', price: 3500, note: 'Swipe story' },
  ],
  'priya-nair': [
    { id: 16, title: '1 Recipe Reel (UGC)', platform: 'UGC', price: 5500, note: 'Raw file, no posting' },
    { id: 17, title: '1 Recipe Reel + post', platform: 'Instagram', price: 7500, note: 'Posted to feed' },
    { id: 18, title: '3 Recipe Stories', platform: 'Instagram', price: 3500, note: 'Step-by-step cooking' },
  ],
  'arjun-das': [
    { id: 19, title: '1 YouTube Short', platform: 'YouTube', price: 15000, note: 'Brand integration' },
    { id: 20, title: '1 YouTube Short + Community post', platform: 'YouTube', price: 18000, note: 'Combo deal' },
    { id: 21, title: 'Instagram Reel (cross-post)', platform: 'Instagram', price: 10000, note: 'Cross-posted from YouTube' },
  ],
  'ishita-kapoor': [
    { id: 22, title: '1 Get-Ready-With-Me Reel', platform: 'Instagram', price: 10000, note: 'Full GRWM format' },
    { id: 23, title: 'Product demo Reel', platform: 'Instagram', price: 8500, note: '60 sec demo' },
    { id: 24, title: 'UGC tutorial', platform: 'UGC', price: 6500, note: 'Raw unboxing/tutorial' },
  ],
}

const REVIEWS = {
  'ananya-rao': [
    { id: 'r1', name: 'Plum Goodness', stars: 5, date: '2026-09-15', text: "Ananya captured exactly what we wanted. The Reel performed 3x better than our average. Will collaborate again." },
    { id: 'r2', name: 'Dot & Key', stars: 5, date: '2026-07-20', text: "Professional, on-brief, and completely authentic. Highly recommended." },
    { id: 'r3', name: 'SUGAR Cosmetics', stars: 4, date: '2026-05-08', text: "Great creativity and strong engagement. Delivery was a day late but the result was worth the wait." },
  ],
  'rohan-mehta': [
    { id: 'r4', name: 'boAt Lifestyle', stars: 5, date: '2026-08-10', text: "Rohan's review drove a measurable spike in product page visits. Clear, trustworthy content." },
    { id: 'r5', name: 'Noise', stars: 4, date: '2026-06-14', text: "Solid integration with honest opinions. Audience engagement was higher than expected." },
  ],
  'meera-iyer': [
    { id: 'r6', name: 'Airbnb India', stars: 5, date: '2026-09-01', text: "Meera's travel content was aspirational and on-brand. The Stories drove strong link clicks." },
    { id: 'r7', name: 'MakeMyTrip', stars: 5, date: '2026-07-11', text: "Genuine travel voice, great production quality. More bookings from her post than any other creator." },
    { id: 'r8', name: 'OYO', stars: 4, date: '2026-04-22', text: "Lovely content and a smooth collaboration. Would book again." },
  ],
  'kabir-singh': [
    { id: 'r9', name: 'MyProtein India', stars: 5, date: '2026-09-20', text: "Kabir's audience responded really well to our product launch. The Reel hit 200k views." },
    { id: 'r10', name: 'Healthkart', stars: 4, date: '2026-08-05', text: "Reliable, fit for category. The Stories got strong swipe-ups." },
  ],
  'sana-qureshi': [
    { id: 'r11', name: 'Manyavar', stars: 5, date: '2026-09-05', text: "Sana brought elegance to the product shoot. Engagement exceeded all targets." },
    { id: 'r12', name: 'W for Woman', stars: 4, date: '2026-06-30', text: "Great at styling and on-brand messaging. Will work with Sana for our next collection." },
  ],
  'priya-nair': [
    { id: 'r13', name: 'Haldirams', stars: 5, date: '2026-10-01', text: "Priya's recipe Reel felt completely natural and the engagement was through the roof. Best UGC we have ever used." },
    { id: 'r14', name: 'MTR Foods', stars: 5, date: '2026-08-18', text: "Authentic food content that our audience trusted immediately. Will collaborate on every launch." },
    { id: 'r15', name: 'iD Fresh', stars: 5, date: '2026-06-10', text: "Perfect for food brands. High-quality content, very professional." },
  ],
  'arjun-das': [
    { id: 'r16', name: 'Lenskart', stars: 4, date: '2026-09-12', text: "Arjun's comedy integration was creative and got huge reach. Very high production quality." },
    { id: 'r17', name: 'Swiggy', stars: 5, date: '2026-07-25', text: "The YouTube Short drove installs and was shared organically. Brilliant execution." },
  ],
  'ishita-kapoor': [
    { id: 'r18', name: 'FACES Canada', stars: 5, date: '2026-09-28', text: "Ishita's GRWM is exactly what beauty brands need. Authentic, detailed, and very persuasive." },
    { id: 'r19', name: 'Lakme', stars: 5, date: '2026-08-14', text: "Her tutorial style drives purchases. Smooth collaboration throughout." },
    { id: 'r20', name: 'RENEE Cosmetics', stars: 4, date: '2026-06-20', text: "Great production and good audience alignment. Delivered on time." },
  ],
}

const BIOS = {
  'ananya-rao': "Beauty and skincare creator based in Bengaluru. I focus on honest, ingredient-led content for Indian skin tones. My audience trusts real results over glossy ads, which is why every collaboration starts with a product I actually believe in.",
  'rohan-mehta': "Tech reviewer from Mumbai with a YouTube audience that wants depth, not hype. I break down the specs that matter and the experiences that last. Great for gadgets, apps, and anything that rewards a second look.",
  'meera-iyer': "Travel and lifestyle creator from Chennai. I cover India and Southeast Asia through the lens of slow travel, local food, and authentic stays. My Stories convert because I speak to an audience that plans ahead.",
  'kabir-singh': "Fitness creator based in Delhi. I cover training, nutrition, and recovery in a way that is accessible to everyday people. Strong results for supplement, apparel, and wellness brands.",
  'sana-qureshi': "Fashion and modest-wear creator from Hyderabad. I style for real occasions — weddings, eid, everyday elegance. My audience shops what I wear, which is why my product posts consistently drive link clicks.",
  'priya-nair': "Food creator from Kochi. I bring Kerala flavour to national brands through recipe content that is warm, real, and incredibly shareable. My UGC is used directly in ads by several of my long-term partners.",
  'arjun-das': "Comedy and entertainment creator from Pune. My YouTube Shorts reach an audience that is hard to get through traditional ads — 18-28-year-old Indians who skip everything else. Perfect for brands that want attention, not just impressions.",
  'ishita-kapoor': "Beauty and makeup creator from Jaipur. My GRWM videos drive purchase decisions because I walk my audience through the why, not just the how. Top choice for launches, new SKUs, and seasonal collections.",
}

const parseFollowers = (s) => {
  const str = String(s || '').toLowerCase().replace(/,/g, '')
  if (str.endsWith('k')) return parseFloat(str) * 1000
  if (str.endsWith('m')) return parseFloat(str) * 1000000
  return Number(str) || 0
}

export const listCreators = async (params = {}) => {
  let results = ALL.slice()

  const q = String(params.q || '').toLowerCase().trim()
  if (q) results = results.filter((c) =>
    (c.name + ' ' + c.category + ' ' + c.location).toLowerCase().includes(q),
  )
  if (params.platform && params.platform !== 'All')
    results = results.filter((c) => c.platform === params.platform)
  if (params.category)
    results = results.filter((c) => c.category?.toLowerCase().includes(params.category.toLowerCase()))
  if (params.city)
    results = results.filter((c) => c.location?.toLowerCase().includes(String(params.city).toLowerCase()))
  if (params.followersMin)
    results = results.filter((c) => parseFollowers(c.followers) >= Number(params.followersMin))
  if (params.followersMax)
    results = results.filter((c) => parseFollowers(c.followers) <= Number(params.followersMax))
  if (params.priceMin)
    results = results.filter((c) => Number(c.priceFrom) >= Number(params.priceMin))
  if (params.priceMax)
    results = results.filter((c) => Number(c.priceFrom) <= Number(params.priceMax))

  if (params.sort === 'price_asc') results.sort((a, b) => a.priceFrom - b.priceFrom)
  else if (params.sort === 'price_desc') results.sort((a, b) => b.priceFrom - a.priceFrom)
  else if (params.sort === 'followers')
    results.sort((a, b) => parseFollowers(b.followers) - parseFollowers(a.followers))

  const total = results.length
  const pageSize = Number(params.pageSize) || 8
  const page = Number(params.page) || 1
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return { results: results.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages }
}

export const getFilters = async () => ({
  platforms: ['Instagram', 'YouTube', 'Facebook', 'X', 'LinkedIn'],
  cities: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kochi', 'Kolkata'],
  categories: ['Beauty, Skincare', 'Fashion & Styling', 'Tech, Gadgets', 'Fitness, Health', 'Food, Home cooking', 'Lifestyle, Travel', 'Comedy, Entertainment'],
  languages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam'],
})

export const getSuggestions = async () => []

export const getCreator = async (id) => {
  const c = ALL.find((item) => item.id === id)
  if (!c) { const err = new Error('Creator not found.'); err.status = 404; throw err }
  return {
    ...c,
    bio: BIOS[id] || (c.category + ' creator based in ' + c.location + '.'),
    badges: c.topCreator ? ['Top Creator', 'Fast replies'] : ['Fast replies'],
    repliesWithin: '24h',
    reviewCount: (REVIEWS[id] || []).length || c.reviews,
  }
}

export const getCreatorPackages = async (id) => PACKAGES[id] || []

export const getCreatorReviews = async (id) => REVIEWS[id] || []

export const getSimilarCreators = async (id) => {
  const c = ALL.find((item) => item.id === id)
  if (!c) return []
  const [primary] = (c.category || '').split(',')
  return ALL.filter((item) => item.id !== id && item.category?.includes(primary.trim())).slice(0, 4)
}

export const saveCreator = async () => null
export const unsaveCreator = async () => null
export const addCartItem = async () => ({ message: 'Package added to cart.' })
export const createOffer = async () => ({ message: 'Offer sent.' })
