import { useState } from 'react'
import { topCreators } from '../../data/dashboard.js'
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
  const [platform, setPlatform] = useState('Any platform')
  const [filters, setFilters] = useState({ content: 'Reels', location: 'Bengaluru' })
  const [sort, setSort] = useState('Recommended')

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))
  const clearAll = () => setFilters({})

  return (
    <div className="dpage dsearch">
      <h1 className="dpage__title">Over 25,000 vetted creators found</h1>

      <div className="dsearch__bar">
        <div className="dsearch__seg">
          <label>Platform</label>
          <Dropdown
            value={platform}
            options={['Any platform', 'Instagram', 'YouTube', 'Facebook', 'X', 'LinkedIn', 'Snapchat']}
            onChange={setPlatform}
            buttonClassName="dsearch__seg-dd"
          />
        </div>
        <div className="dsearch__seg grow">
          <label>Keyword or category</label>
          <input placeholder='Try "skincare", "Bengaluru food" or "UGC"' />
        </div>
        <button className="dsearch__go" aria-label="Search">
          🔍
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
        <span>Showing 1–8 of 1,284 creators</span>
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
        {topCreators.map((c) => (
          <DashCreatorCard key={c.id} creator={c} />
        ))}
      </div>

      <div className="dsearch__pagination">
        {[1, 2, 3, '…', 161].map((p, i) => (
          <button key={i} className={`dpage-btn ${p === 1 ? 'is-active' : ''}`}>
            {p}
          </button>
        ))}
        <button className="dpage-btn">›</button>
      </div>
    </div>
  )
}
