import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HiringSteps.css'

const STEPS = [
  {
    icon: '📄',
    title: 'Post a job with your budget range',
    body: 'Describe the deliverables and set a range, like ₹5,000 – ₹15,000. Creators see it before they bid.',
  },
  {
    icon: '💬',
    title: 'Creators start bidding',
    body: 'Matching creators send their price and a short note on why they fit your brand.',
  },
  {
    icon: '💳',
    title: 'Pick a creator and pay',
    body: 'Compare bids, profiles and past work. Choose one and pay the agreed amount.',
  },
  {
    icon: '🛡️',
    title: 'xxxxxx holds the money',
    body: 'Your payment stays safe in escrow while the creator makes and posts the content.',
  },
  {
    icon: '✓',
    title: 'Verified, then paid out automatically',
    body: 'Once the work is verified, the amount is released to the creator’s bank account on its own.',
    done: true,
  },
]

const BIDS = [
  { name: 'Tara Fernandes', note: 'Travel + lifestyle, 3 past food brands', price: '₹7,500', selected: true },
  { name: 'Priya Nair', note: 'Home-cooking audience in Kerala', price: '₹9,000' },
  { name: 'Diya Malhotra', note: 'Reels avg. 40k views', price: '₹12,000' },
]

export default function HiringSteps() {
  const navigate = useNavigate()
  const [selectedName, setSelectedName] = useState(BIDS[0].name)
  const selectedBid = BIDS.find((bid) => bid.name === selectedName)
  return (
    <section className="section hiring" id="brands">
      <div className="container">
        <div className="hiring__head">
          <span className="eyebrow" style={{ color: 'var(--pink)' }}>
            How hiring works
          </span>
          <h2>Post a Job. Let Creators Bid.</h2>
          <p>Set your budget, get bids, and pay only when the work is verified.</p>
        </div>

        <div className="hiring__grid">
          {/* Job + bids card */}
          <div className="jobcard card">
            <div className="jobcard__inner card">
              <div className="jobcard__top">
                <span className="jobcard__kicker">Job · Instagram Reel</span>
                <span className="jobcard__status">Open for bids</span>
              </div>
              <h3 className="jobcard__title">Festive snack hamper launch</h3>

              <div className="jobcard__budget-label">Budget range</div>
              <div className="jobcard__budget">
                <span>₹5,000</span>
                <span>₹15,000</span>
              </div>
              <div className="jobcard__track">
                <span className="jobcard__tick" style={{ left: '28%' }} />
                <span className="jobcard__tick" style={{ left: '50%' }} />
                <span className="jobcard__tick" style={{ left: '72%' }} />
              </div>
              <div className="jobcard__track-note">Ticks show where bids landed</div>

              <div className="jobcard__bids-head">
                <strong>12 bids</strong>
                <span>Closes in 2 days</span>
              </div>
              <ul className="jobcard__bids">
                {BIDS.map((b) => (
                  <li key={b.name}>
                    <span className="jobcard__avatar" aria-hidden>
                      {b.name.charAt(0)}
                    </span>
                    <div className="jobcard__bidinfo">
                      <strong>{b.name}</strong>
                      <span>{b.note}</span>
                    </div>
                    <span className="jobcard__bidprice">{b.price}</span>
                    <button type="button" aria-pressed={selectedName === b.name} onClick={() => setSelectedName(b.name)} className={`jobcard__pick ${selectedName === b.name ? 'is-selected' : ''}`}>
                      {selectedName === b.name ? 'Selected' : 'Select'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="jobcard__escrow">
              <span className="jobcard__shield">🛡️</span>
              <div>
                <strong>{selectedBid.price} · example booking</strong>
                <span>Selected: {selectedBid.name}. No payment is taken in this preview.</span>
              </div>
              <span className="jobcard__escrow-tag">In escrow</span>
            </div>
          </div>

          {/* Steps timeline */}
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li className={`step ${s.done ? 'step--done' : ''}`} key={s.title}>
                <span className="step__marker">{s.icon}</span>
                <div className="step__content">
                  <span className="step__num">Step {i + 1}</span>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
            <li className="steps__cta">
              <button className="btn btn--dark btn--lg" onClick={() => navigate('/dashboard/jobs?post=1')}>Post your first job</button>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
