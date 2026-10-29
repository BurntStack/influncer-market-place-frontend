import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { listCreators, getFilters } from '../api/creators.js'
import CreatorCard from '../components/CreatorCard.jsx'
import Dropdown from '../components/Dropdown.jsx'
import './FindCreators.css'

const PAGE_SIZE = 8

// UI sort label -> API `sort` value.
const SORT_OPTIONS = ['Recommended', 'Trending', 'Price: low to high', 'Price: high to low', 'Most followers']
const SORT_MAP = {
  Recommended: 'recommended',
  Trending: 'trending',
  'Price: low to high': 'price_asc',
  'Price: high to low': 'price_desc',
  'Most followers': 'followers',
}
// API value -> UI label (for seeding sort from a suggestion/URL).
const SORT_LABEL = Object.fromEntries(Object.entries(SORT_MAP).map(([k, v]) => [v, k]))

// Buckets that translate a chip choice into min/max query params.
const FOLLOWER_BUCKETS = {
  '1k–10k': { followersMin: 1000, followersMax: 10000 },
  '10k–100k': { followersMin: 10000, followersMax: 100000 },
  '100k–500k': { followersMin: 100000, followersMax: 500000 },
  '500k+': { followersMin: 500000 },
}
const PRICE_BUCKETS = {
  'Under ₹5,000': { priceMax: 5000 },
  '₹5,000–₹10,000': { priceMin: 5000, priceMax: 10000 },
  '₹10,000+': { priceMin: 10000 },
}

// Find the bucket label whose min/max match the given URL params (so a
// suggestion like {priceMax:5000} selects the "Under ₹5,000" chip).
const bucketFor = (buckets, parts) =>
  Object.keys(buckets).find((label) =>
    Object.entries(parts).every(([k, v]) => String(buckets[label][k] ?? '') === String(v ?? '')),
  )

// Static fallbacks used until GET /creators/filters responds (or if it fails).
const FALLBACK_FILTERS = {
  platforms: ['Instagram', 'YouTube', 'Facebook', 'X', 'LinkedIn'],
  cities: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'],
  categories: ['Beauty, Skincare', 'Fashion & Styling', 'Tech & Gadgets', 'Fitness & Health'],
  languages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'],
}

