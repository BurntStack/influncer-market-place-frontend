import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSummary } from '../../api/dashboard.js'
import { getUser } from '../../lib/auth.js'
import { homeStats, topCreators as mockTopCreators } from '../../data/dashboard.js'
import DashCreatorCard from '../../components/dashboard/DashCreatorCard.jsx'
import './dash-pages.css'
import './DashHome.css'

// The API stats carry no explicit tone; treat a positive-looking `sub` as green.
const isGreen = (sub = '') => /^\+|100%|on time/i.test(sub)

export default function DashHome() {
  const [greeting, setGreeting] = useState(getUser()?.companyName || getUser()?.name || 'your workspace')
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
    <div className="dpage brand-overview">
      <div className="workspace-welcome"><div><span className="eyebrow">YOUR CREATIVE WORKSPACE</span><h1 className="dhome__greeting">Welcome back, {greeting}.</h1><p className="dpage__sub">A little direction. A lot of possibility.</p></div><Link className="btn btn--primary" to="/dashboard/jobs?post=1">Post a campaign ↗</Link></div>

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

      <div className="brand-overview-section"><span className="eyebrow">MAKE YOUR NEXT MOVE.</span><h2>A little direction. More possibility.</h2></div>
      <div className="workspace-shortcuts">
        <Link to="/dashboard/jobs"><span>01 / CAMPAIGNS</span><h2>Find your next collaboration.</h2><p>Review your campaigns and creator proposals.</p><strong>Open campaigns ↗</strong></Link>
        <Link to="/dashboard/deliverables"><span>02 / CONTENT</span><h2>Keep good work moving.</h2><p>Your campaign content, ready for a closer look.</p><strong>Review content ↗</strong></Link>
        <Link to="/dashboard/search"><span>03 / DISCOVERY</span><h2>Meet a fresh perspective.</h2><p>Explore creators for your next brand story.</p><strong>Discover creators ↗</strong></Link>
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
