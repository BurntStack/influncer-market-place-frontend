import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSummary } from '../../api/dashboard.js'
import { brand, homeStats, topCreators as mockTopCreators } from '../../data/dashboard.js'
import DashCreatorCard from '../../components/dashboard/DashCreatorCard.jsx'
import './dash-pages.css'
import './DashHome.css'

// The API stats carry no explicit tone; treat a positive-looking `sub` as green.
const isGreen = (sub = '') => /^\+|100%|on time/i.test(sub)

export default function DashHome() {
  const [greeting, setGreeting] = useState(brand.name)
  const [stats, setStats] = useState(homeStats)
  const [creators, setCreators] = useState(mockTopCreators)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getSummary()
      .then((data) => {
        if (!active || !data) return
        if (data.greetingName) setGreeting(data.greetingName)
        if (data.stats?.length) setStats(data.stats)
        if (data.topCreators?.length) setCreators(data.topCreators)
      })
      .catch(() => {}) // keep mock fallback
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="dpage">
      <h1 className="dhome__greeting">Good morning, {greeting}</h1>
      <p className="dpage__sub">Here’s what’s happening with your creator jobs today.</p>

      {/* Stats */}
      <div className="dstats dhome__stats">
        {stats.map((s) => (
          <div className="dstat" key={s.label}>
            <div className="dstat__label">{s.label}</div>
            <div className="dstat__value">{s.value}</div>
            <div className={`dstat__sub ${s.tone === 'green' || isGreen(s.sub) ? 'is-green' : ''}`}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Top creators */}
      <div className="dsection-head">
        <div>
          <h2>Explore top creators for you</h2>
          <p>Hire creators in seconds, matched to your category.</p>
        </div>
        <Link to="/dashboard/search">See all →</Link>
      </div>
      <div className="dcreator-grid">
        {creators.slice(0, 4).map((c) => (
          <DashCreatorCard key={c.id} creator={c} />
        ))}
      </div>
      {loading && <p className="dpage__sub">Refreshing…</p>}
    </div>
  )
}
