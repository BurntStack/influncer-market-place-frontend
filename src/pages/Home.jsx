import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { creators, getCreator } from '../data/creators.js'
import { listCreators } from '../api/creators.js'
import HeroCreatorCard from '../components/HeroCreatorCard.jsx'
import HiringSteps from '../components/HiringSteps.jsx'
import './Home.css'

const inr = (n) => '₹' + n.toLocaleString('en-IN')

const SUGGESTIONS = [
  'Trending on Instagram',
  'Rising on YouTube',
  'Most booked',
  'Under ₹5,000',
  'UGC',
  'Fashion',
  'Beauty',
  'Food',
]

const STATS = [
  { before: '4 weeks', value: '3 days', label: 'From brief to first approved post' },
  { before: '6 tools', value: '1 dashboard', label: 'Discovery, chat, contracts, payments, reports' },
  { before: '0%', value: '100%', label: 'Payments protected until you approve' },
]

const LOGOS = ['Brightleaf', 'kosha', 'NORTHWIND', 'mitti&co', 'Urbanfit', 'Lumen Labs']

const TESTIMONIALS = [
  {
    quote:
      'We used to spend a week just finding creators. Now we shortlist ten in an afternoon and pay from the same screen.',
    name: 'Neha S.',
    role: 'Growth lead, D2C skincare',
    avatar: 'https://images.pexels.com/photos/38344603/pexels-photo-38344603.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  },
  {
    quote:
      'Escrow changed everything for us. Creators trust the payment and we trust the deliverable.',
    name: 'Vikram P.',
    role: 'Founder, sports nutrition',
    avatar: 'https://images.pexels.com/photos/12327289/pexels-photo-12327289.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  },
  {
    quote:
      'Our agency runs 30+ campaigns a month here. Reports are client-ready without any extra work.',
    name: 'Farah M.',
    role: 'Account director, agency',
    avatar: 'https://images.pexels.com/photos/38281680/pexels-photo-38281680.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop',
  },
]

/* ---- Feature preview cards ---- */

function ShortlistCard() {
  const rows = [getCreator('sana-qureshi'), getCreator('priya-nair'), getCreator('arjun-das')]
  return (
    <div className="pcard card">
      <div className="pcard__chips">
        {['Beauty', 'Bengaluru', '10k–100k', 'Under ₹10,000'].map((c) => (
          <span className="pcard__chip" key={c}>
            {c} <span>▾</span>
          </span>
        ))}
      </div>
      <ul className="pcard__rows">
        {rows.map((c) => (
          <li key={c.id}>
            <img src={c.image} alt="" />
            <div className="pcard__rowinfo">
              <strong>{c.name}</strong>
              <span>{c.category} · {c.followers}</span>
            </div>
            <span className="pcard__rowprice">{inr(c.priceFrom)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CampaignCard() {
  const avatars = [getCreator('ananya-rao'), getCreator('meera-iyer'), getCreator('ishita-kapoor')]
  const facts = [
    ['Platform', 'Instagram Reels'],
    ['Deliverables', '1 Reel + 3 Stories'],
    ['Budget per creator', '₹6,000 – ₹12,000'],
    ['Apply by', '4 Nov 2026'],
  ]
  return (
    <div className="pcard card">
      <div className="pcard__inner card">
        <span className="pcard__kicker">New campaign</span>
        <h4 className="pcard__title">Diwali gift box launch</h4>
        <dl className="pcard__facts">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="pcard__proposals">
          <strong>24</strong> proposals
          <div className="pcard__avatars">
            {avatars.map((c) => (
              <img key={c.id} src={c.image} alt="" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ApprovalCard() {
  const c = getCreator('ananya-rao')
  return (
    <div className="pcard card">
      <div className="pcard__inner card">
        <div className="pcard__approve-head">
          <img src={c.image} alt="" />
          <div className="pcard__rowinfo">
            <strong>{c.name}</strong>
            <span>1 Instagram Reel</span>
          </div>
          <span className="pcard__draft">Draft submitted</span>
        </div>
        <div className="pcard__escrow">
          <span>✓ Held in escrow</span>
          <strong>{inr(c.priceFrom)}</strong>
        </div>
        <div className="pcard__approve-actions">
          <button className="btn btn--outline btn--sm">Request changes</button>
          <button className="btn btn--primary btn--sm">Approve &amp; pay</button>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    step: 'Step 1',
    title: 'Shortlist the Right Creator in Minutes.',
    body: 'Filter by city, niche, audience size and price. See real rates, past work and verified reviews before you message anyone.',
    Card: ShortlistCard,
    reverse: false,
  },
  {
    step: 'Step 2',
    title: 'Post One Brief. Let Creators Apply.',
    body: 'Describe the product, deliverables and budget once. Matching creators send proposals you can compare side by side.',
    Card: CampaignCard,
    reverse: true,
  },
  {
    step: 'Step 3',
    title: 'Money Moves Only When You Approve.',
    body: 'Your payment sits safely in escrow. Review the draft, ask for changes, and release payment when the content is live.',
    Card: ApprovalCard,
    reverse: false,
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [platform, setPlatform] = useState('All platforms')
  const [query, setQuery] = useState('')
  // Seed the hero grid with mock data for an instant paint, then swap in the
  // live catalogue. GET /creators is public, so this works signed-out.
  const [heroCreators, setHeroCreators] = useState(creators)

  useEffect(() => {
    let active = true
    listCreators({ pageSize: 8 })
      .then((res) => {
        if (active && res?.results?.length) setHeroCreators(res.results)
      })
      .catch(() => {}) // keep the mock fallback on error / cold start
    return () => {
      active = false
    }
  }, [])

  const goToSearch = (extra = {}) => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (platform && platform !== 'All platforms') params.set('platform', platform)
    Object.entries(extra).forEach(([k, v]) => v && params.set(k, v))
    const qs = params.toString()
    navigate(`/creators${qs ? `?${qs}` : ''}`)
  }

  const search = (e) => {
    e.preventDefault()
    goToSearch()
  }

  return (
    <div className="home">
      {/* Hero — search + creator grid */}
      <section className="hero">
        <div className="container">
          <form className="searchbar" onSubmit={search}>
            <div className="searchbar__platform">
              <span className="searchbar__icon">◉</span>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option>All platforms</option>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>Facebook</option>
                <option>X</option>
                <option>LinkedIn</option>
                <option>Snapchat</option>
              </select>
            </div>
            <input
              className="searchbar__input"
              placeholder='Try "skincare", "fitness Hyderabad" or "tech reviews"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn--primary searchbar__btn">
              🔍 Search
            </button>
          </form>

          <div className="hero__chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="hero__chip" onClick={() => navigate(`/creators?q=${encodeURIComponent(s)}`)}>
                {s}
              </button>
            ))}
          </div>

          <div className="hero__grid">
            {heroCreators.map((c) => (
              <HeroCreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </div>
      </section>

      {/* From First Search to Final Payout */}
      <section className="section journey">
        <div className="container">
          <div className="journey__head">
            <h2>From First Search to Final Payout</h2>
            <p>Every step of a creator campaign, without the WhatsApp threads and spreadsheets.</p>
          </div>

          {FEATURES.map((f) => (
            <div className={`feature ${f.reverse ? 'feature--rev' : ''}`} key={f.step}>
              <div className="feature__text">
                <span className="feature__step">{f.step}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <button className="feature__link" onClick={() => navigate('/creators')}>
                  Learn more →
                </button>
              </div>
              <div className="feature__visual">
                <f.Card />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logo cloud */}
      <section className="logos">
        <div className="container">
          <p className="logos__label">Trusted by 1,200+ Indian brands running creator programs</p>
          <div className="logos__row">
            {LOGOS.map((l) => (
              <span className="logos__item" key={l}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Swap Six Tools for One */}
      <section className="section swap">
        <div className="container">
          <h2 className="swap__title">Swap Six Tools for One</h2>
          <div className="swap__grid">
            {STATS.map((s) => (
              <div className="swapcard card" key={s.label}>
                <div className="swapcard__before">
                  <s>{s.before}</s> →
                </div>
                <div className="swapcard__value">{s.value}</div>
                <div className="swapcard__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Brand Teams Tell Us (dark) */}
      <section className="section testimonials">
        <div className="container">
          <h2 className="testimonials__title">What Brand Teams Tell Us</h2>
          <div className="testimonials__grid">
            {TESTIMONIALS.map((t) => (
              <figure className="quote" key={t.name}>
                <div className="quote__stars">⭐⭐⭐⭐⭐</div>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <img src={t.avatar} alt="" />
                  <span>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* How hiring works — Post a Job. Let Creators Bid. */}
      <HiringSteps />

      {/* Final CTA — Figma node 23:597 */}
      <section className="section finalcta">
        <div className="container">
          <div className="finalcta__box">
            <h2>
              Your Next Creator Campaign
              <br />
              Starts in Five Minutes.
            </h2>
            <p>Free to join. Pay only when you book a creator.</p>
            <div className="finalcta__actions">
              <button className="btn btn--primary btn--lg" onClick={() => navigate('/creators')}>
                Join as a brand
              </button>
              <button className="btn btn--ghost-dark btn--lg" onClick={() => navigate('/creators')}>
                Browse creators
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
