import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { topCreators } from '../../data/dashboard.js'
import { listCreators } from '../../api/creators.js'
import DashCreatorCard from '../../components/dashboard/DashCreatorCard.jsx'
import Dropdown from '../../components/Dropdown.jsx'
import './dash-pages.css'
import './DashSearch.css'

const FILTERS = [
  { key: 'content', label: 'Content type', options: ['Reels', 'Posts', 'Stories', 'UGC', 'YouTube'] },
  { key: 'followers', label: 'Followers', options: ['1k–10k', '10k–100k', '100k–500k', '500k+'] },
  { key: 'location', label: 'Location', options: ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'] },
  { key: 'price', label: 'Price', options: ['Under ₹5,000', '₹5,000–₹10,000', '₹10,000–₹20,000', '₹20,000+'] },
  { key: 'gender', label: 'Gender', options: ['Any', 'Female', 'Male'] },
  { key: 'age', label: 'Age', options: ['18–24', '25–34', '35–44'] },
  { key: 'language', label: 'Language', options: ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada'] },
]

export default function DashSearch() {
  const [params] = useSearchParams()
  const [platform, setPlatform] = useState('Any platform')
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState('Recommended')
  const [query, setQuery] = useState(params.get('q') || '')
  useEffect(() => setQuery(params.get('q') || ''), [params])
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))
  const clearAll = () => setFilters({})

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    const sortMap = { Recommended: 'recommended', 'Price: low to high': 'price_asc', 'Price: high to low': 'price_desc', 'Most followers': 'followers' }
    listCreators({ q: query, platform: platform === 'Any platform' ? '' : platform, contentType: filters.content, city: filters.location, sort: sortMap[sort], page, pageSize: 8 }, { signal: controller.signal })
      .then((data) => {
        if (data?.results) { setResults(data.results); setTotal(data.total ?? data.results.length) }
      })
      .catch((error) => { if (error.name !== 'AbortError') { setResults([]); setTotal(0) } })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [query, platform, filters, sort, page])
  useEffect(() => setPage(1), [query, platform, filters, sort])

  return (
    <div className="dpage dsearch">
      <h1 className="dpage__title">Find your kind of creative.</h1>
      <p className="dpage__sub">Explore different voices. Find the right fit for your next campaign.</p>

      <div className="dsearch__bar">
        <div className="dsearch__seg">
          <Dropdown
            value={platform}
            options={['Any platform', 'Instagram', 'YouTube', 'Facebook', 'X', 'LinkedIn', 'Snapchat']}
            onChange={setPlatform}
            buttonClassName="dsearch__seg-dd"
          />
        </div>
        <div className="dsearch__seg grow">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Keyword or category" />
        </div>
        <button className="dsearch__go" aria-label="Search" onClick={() => setQuery(query.trim())}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>

      <div className="dsearch__filters">
        {FILTERS.map((f) => (
          <Dropdown
            key={f.key}
            label={f.label}
            value={filters[f.key]}
            options={f.options}
            onChange={(v) => setFilter(f.key, v)}
            buttonClassName="dsearch__chip"
          />
        ))}
        <button className="dsearch__clear" onClick={clearAll}>
          Clear all
        </button>
      </div>

      <div className="dsearch__meta">
        <span>{loading ? 'Loading creators…' : `Showing ${total ? (page - 1) * 8 + 1 : 0}–${Math.min(page * 8, total)} of ${total.toLocaleString()} creators`}</span>
        <span className="dsearch__sort">
          Sort:
          <Dropdown
            value={sort}
            options={['Recommended', 'Price: low to high', 'Price: high to low', 'Most followers']}
            onChange={setSort}
            align="right"
            buttonClassName="dsearch__sort-dd"
          />
        </span>
      </div>

      <div className="dcreator-grid">
        {results.map((c) => (
          <DashCreatorCard key={c.id} creator={c} />
        ))}
      </div>

      <div className="dsearch__pagination">
        {Array.from({ length: Math.ceil(total / 8) }, (_, i) => i + 1).filter((p) => p === 1 || p === Math.ceil(total / 8) || Math.abs(p - page) <= 1).map((p, i) => (
          <button key={i} onClick={() => setPage(p)} className={`dpage-btn ${p === page ? 'is-active' : ''}`}>
            {p}
          </button>
        ))}
        <button className="dpage-btn" disabled={page * 8 >= total} onClick={() => setPage((current) => current + 1)}>›</button>
      </div>
    </div>
  )
}
