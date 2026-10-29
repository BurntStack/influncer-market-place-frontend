import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCreator } from '../../data/creators.js'
import { completeSignup, login, oauthLogin, requestSignupVerification, verifySignupEmail } from '../../lib/auth.js'
import './AuthPage.css'
import './AuthStudio.css'

const loadScript = (src, id) => new Promise((resolve, reject) => {
  const existing = document.getElementById(id)
  if (existing) {
    if (existing.dataset.loaded === 'true') resolve()
    else existing.addEventListener('load', resolve, { once: true })
    return
  }
  const script = document.createElement('script')
  script.id = id
  script.src = src
  script.async = true
  script.onload = () => { script.dataset.loaded = 'true'; resolve() }
  script.onerror = () => reject(new Error('Could not load the sign-in provider.'))
  document.head.appendChild(script)
})

const getGoogleIdToken = async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Google sign-in is not configured yet.')
  await loadScript('https://accounts.google.com/gsi/client', 'google-identity-services')
  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => credential ? resolve(credential) : reject(new Error('Google did not return an identity token.')),
    })
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) reject(new Error('Google sign-in was dismissed. Please try again.'))
    })
  })
}

const getAppleIdToken = async () => {
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID
  if (!clientId) throw new Error('Apple sign-in is not configured yet.')
  await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js', 'apple-identity-services')
  window.AppleID.auth.init({ clientId, scope: 'name email', redirectURI: window.location.origin, usePopup: true })
  const response = await window.AppleID.auth.signIn()
  const idToken = response?.authorization?.id_token
  if (!idToken) throw new Error('Apple did not return an identity token.')
  return idToken
}

const signupCopy = (step, email) => ({
  email: ['Create your account.', 'Start with your email. We’ll verify it before you choose a password.', 'Continue with email'],
  verify: ['Check your email', `Enter the verification code sent to ${email}.`, 'Verify email'],
  password: ['Create your password', 'Your email is verified. Choose a secure password to finish creating your account.', 'Create account'],
}[step])

