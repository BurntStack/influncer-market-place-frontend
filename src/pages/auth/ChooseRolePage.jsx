import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { completeSignup, getUser, postLoginPath, updateLocalUser } from '../../lib/auth.js'
import { apiData } from '../../lib/apiClient.js'
import LogoMark from '../../components/LogoMark.jsx'
import './ChooseRolePage.css'

const brandCategories = ['Beauty', 'Fashion', 'Food & Beverage', 'Health & Fitness', 'Lifestyle', 'Technology', 'Travel', 'Other']

export default function ChooseRolePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const requested = location.state?.from || new URLSearchParams(location.search).get('from')
  const from = requested?.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/choose-role') ? requested : null
  const user = getUser()
  const [role, setRole] = useState('')
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '')
  const [brandName, setBrandName] = useState('')
  const [category, setCategory] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const emailVerified = user?.emailVerified === true && user?.email?.toLowerCase() === email.trim().toLowerCase()

  const destination = selected => postLoginPath(selected, from)
  const choose = selected => {
    setError('')
    if (user?.role) {
      if (user.role !== selected) { setError(`This account is registered as a ${user.role}.`); return }
      navigate(destination(selected), { replace: true })
      return
    }
    setRole(selected)
  }
  const complete = async event => {
    event.preventDefault()
    if (busy) return
    if (!fullName.trim() || (role === 'brand' ? !brandName.trim() || !category || !email.trim() : !displayName.trim())) {
      setError('Please complete the required fields.'); return
    }
    setBusy(true); setError('')
    try {
      await completeSignup(role === 'brand'
        ? { role, fullName: fullName.trim(), brandName: brandName.trim() }
        : { role, fullName: fullName.trim(), displayName: displayName.trim() })
      if (role === 'brand') {
        const completed = getUser()
        const verified = completed?.emailVerified === true && completed?.email?.toLowerCase() === email.trim().toLowerCase()
        updateLocalUser({ email: email.trim(), industry: category, emailVerified: verified })
        try { await apiData('/brands/me/', { method: 'PATCH', body: { industry: category } }) }
        catch { navigate('/dashboard/account/brands', { replace: true }); return }
      }
      navigate(destination(role), { replace: true })
    } catch (err) { setError(err?.message || 'Could not complete your profile.') }
    finally { setBusy(false) }
  }

  if (user?.role) return <Navigate to={destination(user.role)} replace />

  return (
    <main className="role-page">
      <div className="role-page__top"><Link to="/" className="role-page__logo"><LogoMark />LinkLoom</Link><span>{user?.phone || user?.destination || 'Your account'}</span></div>
      <div className={`role-page__content ${role ? 'role-page__content--form' : ''}`}>
        <div className="role-page__intro">
          {role && <img className="role-page__intro-image" src={role === 'brand' ? '/creators/meera-iyer.webp' : '/creators/rohan-mehta.webp'} alt="" />}
          <span className="role-page__eyebrow">ONE MORE STEP</span>
          <h1>{role ? (role === 'brand' ? 'Tell us about your brand.' : 'Create your creator profile.') : 'How will you use the marketplace?'}</h1>
          <p>{role ? 'Add the details for your workspace.' : 'Choose the workspace that fits you.'}</p>
          {role && <div className="role-page__intro-foot"><span>01 / VERIFY YOUR NUMBER</span><span>02 / SET UP YOUR SPACE</span></div>}
        </div>
        {!role ? <div className="role-page__choices">
          <button type="button" onClick={() => choose('brand')}>
            <img src="/creators/meera-iyer.webp" alt="" />
            <span><strong>I'm a brand</strong><small>Find creators, post campaigns, and manage collaborations.</small><b>Continue as a brand ↗</b></span>
          </button>
          <button type="button" onClick={() => choose('creator')}>
            <img src="/creators/rohan-mehta.webp" alt="" />
            <span><strong>I'm a creator</strong><small>Explore opportunities and prepare your creator profile.</small><b>Continue as a creator ↗</b></span>
          </button>
        </div> : <form className="role-page__form" onSubmit={complete}>
          <label>Full name<input value={fullName} onChange={event => setFullName(event.target.value)} autoComplete="name" required /></label>
          {role === 'brand' ? <>
            <label>Brand name<input value={brandName} onChange={event => setBrandName(event.target.value)} autoComplete="organization" required /></label>
            <label>Category<select value={category} onChange={event => setCategory(event.target.value)} required><option value="">Select your category</option>{brandCategories.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Email address<div className="role-page__email"><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="you@brand.com" required />{emailVerified ? <span className="role-page__verified" aria-label="Email verified">✓ Verified</span> : <button type="button" disabled title="Email verification is awaiting a backend endpoint">Verify</button>}</div></label>
            {!emailVerified && <p className="role-page__verification-note">Email verification needs a backend endpoint. Your address will remain unverified until you confirm a code.</p>}
          </> : <label>Display name<input value={displayName} onChange={event => setDisplayName(event.target.value)} required /></label>}
          <div><button type="button" className="role-page__back" onClick={() => { setRole(''); setError('') }}>← Back</button><button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Continue ↗'}</button></div>
        </form>}
        {error && <p className="role-page__error" role="alert">{error}</p>}
      </div>
    </main>
  )
}
