import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { completeSignup, getUser, postLoginPath } from '../../lib/auth.js'
import LogoMark from '../../components/LogoMark.jsx'
import './ChooseRolePage.css'

export default function ChooseRolePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const requested = location.state?.from || new URLSearchParams(location.search).get('from')
  const from = requested?.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/choose-role') ? requested : null
  const user = getUser()
  const [role, setRole] = useState('')
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '')
  const [brandName, setBrandName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
    if (!fullName.trim() || (role === 'brand' ? !brandName.trim() : !displayName.trim())) {
      setError('Please complete the required fields.'); return
    }
    setBusy(true); setError('')
    try {
      await completeSignup(role === 'brand'
        ? { role, fullName: fullName.trim(), brandName: brandName.trim() }
        : { role, fullName: fullName.trim(), displayName: displayName.trim() })
      navigate(destination(role), { replace: true })
    } catch (err) { setError(err?.message || 'Could not complete your profile.') }
    finally { setBusy(false) }
  }

  if (user?.role) return <Navigate to={destination(user.role)} replace />

  return (
    <main className="role-page">
      <div className="role-page__top"><Link to="/" className="role-page__logo"><LogoMark />LinkLoom</Link><span>{user?.phone || user?.destination || 'Your account'}</span></div>
      <div className="role-page__content">
        <span className="role-page__eyebrow">ONE MORE STEP</span>
        <h1>{role ? (role === 'brand' ? 'Tell us about your brand.' : 'Create your creator profile.') : 'How will you use the marketplace?'}</h1>
        <p>{role ? 'Add the details for your workspace.' : 'Choose the workspace that fits you.'}</p>
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
          {role === 'brand' ? <label>Brand name<input value={brandName} onChange={event => setBrandName(event.target.value)} autoComplete="organization" required /></label> : <label>Display name<input value={displayName} onChange={event => setDisplayName(event.target.value)} required /></label>}
          <div><button type="button" className="role-page__back" onClick={() => { setRole(''); setError('') }}>← Back</button><button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Continue ↗'}</button></div>
        </form>}
        {error && <p className="role-page__error" role="alert">{error}</p>}
      </div>
    </main>
  )
}
