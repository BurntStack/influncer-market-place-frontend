import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCreator } from '../../data/creators.js'
import { login, signup } from '../../lib/auth.js'
import './AuthPage.css'

export default function AuthPage({ mode = 'signup' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = mode === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const ananya = getCreator('ananya-rao')
  const priya = getCreator('priya-nair')
  const avatars = ['ananya-rao', 'rohan-mehta', 'meera-iyer', 'kabir-singh'].map(getCreator)

  // Signup now also needs a password (the API requires one). Name + company are
  // collected in onboarding; we seed them from the email until there's a
  // profile-update endpoint to persist the onboarding values server-side.
  const canSubmit = email.trim() && password.trim()

  const submit = async (e) => {
    e.preventDefault()
    if (!canSubmit || busy) return
    setError('')
    setBusy(true)
    try {
      const guess = email.split('@')[0] || 'there'
      if (isSignup) {
        await signup({ name: guess, email: email.trim(), password, companyName: guess })
      } else {
        await login({ email: email.trim(), password })
      }
      // New sign-ups go through onboarding; returning log-ins go straight in
      // (or back to the page they were gated from).
      const dest = isSignup ? '/onboarding' : location.state?.from || '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const socialAuth = () => setError('Social sign-in isn’t available yet — use your email and password.')

  return (
    <div className="auth">
      {/* Promo panel */}
      <aside className="auth__promo">
        <Link to="/" className="auth__logo">
          <span className="auth__logo-mark" />
          XXXXXX
        </Link>

        <div className="auth__promo-body">
          <span className="auth__eyebrow">For brands</span>
          <h1>
            Hire creators you trust.
            <br />
            Pay only when it’s live.
          </h1>

          <div className="auth__visual">
            <span className="auth__badge auth__badge--delivered">✓ Reel delivered</span>
            <span className="auth__badge auth__badge--bids">12 bids · ₹5k – ₹15k</span>
            <div className="auth__photos">
              <img src={ananya.image} alt="" />
              <img src={priya.image} alt="" />
            </div>
            <span className="auth__badge auth__badge--escrow">● ₹8,000 held safely</span>
            <span className="auth__creator">
              <strong>Ananya Rao</strong> Beauty · Bengaluru · ★ 4.9
            </span>
          </div>
        </div>

        <div className="auth__social-proof">
          <div className="auth__avatars">
            {avatars.map((c) => (
              <img key={c.id} src={c.image} alt="" />
            ))}
          </div>
          <span>
            <strong>25,000+ brands and creators</strong>
            <br />
            already working on xxxxxx
          </span>
        </div>
      </aside>

      {/* Form card */}
      <main className="auth__main">
        <form className="auth__card" onSubmit={submit}>
          <h2>{isSignup ? 'Join xxxxxx' : 'Welcome back'}</h2>
          <p className="auth__sub">
            {isSignup
              ? 'Find, hire and pay Indian creators in one place.'
              : 'Log in to manage your creator campaigns.'}
          </p>

          <label className="auth__label" htmlFor="email">
            Email
          </label>
          <div className="auth__field">
            <span className="auth__field-icon">✉</span>
            <input
              id="email"
              type="email"
              placeholder="you@yourbrand.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <label className="auth__label" htmlFor="password">
            Password
          </label>
          <div className="auth__field">
            <span className="auth__field-icon">🔒</span>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className="auth__error">{error}</p>}

          <button type="submit" className="auth__submit" disabled={!canSubmit || busy}>
            {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
          </button>

          <div className="auth__divider">
            <span>or</span>
          </div>

          <button type="button" className="auth__social" onClick={socialAuth} disabled={busy}>
            <span className="auth__social-icon">G</span>
            {isSignup ? 'Sign up' : 'Log in'} with Google
          </button>
          <button type="button" className="auth__social" onClick={socialAuth} disabled={busy}>
            <span className="auth__social-icon"></span>
            {isSignup ? 'Sign up' : 'Log in'} with Apple
          </button>

          <p className="auth__switch">
            {isSignup ? (
              <>
                Already have an account? <Link to="/login">Log in here</Link>
              </>
            ) : (
              <>
                New to xxxxxx? <Link to="/signup">Create an account</Link>
              </>
            )}
          </p>
        </form>

        <p className="auth__legal">
          <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
        </p>
      </main>
    </div>
  )
}
