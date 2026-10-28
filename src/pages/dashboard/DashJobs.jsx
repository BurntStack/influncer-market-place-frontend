import { useState } from 'react'
import { jobTabs, jobs, jobsCompleted, getCreator } from '../../data/dashboard.js'
import './dash-pages.css'
import './DashJobs.css'

const inr = (n) => '₹' + n.toLocaleString('en-IN')

export default function DashJobs() {
  const [tab, setTab] = useState('all')

  const visible = jobs.filter((j) => {
    if (tab === 'all') return true
    if (tab === 'open') return j.status === 'Open for bids'
    if (tab === 'progress') return j.status === 'In progress'
    return false
  })

  return (
    <div className="dpage">
      <div className="dpage__head">
        <div>
          <h1 className="dpage__title">Jobs</h1>
          <p className="dpage__sub">
            Post a job with a budget range. Creators bid, you pick — and pay only when it’s live.
          </p>
        </div>
        <div className="dpage__actions">
          <button className="btn btn--dark">+ Post a job</button>
        </div>
      </div>

      <div className="dtabrow">
        {jobTabs.map((t) => (
          <button
            key={t.key}
            className={`dtab ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="dtab__count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="jobs__list">
        {visible.map((j) => {
          const bidders = (j.bidders || []).map(getCreator)
          const hired = j.hired ? getCreator(j.hired) : null
          return (
            <article className="jobcard-row dcard" key={j.id}>
              <div className="jobcard-row__top">
                <div>
                  <h3>
                    {j.title}{' '}
                    <span className={`pill pill--${j.tone} pill--dot`}>{j.status}</span>
                  </h3>
                  <p className="jobcard-row__meta">{j.meta}</p>
                </div>
                {hired ? (
                  <div className="jobcard-row__hired">
                    <img src={hired.image} alt="" />
                    Hired {hired.name}
                  </div>
                ) : (
                  <div className="jobcard-row__bids">
                    <span className="davatars">
                      {bidders.map((b) => (
                        <img key={b.id} src={b.image} alt="" />
                      ))}
                    </span>
                    {j.bids} bids
                  </div>
                )}
              </div>

              <div className="jobcard-row__budget">
                <span>Budget {inr(j.budgetMin)}</span>
                <span className="dbudget">
                  <span className="dbudget__tick" style={{ left: '28%' }} />
                  <span className="dbudget__tick" style={{ left: '50%' }} />
                  <span className="dbudget__tick" style={{ left: '72%' }} />
                </span>
                <span>{inr(j.budgetMax)}</span>
              </div>

              <div className="jobcard-row__foot">
                <span className="jobcard-row__note">
                  {j.closes ? `◷ ${j.closes}` : `🔒 ${j.escrowNote}`}
                </span>
                <div className="jobcard-row__actions">
                  <button className="dbtn-ghost">Edit</button>
                  <button className="btn btn--dark btn--sm">
                    {hired ? 'Open order' : `Review ${j.bids} bids`}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {(tab === 'all' || tab === 'completed') && (
        <div className="dcard jobs__completed">
          <h3>Recently completed</h3>
          {jobsCompleted.map((c) => {
            const creator = getCreator(c.creatorId)
            return (
              <div className="jobs__completed-row" key={c.title}>
                <img src={creator.image} alt="" />
                <div className="jobs__completed-info">
                  <strong>{c.title}</strong>
                  <span>with {c.with}</span>
                </div>
                <span className="jobs__completed-amount">{inr(c.amount)}</span>
                <span className="pill pill--gray">{c.paid}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