export default function FindCreators() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [platform, setPlatform] = useState('All')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState('Recommended')
  const [category, setCategory] = useState('') // from suggestions; no UI chip
  const [page, setPage] = useState(1)

  const [options, setOptions] = useState(FALLBACK_FILTERS)
  const [data, setData] = useState({ results: [], total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  // Seed state from the URL. The hero search links here with ?q=&platform=,
  // and the suggestion chips add ?category=&city=&sort=&priceMax=&followersMin=…
  useEffect(() => {
    const g = (k) => searchParams.get(k) || ''
    if (searchParams.has('q')) setQuery(searchParams.get('q') || '')
    setPlatform(g('platform') || 'All')
    setCategory(g('category'))
    const sortRaw = g('sort')
    if (SORT_LABEL[sortRaw]) setSort(SORT_LABEL[sortRaw])

    const city = g('city')
    const priceBucket = bucketFor(PRICE_BUCKETS, {
      priceMin: g('priceMin') || undefined,
      priceMax: g('priceMax') || undefined,
    })
    const followerBucket = bucketFor(FOLLOWER_BUCKETS, {
      followersMin: g('followersMin') || undefined,
      followersMax: g('followersMax') || undefined,
    })
    setFilters((f) => ({
      ...f,
      ...(city ? { city } : {}),
      ...(priceBucket ? { price: priceBucket } : {}),
      ...(followerBucket ? { followers: followerBucket } : {}),
    }))
    setPage(1)
  }, [searchParams])

  // Data-driven dropdown options.
  useEffect(() => {
    getFilters()
      .then((f) => f && setOptions({ ...FALLBACK_FILTERS, ...f }))
      .catch(() => {}) // fall back to the static lists
  }, [])

  // Translate UI state into query params for GET /creators.
  const params = useMemo(() => {
    const p = {
      q: query.trim() || undefined,
      platform: platform !== 'All' ? platform : undefined,
      category: category || undefined,
      contentType: filters.content,
      city: filters.city,
      gender: filters.gender && filters.gender !== 'Any' ? filters.gender : undefined,
      age: filters.age,
      language: filters.language,
      sort: SORT_MAP[sort],
      page,
      pageSize: PAGE_SIZE,
      ...(FOLLOWER_BUCKETS[filters.followers] || {}),
      ...(PRICE_BUCKETS[filters.price] || {}),
    }
    return p
  }, [query, platform, category, filters, sort, page])

  // Debounced fetch on any param change. An AbortController drops stale responses.
  const debounce = useRef()
  useEffect(() => {
    const controller = new AbortController()
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      setLoading(true)
      setError('')
      listCreators(params, { signal: controller.signal })
        .then((res) => setData(res || { results: [], total: 0, totalPages: 1 }))
        .catch((err) => {
          if (err?.name === 'AbortError') return
          setError(err?.message || 'Could not load creators.')
          setData({ results: [], total: 0, totalPages: 1 })
        })
        .finally(() => setLoading(false))
    }, 300)
    return () => {
      controller.abort()
      clearTimeout(debounce.current)
    }
  }, [params])

  const { results, total, totalPages } = data
  const firstHalf = results.slice(0, 4)
  const secondHalf = results.slice(4)

  const FILTER_CHIPS = [
    { key: 'content', label: 'Content type', opts: ['Reels', 'Posts', 'Stories', 'UGC'] },
    { key: 'followers', label: 'Followers', opts: Object.keys(FOLLOWER_BUCKETS) },
    { key: 'city', label: 'City', opts: options.cities },
    { key: 'price', label: 'Price', opts: Object.keys(PRICE_BUCKETS) },
    { key: 'gender', label: 'Gender', opts: ['Any', 'Female', 'Male'] },
    { key: 'age', label: 'Age', opts: ['18–24', '25–34', '35–44'] },
    { key: 'language', label: 'Language', opts: options.languages },
  ]

  const pageList = useMemo(() => {
    const n = Math.max(1, totalPages)
    if (n <= 5) return Array.from({ length: n }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '…', n]
    if (page >= n - 2) return [1, '…', n - 2, n - 1, n]
    return [1, '…', page, '…', n]
  }, [totalPages, page])

  return (
    <div className="find container">
      <h1 className="find__title">
        {loading
          ? 'Finding creators…'
          : `${total.toLocaleString('en-IN')} creator${total === 1 ? '' : 's'} match your search`}
      </h1>

      {/* Search bar */}
      <form className="find__search" onSubmit={(e) => e.preventDefault()}>
        <div className="find__search-seg">
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value)
              setPage(1)
            }}
          >
            {['All', ...options.platforms].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="find__search-seg grow">
          <input
            placeholder="Keyword or category"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <button className="find__search-btn" type="submit" aria-label="Search">
          🔍
        </button>
      </form>

      {/* Filter chips */}
      <div className="find__filters">
        <div className="find__chips">
          {FILTER_CHIPS.map((f) => (
            <Dropdown
              key={f.key}
              label={f.label}
              value={filters[f.key]}
              options={f.opts}
              onChange={(v) => setFilter(f.key, v)}
              buttonClassName="chip"
            />
          ))}
        </div>
        <div className="find__sort">
          Sort:
          <Dropdown
            value={sort}
            options={SORT_OPTIONS}
            onChange={(v) => {
              setSort(v)
              setPage(1)
            }}
            align="right"
            buttonClassName="find__sort-dd"
          />
        </div>
      </div>

      {/* Results */}
      {error ? (
        <p className="find__empty">{error}</p>
      ) : loading && results.length === 0 ? (
        <p className="find__empty">Loading creators…</p>
      ) : results.length === 0 ? (
        <p className="find__empty">No creators match your search. Try clearing filters.</p>
      ) : (
        <>
          <div className="find__grid">
            {firstHalf.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>

          <div className="find__band">
            <div>
              <h3>Can’t pick? Let creators come to you.</h3>
              <p>Post a campaign brief and get proposals from matching creators within 24 hours.</p>
            </div>
            <button className="btn btn--primary" onClick={() => navigate('/dashboard/jobs?post=1')}>
              Post a campaign
            </button>
          </div>

          {secondHalf.length > 0 && (
            <div className="find__grid">
              {secondHalf.map((c) => (
                <CreatorCard key={c.id} creator={c} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="find__pagination">
              {pageList.map((p, i) =>
                p === '…' ? (
                  <button key={`gap-${i}`} className="page" disabled>
                    …
                  </button>
                ) : (
                  <button
                    key={p}
                    className={`page ${p === page ? 'is-active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                className="page"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