export default function AuthPage({ mode = 'signup' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = mode === 'signup'
  const [signupStep, setSignupStep] = useState('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [mobile, setMobile] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const ananya = getCreator('ananya-rao')
  const priya = getCreator('priya-nair')
  const [title, body, buttonText] = signupCopy(signupStep, email)
  const canSubmit = isSignup
    ? (signupStep === 'email' && email.trim()) || (signupStep === 'verify' && verificationCode.trim()) || (signupStep === 'password' && password.trim() && name.trim())
    : email.trim() && password.trim()

  const submit = async (event) => {
    event.preventDefault()
    if (!canSubmit || busy) return
    setError('')
    setBusy(true)
    try {
      if (!isSignup) {
        await login({ email: email.trim(), password })
        navigate(location.state?.from || '/dashboard', { replace: true })
      } else if (signupStep === 'email') {
        await requestSignupVerification(email.trim())
        setSignupStep('verify')
      } else if (signupStep === 'verify') {
        const data = await verifySignupEmail(email.trim(), verificationCode.trim())
        if (!data?.verificationToken) throw new Error('Verification could not be completed. Try again.')
        setVerificationToken(data.verificationToken)
        setSignupStep('password')
      } else {
        await completeSignup({ email: email.trim(), verificationToken, password, name: name.trim(), companyName: companyName.trim(), mobile: mobile.trim(), category })
        navigate(location.state?.from || '/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const socialAuth = async (provider) => {
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const idToken = provider === 'google' ? await getGoogleIdToken() : await getAppleIdToken()
      await oauthLogin(provider, idToken)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || `Could not sign in with ${provider}.`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth auth--studio">
      <aside className="auth__promo">
        <Link to="/" className="auth__logo"><span className="auth__logo-mark" />XXXXXX</Link>
        <div className="auth__promo-body">
          <span className="auth__eyebrow">THE BRAND WORKSPACE</span>
          <h1>Good ideas.<br /><span>Great company.</span></h1>
          <p className="auth__promo-copy">Find the right voices for your brand. Your next collaboration starts with a connection.</p>
          <div className="auth__visual">
            <div className="auth__photos"><img src={ananya.image} alt="Example beauty creator portrait" /><img src={priya.image} alt="Example lifestyle creator portrait" /></div>
            <span className="auth__visual-caption">Different perspectives. New possibilities.<span>Example creator imagery</span></span>
          </div>
        </div>
        <div className="auth__journey"><span><small>01</small>Your brief.</span><span><small>02</small>Their ideas.</span><span><small>03</small>Your choice.</span></div>
      </aside>
      <main className="auth__main">
        <div className="auth__main-top"><Link to="/">← Back to home</Link><span>For brands</span></div>
        <form className="auth__card" onSubmit={submit}>
          {isSignup && signupStep !== 'email' && <button type="button" className="auth__back" onClick={() => { if (signupStep === 'password') { setVerificationToken(''); setSignupStep('email') } else { setSignupStep('email') } }}>← Back</button>}
          {isSignup && <div className="auth__progress" aria-label={`Signup step ${signupStep === 'email' ? 1 : signupStep === 'verify' ? 2 : 3} of 3`}><span className="is-active" /><span className={signupStep !== 'email' ? 'is-active' : ''} /><span className={signupStep === 'password' ? 'is-active' : ''} /></div>}
          <span className="auth__form-eyebrow">{isSignup ? 'START SOMETHING GOOD.' : 'YOUR NEXT CHAPTER AWAITS.'}</span>
          <h2>{isSignup ? title : 'Welcome back.'}</h2>
          <p className="auth__sub">{isSignup ? body : 'Log in to manage your creator campaigns.'}</p>
          {(!isSignup || signupStep === 'email') && <><label className="auth__label" htmlFor="email">Email</label><div className="auth__field"><span className="auth__field-icon">✉</span><input id="email" type="email" placeholder="you@yourbrand.in" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus /></div></>}
          {isSignup && signupStep === 'verify' && <><label className="auth__label" htmlFor="verification-code">Verification code</label><div className="auth__field"><span className="auth__field-icon">#</span><input id="verification-code" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter your code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\s/g, ''))} autoFocus /></div></>}
          {isSignup && signupStep === 'password' && <>
            <label className="auth__label" htmlFor="name">Your name <span className="auth__required">*</span></label>
            <div className="auth__field"><span className="auth__field-icon">👤</span><input id="name" type="text" placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus /></div>
            <label className="auth__label" htmlFor="company">Company / brand name</label>
            <div className="auth__field"><span className="auth__field-icon">🏢</span><input id="company" type="text" placeholder="Mitti &amp; Co." value={companyName} onChange={(e) => setCompanyName(e.target.value)} autoComplete="organization" /></div>
            <label className="auth__label" htmlFor="mobile">Mobile number</label>
            <div className="auth__field"><span className="auth__field-icon">📱</span><input id="mobile" type="tel" placeholder="+91 98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value)} autoComplete="tel" /></div>
            <label className="auth__label" htmlFor="category">Brand category</label>
            <div className="auth__field auth__field--select"><select id="category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Select a category</option>{['Beauty & Skincare','Fashion & Styling','Tech & Gadgets','Fitness & Health','Food & Beverage','Home & Lifestyle','Travel','Finance','Education','Other'].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </>}
          {(!isSignup || signupStep === 'password') && <><label className="auth__label" htmlFor="password">Password <span className="auth__required">*</span></label><div className="auth__field"><input id="password" type={showPassword ? 'text' : 'password'} placeholder={isSignup ? 'Create a secure password' : 'Enter your password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} /><button type="button" className="auth__password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div></>}
          {error && <p className="auth__error" role="alert">{error}</p>}
          <button type="submit" className="auth__submit" disabled={!canSubmit || busy}>{busy ? 'Please wait…' : isSignup ? buttonText : 'Log in'}</button>
          {(!isSignup || signupStep === 'email') && <><div className="auth__divider"><span>or</span></div><button type="button" className="auth__social" onClick={() => socialAuth('google')} disabled={busy}><span className="auth__social-icon">G</span>{isSignup ? 'Sign up' : 'Log in'} with Google</button><button type="button" className="auth__social" onClick={() => socialAuth('apple')} disabled={busy}><span className="auth__social-icon">●</span>{isSignup ? 'Sign up' : 'Log in'} with Apple</button></>}
          <p className="auth__switch">{isSignup ? <>Already have an account? <Link to="/login" state={location.state}>Log in here</Link></> : <>New here? <Link to="/signup" state={location.state}>Create an account</Link></>}</p>
        </form>
        <p className="auth__legal">A better way for brands and creators to work together.</p>
      </main>
    </div>
  )
}
