import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateLocalUser } from '../../lib/auth.js'
import './OnboardingPage.css'

const CATEGORIES = [
  'Food & beverage',
  'Beauty & skincare',
  'Fashion & apparel',
  'Health & fitness',
  'Tech & gadgets',
  'Travel & hospitality',
  'Home & lifestyle',
  'Baby & kids',
  'Finance',
  'Education',
  'Gaming',
  'Other',
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [brandName, setBrandName] = useState('')
  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [selected, setSelected] = useState(['Food & beverage'])

  const toggle = (cat) =>
    setSelected((s) => (s.includes(cat) ? s.filter((c) => c !== cat) : [...s, cat]))

  const submit = (e) => {
    e.preventDefault()
    // No profile endpoint in the contract yet — keep these client-side so the
    // dashboard chrome shows the real brand name. Swap for a PATCH later.
    updateLocalUser({
      name: fullName.trim() || undefined,
      companyName: brandName.trim() || undefined,
      mobile: mobile.trim() || undefined,
      categories: selected,
    })
    navigate('/dashboard')
  }

  return (
    <div className="onb">
      <form className="onb__card" onSubmit={submit}>
        <span className="onb__pill">Almost there</span>
        <h1>Tell us about your brand</h1>
        <p className="onb__sub">A few quick details so creators know who they’re working with.</p>

        <div className="onb__row">
          <div className="onb__field">
            <label htmlFor="brand">Name of the brand</label>
            <input
              id="brand"
              placeholder="e.g. Nimbu Foods"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>
          <div className="onb__field">
            <label htmlFor="full">Your full name</label>
            <input
              id="full"
              placeholder="e.g. Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="onb__field">
          <label htmlFor="mobile">Mobile number</label>
          <div className="onb__phone">
            <span className="onb__prefix">
              <strong>IN</strong> +91
            </span>
            <input
              id="mobile"
              type="tel"
              placeholder="98765 43210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
        </div>

        <div className="onb__field">
          <label>
            Category of your brand <span className="onb__hint">· pick one or more</span>
          </label>
          <div className="onb__chips">
            {CATEGORIES.map((cat) => {
              const on = selected.includes(cat)
              return (
                <button
                  type="button"
                  key={cat}
                  className={`onb__chip ${on ? 'is-selected' : ''}`}
                  onClick={() => toggle(cat)}
                >
                  {on && <span className="onb__check">✓</span>}
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        <button type="submit" className="btn btn--dark onb__continue">
          Continue to dashboard →
        </button>
        <button type="button" className="onb__skip" onClick={() => navigate('/dashboard')}>
          Skip for now
        </button>
      </form>
    </div>
  )
}
