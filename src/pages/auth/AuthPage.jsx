import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fetchMe, postLoginPath, requestOtp, verifyOtp } from '../../lib/auth.js'
import LogoMark from '../../components/LogoMark.jsx'
import './AuthPage.css'
import './AuthStudio.css'

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isSignup = mode === 'signup'
  const validPhone = /^\d{10}$/.test(phone)

  const sendCode = async () => {
    const result = await requestOtp(phone)
    if (!result?.challengeId) throw new Error('The server did not return a challenge ID. Please try again.')
    setChallengeId(result.challengeId)
    setCode('')
    setStep('code')
  }

  const submit = async event => {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try {
      if (step === 'phone') {
        if (!validPhone) throw new Error('Enter a 10-digit mobile number.')
        await sendCode()
      } else {
        if (code.length !== 6) throw new Error('Enter the 6-digit verification code.')
        const session = await verifyOtp(challengeId, code.trim())
        if (!session?.access) throw new Error('Verification did not return an access token.')
        const user = session.user?.role ? session.user : await fetchMe()
        const destination = postLoginPath(user?.role, location.state?.from)
        navigate(destination, { replace: true, state: destination === '/choose-role' ? { from: location.state?.from } : undefined })
      }
    } catch (err) { setError(err?.message || 'Could not sign in. Please try again.') }
    finally { setBusy(false) }
  }

  const resend = async () => {
    if (busy) return
    setBusy(true); setError('')
    try { await sendCode() }
    catch (err) { setError(err?.message || 'Could not resend the code.') }
    finally { setBusy(false) }
  }

  return (
    <div className="auth auth--studio">
      <aside className="auth__promo">
        <Link to="/" className="auth__logo"><LogoMark className="auth__logo-mark" />LinkLoom</Link>
        <div className="auth__promo-body">
          <span className="auth__eyebrow">THE CREATOR MARKETPLACE</span>
          <h1>Good ideas.<br /><span>Great company.</span></h1>
          <p className="auth__promo-copy">Find the right voices for your brand. Your next collaboration starts with a connection.</p>
          <div className="auth__photo-free"><img src="/creators/meera-iyer.webp" alt="Creator outdoors" /><div><span>BRANDS × CREATORS</span><h2>Different perspectives.<br />New possibilities.</h2><p>Your brief brings the right people together. Start with an idea.</p></div></div>
        </div>
        <div className="auth__journey"><span><small>01</small>Your brief.</span><span><small>02</small>Their ideas.</span><span><small>03</small>Your choice.</span></div>
      </aside>
      <main className="auth__main">
        <div className="auth__main-top"><Link to="/">← Back to home</Link><span>For brands and creators</span></div>
        <form className="auth__card" onSubmit={submit}>
          {step === 'code' && <button type="button" className="auth__back" onClick={() => { setStep('phone'); setError('') }}>← Change number</button>}
          <span className="auth__form-eyebrow">WELCOME TO LINKLOOM</span>
          <h2>{step === 'phone' ? (isSignup ? 'Create your account.' : 'Welcome back.') : 'Check your messages.'}</h2>
          <p className="auth__sub">{step === 'phone' ? 'Enter your mobile number to receive a one-time code.' : `Enter the code sent to +91 ${phone}.`}</p>
          {step === 'phone' ? <>
            <label className="auth__label" htmlFor="phone">Mobile number</label>
            <div className="auth__field"><span>+91</span><input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="9876543210" maxLength={10} value={phone} onChange={event => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} autoFocus /></div>
          </> : <>
            <label className="auth__label" htmlFor="otp">Verification code</label>
            <div className="auth__field"><input id="otp" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter your code" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus /></div>
          </>}
          {error && <p className="auth__error" role="alert">{error}</p>}
          <button className="auth__submit" type="submit" disabled={busy || (step === 'phone' ? !validPhone : code.length !== 6)}>{busy ? 'Please wait…' : step === 'phone' ? 'Send code' : 'Verify and continue'}</button>
          {step === 'code' && <button type="button" className="auth__back" onClick={resend} disabled={busy} style={{ marginTop: 18 }}>Resend code</button>}
          <p className="auth__switch">{isSignup ? <>Already have an account? <Link to="/login" state={location.state}>Log in</Link></> : <>New here? <Link to="/signup" state={location.state}>Create an account</Link></>}</p>
        </form>
        <p className="auth__legal">A better way for brands and creators to work together.</p>
      </main>
    </div>
  )
}
