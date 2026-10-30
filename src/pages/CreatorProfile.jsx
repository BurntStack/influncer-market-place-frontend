import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { getCreator, getCreatorPackages, getCreatorReviews, getSimilarCreators, addCartItem, createOffer } from '../api/creators.js'
import CreatorCard from '../components/CreatorCard.jsx'
import Modal from '../components/Modal.jsx'
import { useFavorites, toggleFavorite } from '../lib/favorites.js'
import './CreatorProfile.css'
import './CreatorProfileStudio.css'

const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN')
const list = data => Array.isArray(data) ? data : data?.results || []
const dateLabel = value => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function CreatorProfile() {
  const { id } = useParams()
  const location = useLocation()
  const returnTo = location.state?.fromBids || '/dashboard/search'
  const [creator, setCreator] = useState(null)
  const [packages, setPackages] = useState([])
  const [reviews, setReviews] = useState([])
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [packageError, setPackageError] = useState('')
  const [reviewsError, setReviewsError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [activeTab, setActiveTab] = useState('All')
  const [packageId, setPackageId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [modal, setModal] = useState(null)
  const [offer, setOffer] = useState({ deliverable: '', budget: '', message: '', deadline: '' })
  const saved = useFavorites().some(item => item.id === id)

  useEffect(() => {
    const controller = new AbortController()
    const opts = { signal: controller.signal }
    setLoading(true); setError(''); setPackageError(''); setReviewsError(''); setMessage(''); setActionError('')
    setCreator(null); setPackages([]); setReviews([]); setSimilar([]); setPackageId(''); setQuantity(1); setActiveTab('All'); setModal(null)
    getCreator(id, opts).then(setCreator).catch(err => { if (!controller.signal.aborted) setError(err.message || 'Could not load this creator.') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    getCreatorPackages(id, opts).then(data => { if (!controller.signal.aborted) { const next = list(data); setPackages(next); setPackageId(String(next[0]?.id || '')) } }).catch(() => { if (!controller.signal.aborted) setPackageError('Packages could not be loaded.') })
    getCreatorReviews(id, undefined, opts).then(data => { if (!controller.signal.aborted) setReviews(list(data)) }).catch(() => { if (!controller.signal.aborted) setReviewsError('Reviews could not be loaded.') })
    getSimilarCreators(id, opts).then(data => { if (!controller.signal.aborted) setSimilar(list(data)) }).catch(() => {})
    return () => controller.abort()
  }, [id, attempt])

  const selected = packages.find(pkg => String(pkg.id) === packageId)
  const total = Number(selected?.price || 0) * quantity
  const visiblePackages = packages.filter(pkg => activeTab === 'All' || (pkg.platform || creator?.platform) === activeTab)
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: creator.name, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); setMessage('Profile link copied.') }
    } catch (err) { if (err.name !== 'AbortError') setModal('share') }
  }
  const addToCart = async () => {
    if (busy || !selected?.id) return
    setBusy(true); setMessage(''); setActionError('')
    try { await addCartItem({ creatorId: id, packageId: selected.id, quantity }); setMessage(`${quantity} × ${selected.title} added to your cart.`) }
    catch (err) { setActionError(err.message || 'Could not add this package. Please try again.') }
    finally { setBusy(false) }
  }
  const openOffer = () => { setOffer({ deliverable: selected?.title || creator.deliverable || '', budget: String(selected?.price || creator.priceFrom || ''), message: '', deadline: '' }); setActionError(''); setModal('offer') }
  const submitOffer = async event => {
    event.preventDefault()
    if (busy) return
    if (!offer.deliverable.trim() || Number(offer.budget) < 1) { setActionError('Add a deliverable and a budget greater than zero.'); return }
    setBusy(true); setActionError('')
    try { await createOffer({ ...offer, deliverable: offer.deliverable.trim(), message: offer.message.trim(), creatorId: id, budget: Number(offer.budget) }); setModal(null); setMessage('Your offer was sent to the creator.') }
    catch (err) { setActionError(err.message || 'Could not send your offer. Your details have been kept.') }
    finally { setBusy(false) }
  }

  if (loading) return <div className="profile profile--studio container"><div className="workspace-empty" role="status"><h1>Meet your next collaborator.</h1><p>Loading creator profile…</p></div></div>
  if (error || !creator) return <div className="profile profile--studio container"><div className="workspace-empty"><h1>Profile unavailable.</h1><p role="alert">{error || 'This creator could not be found.'}</p><button className="btn btn--dark" onClick={() => setAttempt(n => n + 1)}>Try again</button><Link to={returnTo}>Back to discovery</Link></div></div>
  const gallery = [...new Set([creator.image, ...(creator.gallery || [])].filter(Boolean))]
  const reviewCount = creator.reviewCount ?? reviews.length
  return <div className="profile profile--studio container">
    <div className="profile__topbar"><Link className="profile__back" to={returnTo}>← {location.state?.fromBids ? 'Back to bids' : 'Back to discovery'}</Link><div className="profile__topactions"><button className="btn btn--outline btn--sm" onClick={share}>Share profile ↗</button><button className="btn btn--outline btn--sm" aria-pressed={saved} onClick={() => toggleFavorite({ ...creator, id })}>{saved ? '♥ Saved' : '♡ Save creator'}</button></div></div>
    <header className="creator-intro"><div><span className="eyebrow">A FRESH PERSPECTIVE / {creator.platform}</span><h1>{creator.name}<span>.</span></h1><p>{creator.category} · {creator.location}</p></div><div className="creator-intro__stats"><div><strong>{creator.followers || '—'}</strong><span>Audience</span></div><div><strong>{creator.rating ?? '—'} <small>★</small></strong><span>{reviewCount} reviews</span></div></div></header>
    <div className={`profile__gallery ${gallery.length < 2 ? 'profile__gallery--single' : ''}`}>
      <div className="profile__gallery-main">{gallery[0] && <img src={gallery[0]} alt={`${creator.name} portrait`} />}<div className="creator-photo-caption"><span>MEET THE CREATOR</span><strong>{creator.category}</strong></div></div>
      {gallery.length > 1 && <div className="profile__gallery-side">{gallery.slice(1,3).map((src,index) => <img key={src} src={src} alt={`${creator.name} portfolio ${index+1}`} />)}</div>}
      {gallery.length > 0 && <button className="profile__showall" onClick={() => setModal('gallery')}>View {gallery.length === 1 ? 'photo' : `all ${gallery.length} photos`} ↗</button>}
    </div>
    {message && <p className="workspace-message profile-feedback" role="status">{message}</p>}
    {actionError && modal !== 'offer' && <p className="workspace-message workspace-message--error profile-feedback" role="alert">{actionError}</p>}
    <div className="profile__body"><div className="profile__main">
      <section className="profile__section profile__about"><span className="eyebrow">THE PERSON BEHIND THE CONTENT</span><h2>A little about {creator.name.split(' ')[0]}.</h2><p className="profile__bio">{creator.bio || `${creator.category} creator based in ${creator.location}. Explore their packages or send a brief to discuss your campaign.`}</p><div className="profile__badges">{(creator.badges || []).map(badge => <span className="badge" key={badge}>{badge}</span>)}{creator.repliesWithin && <span className="badge">Replies within {creator.repliesWithin}</span>}</div></section>
      <section className="profile__section"><span className="eyebrow">MAKE SOMETHING TOGETHER</span><h2>Pick your starting point.</h2><div className="pkg-tabs" role="group" aria-label="Filter packages">{[...new Set(['All', creator.platform, 'UGC'].filter(Boolean))].map(tab => <button key={tab} className={`pkg-tab ${activeTab === tab ? 'is-active' : ''}`} aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
        {packageError ? <div className="workspace-empty"><p role="alert">{packageError}</p><button className="btn btn--outline" onClick={() => setAttempt(n => n + 1)}>Retry packages</button></div> : <ul className="pkg-list">{visiblePackages.map(pkg => <li key={pkg.id || pkg.title}><button className={`pkg ${packageId === String(pkg.id) ? 'pkg--selected' : ''}`} aria-pressed={packageId === String(pkg.id)} onClick={() => { setPackageId(String(pkg.id)); setMessage('') }}><span><span className="pkg__title">{pkg.title}</span><span className="pkg__note">{pkg.note || pkg.platform || creator.platform}</span></span><span className="pkg__price">{inr(pkg.price)} <small>{packageId === String(pkg.id) ? '✓ Selected' : 'Select ↗'}</small></span></button></li>)}{!visiblePackages.length && <li className="workspace-empty"><h3>No packages here yet.</h3><p>Send a custom offer to discuss the work and your budget directly.</p><button className="btn btn--outline" onClick={openOffer}>Send a custom offer</button></li>}</ul>}
      </section>
      <section className="profile__section"><span className="eyebrow">FROM PAST COLLABORATIONS</span><h2>Words from brands. <span className="profile__rating-inline">{creator.rating ?? '—'} ★ · {reviewCount} reviews</span></h2><div className="reviews">{reviews.map((review,index) => <article className="review" key={review.id || index}><div className="review__head"><span className="review__avatar">{(review.name || 'B').charAt(0)}</span><div><strong>{review.name || 'Brand'}</strong><div className="review__meta">{'★'.repeat(Math.max(0,Math.min(5,Number(review.stars)||0)))} · {dateLabel(review.date)}</div></div></div><p>{review.text}</p></article>)}</div>{!reviews.length && <p className="profile__bio">{reviewsError || 'No reviews yet.'}</p>}</section>
    </div><aside className="profile__aside"><div className="booking card"><span className="eyebrow">LET’S MAKE IT HAPPEN</span><h2>Your next good idea,<br/>made together.</h2><div className="booking__price">{inr(selected?.price ?? creator.priceFrom)} <span>{selected ? 'per package' : 'starting from'}</span></div><label className="booking__label" htmlFor="creator-package">Choose a package</label><select id="creator-package" className="booking__select" value={packageId} disabled={!packages.length || busy} onChange={event => setPackageId(event.target.value)}>{!packages.length && <option value="">No packages available</option>}{packages.map(pkg => <option key={pkg.id} value={String(pkg.id)}>{pkg.title} — {inr(pkg.price)}</option>)}</select><div className="booking__qty"><span>Quantity</span><div className="booking__stepper"><button type="button" aria-label="Decrease quantity" disabled={quantity === 1 || busy} onClick={() => setQuantity(n => n - 1)}>−</button><output aria-label="Quantity">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity >= 99 || busy} onClick={() => setQuantity(n => n + 1)}>+</button></div></div>{selected && <div className="booking__total"><span>Package total</span><strong>{inr(total)}</strong></div>}<button className="btn btn--primary booking__cta" disabled={!selected?.id || busy} onClick={addToCart}>{busy && modal !== 'offer' ? 'Adding…' : 'Add to cart ↗'}</button><button className="btn btn--outline booking__cta" disabled={busy} onClick={openOffer}>Send a custom offer</button><Link className="booking__campaign" to="/dashboard/jobs?post=1">Prefer to compare bids? Post a campaign →</Link><p className="booking__note">Adding a package or sending an offer does not charge your account.</p></div></aside></div>
    {similar.length > 0 && <section className="profile__section"><span className="eyebrow">KEEP EXPLORING</span><h2>More voices. More possibilities.</h2><div className="profile__similar">{similar.map(item => <CreatorCard key={item.id} creator={item} />)}</div></section>}
    {modal === 'gallery' && <Modal title="A closer look." subtitle={`${creator.name} · Portfolio`} onClose={() => setModal(null)} wide><div className="creator-gallery">{gallery.map((src,index) => <img key={src} src={src} alt={`${creator.name} portfolio ${index+1}`} />)}</div></Modal>}
    {modal === 'share' && <Modal title="Share this profile." onClose={() => setModal(null)}><div className="workspace-form"><label>Profile link<input readOnly value={window.location.href} onFocus={event => event.target.select()} /></label><p>Select the link to copy it and share it with your team.</p></div></Modal>}
    {modal === 'offer' && <Modal title="Start with your idea." subtitle={`Send a custom offer to ${creator.name}.`} onClose={() => setModal(null)} busy={busy}><form className="workspace-form" onSubmit={submitOffer}><label>What should the creator deliver?<input required maxLength={240} value={offer.deliverable} onChange={event => setOffer({ ...offer, deliverable: event.target.value })} placeholder="e.g. One product launch Reel" /></label><div className="workspace-form__grid"><label>Budget (₹)<input type="number" required min="1" step="1" value={offer.budget} onChange={event => setOffer({ ...offer, budget: event.target.value })} /></label><label>Deadline (optional)<input type="date" min={new Date().toLocaleDateString('en-CA')} value={offer.deadline} onChange={event => setOffer({ ...offer, deadline: event.target.value })} /></label></div><label>Your brief<textarea value={offer.message} maxLength={3000} onChange={event => setOffer({ ...offer, message: event.target.value })} placeholder="The product, audience, style, and anything else they should know." /></label>{actionError && <p className="workspace-message workspace-message--error" role="alert">{actionError}</p>}<div className="workspace-form__actions"><button className="btn btn--outline" type="button" disabled={busy} onClick={() => setModal(null)}>Cancel</button><button className="btn btn--dark" disabled={busy}>{busy ? 'Sending…' : 'Send offer ↗'}</button></div></form></Modal>}
  </div>
}
