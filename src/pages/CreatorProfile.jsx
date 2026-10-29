import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getCreator,
  getCreatorPackages,
  getCreatorReviews,
  getSimilarCreators,
  saveCreator,
  unsaveCreator,
  addCartItem,
  createOffer,
} from '../api/creators.js'
import CreatorCard from '../components/CreatorCard.jsx'
import { useFavorites, toggleFavorite } from '../lib/favorites.js'
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
  const saved = useFavorites().some((item) => item.id === id)
  const [activePackageTab, setActivePackageTab] = useState('All')
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [actionMessage, setActionMessage] = useState('')
  const [shareMsg, setShareMsg] = useState('')
  const [galleryOpen, setGalleryOpen] = useState(false)

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

  const toggleSaved = async () => {
    if (creator) toggleFavorite({ ...creator, id })
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: creator?.name, text: `Check out ${creator?.name}`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareMsg('Link copied')
      setTimeout(() => setShareMsg(''), 2000)
    } catch {
      /* user dismissed the share sheet, or clipboard was blocked */
    }
  }

  const addToCart = async () => {
    const pkg = selectedPackage || packages[0]
    if (!pkg?.id) { setActionMessage('This creator has no bookable package yet.'); return }
    try { await addCartItem({ creatorId: id, packageId: pkg.id, quantity }); setActionMessage('Added to cart.') }
    catch (err) { setActionMessage(err?.message || 'Could not add this package to cart.') }
  }

  const sendOffer = async () => {
    const deliverable = window.prompt('What would you like the creator to deliver?', creator.deliverable || '')
    if (!deliverable) return
    const budget = Number(window.prompt('Budget in INR', String(creator.priceFrom || '')))
    if (!budget) return
    try { await createOffer({ creatorId: id, deliverable, budget, message: '', deadline: '' }); setActionMessage('Custom offer sent.') }
    catch (err) { setActionMessage(err?.message || 'Could not send the offer.') }
  }

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
          {shareMsg && <span className="profile__sharemsg">{shareMsg}</span>}
          <button className="btn btn--outline btn--sm" onClick={share}>↗ Share</button>
          <button className={`btn btn--outline btn--sm ${saved ? 'is-saved' : ''}`} onClick={toggleSaved}>{saved ? '♥ Saved' : '♡ Save'}</button>
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
            <button className="profile__showall" onClick={() => setGalleryOpen(true)}>▦ Show all photos</button>
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
                <button key={t} className={`pkg-tab ${activePackageTab === t ? 'is-active' : ''}`} onClick={() => setActivePackageTab(t)}>
                  {t}
                </button>
              ))}
            </div>
            <ul className="pkg-list">
              {packages.filter((p) => activePackageTab === 'All' || !p.platform || p.platform === activePackageTab).map((p) => (
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
            <select className="booking__select" value={selectedPackage?.id || ''} onChange={(e) => setSelectedPackage(packages.find((p) => String(p.id) === e.target.value) || null)}>
              {!packages.length && <option value="">{creator.deliverable}</option>}
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
                <button type="button" onClick={() => setQuantity((n) => Math.max(1, n - 1))}>−</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((n) => n + 1)}>+</button>
              </div>
            </div>

            <button className="btn btn--primary booking__cta" onClick={addToCart}>Add to cart</button>
            <button className="btn btn--outline booking__cta" onClick={sendOffer}>Send a custom offer</button>
            {actionMessage && <p className="profile__bio">{actionMessage}</p>}
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

      {/* Photo lightbox */}
      {galleryOpen && (
        <div
          className="profile__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${creator.name} photos`}
          onClick={() => setGalleryOpen(false)}
        >
          <button className="profile__lightbox-close" aria-label="Close" onClick={() => setGalleryOpen(false)}>
            ×
          </button>
          <div className="profile__lightbox-grid" onClick={(e) => e.stopPropagation()}>
            {gallery.map((src, i) => (
              <img key={i} src={src} alt={`${creator.name} ${i + 1}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
