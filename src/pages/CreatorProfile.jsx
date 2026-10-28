import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getCreator,
  getCreatorPackages,
  getCreatorReviews,
  getSimilarCreators,
} from '../api/creators.js'
import CreatorCard from '../components/CreatorCard.jsx'
import './CreatorProfile.css'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

// API sends ISO dates ("2025-09-01"); show "Sep 2025".
const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function CreatorProfile() {
  const { id } = useParams()
  const [creator, setCreator] = useState(null)
  const [packages, setPackages] = useState([])
  const [reviews, setReviews] = useState([])
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    // The profile drives the page; the rest are supplementary, so a failure on
    // one of them shouldn't blank the whole screen.
    getCreator(id)
      .then((data) => {
        if (active) setCreator(data)
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Could not load this creator.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    getCreatorPackages(id).then((d) => active && setPackages(d || [])).catch(() => {})
    getCreatorReviews(id).then((d) => active && setReviews(d?.results || [])).catch(() => {})
    getSimilarCreators(id).then((d) => active && setSimilar(d || [])).catch(() => {})

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <div className="profile container"><p className="find__empty">Loading profile…</p></div>
  }
  if (error || !creator) {
    return (
      <div className="profile container">
        <p className="find__empty">{error || 'Creator not found.'}</p>
        <p><Link to="/creators">← Back to creators</Link></p>
      </div>
    )
  }

  const gallery = creator.gallery?.length ? creator.gallery : [creator.image]
  const reviewCount = creator.reviewCount ?? reviews.length
  const badges = creator.badges?.length
    ? creator.badges
    : [
        ...(creator.topCreator ? ['★ Top Creator'] : []),
        `${creator.followers} on ${creator.platform}`,
        creator.repliesWithin ? `⚡ Replies within ${creator.repliesWithin}` : '⚡ Replies fast',
      ]

  return (
    <div className="profile container">
      <div className="profile__topbar">
        <div className="profile__crumb">
          <Link to="/creators">Creators</Link> / {creator.category} creator from {creator.location}
        </div>
        <div className="profile__topactions">
          <button className="btn btn--outline btn--sm">↗ Share</button>
          <button className="btn btn--outline btn--sm">♡ Save</button>
        </div>
      </div>

      {/* Gallery */}
      <div className="profile__gallery">
        <div className="profile__gallery-main">
          <img src={gallery[0]} alt={creator.name} />
        </div>
        <div className="profile__gallery-side">
          <img src={gallery[1] || gallery[0]} alt="" />
          <div className="profile__gallery-last">
            <img src={gallery[2] || gallery[0]} alt="" />
            <button className="profile__showall">▦ Show all photos</button>
          </div>
        </div>
      </div>

      <div className="profile__body">
        {/* Left column */}
        <div className="profile__main">
          <div className="profile__header">
            <span className="profile__avatar">{creator.name.charAt(0)}</span>
            <div>
              <h1>{creator.name}</h1>
              <div className="profile__sub">
                <span>★ {creator.rating}</span>
                <span className="dot">·</span>
                <span>{reviewCount} reviews</span>
                <span className="dot">·</span>
                <span>{creator.location}, India</span>
              </div>
            </div>
          </div>

          <div className="profile__badges">
            {badges.map((b, i) => (
              <span key={i} className={`badge ${i === 0 && creator.topCreator ? 'badge--pink' : ''}`}>
                {b}
              </span>
            ))}
          </div>

          <p className="profile__bio">
            {creator.bio ||
              `${creator.category} creator based in ${creator.location}. I make honest, scroll-stopping content and only feature products I’ve actually used.`}
          </p>

          <section className="profile__section">
            <h2>Packages</h2>
            <div className="pkg-tabs">
              {['All', creator.platform, 'UGC'].map((t, i) => (
                <button key={t} className={`pkg-tab ${i === 0 ? 'is-active' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
            <ul className="pkg-list">
              {packages.map((p) => (
                <li key={p.id || p.title} className="pkg">
                  <div>
                    <div className="pkg__title">{p.title}</div>
                    <div className="pkg__note">{p.note}</div>
                  </div>
                  <div className="pkg__price">{inr(p.price)}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="profile__section">
            <h2>
              Reviews{' '}
              <span className="profile__rating-inline">
                ★ {creator.rating} · {reviewCount} reviews
              </span>
            </h2>
            <div className="reviews">
              {reviews.map((r) => (
                <div className="review" key={r.id || r.name}>
                  <div className="review__head">
                    <span className="review__avatar">{(r.name || '?').charAt(0)}</span>
                    <div>
                      <strong>{r.name}</strong>
                      <div className="review__meta">
                        {'★'.repeat(r.stars || 0)} · {fmtDate(r.date)}
                      </div>
                    </div>
                  </div>
                  <p>{r.text}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="profile__bio">No reviews yet.</p>}
            </div>
          </section>
        </div>

        {/* Right booking card */}
        <aside className="profile__aside">
          <div className="booking card">
            <div className="booking__price">
              {inr(creator.priceFrom)} <span>starting</span>
            </div>
            <label className="booking__label">Deliverable</label>
            <select className="booking__select">
              {(packages.length ? packages : [{ title: creator.deliverable, price: creator.priceFrom }]).map(
                (p) => (
                  <option key={p.id || p.title}>
                    {p.title} — {inr(p.price)}
                  </option>
                ),
              )}
            </select>

            <div className="booking__qty">
              <span>Quantity</span>
              <div className="booking__stepper">
                <button>−</button>
                <span>1</span>
                <button>+</button>
              </div>
            </div>

            <button className="btn btn--primary booking__cta">Add to cart</button>
            <button className="btn btn--outline booking__cta">Send a custom offer</button>
            <p className="booking__note">
              🔒 You won’t be charged yet. Funds are held in escrow and released only after you
              approve the content.
            </p>
          </div>
        </aside>
      </div>

      {/* Similar creators */}
      {similar.length > 0 && (
        <section className="profile__section">
          <h2>Similar creators</h2>
          <div className="profile__similar">
            {similar.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
