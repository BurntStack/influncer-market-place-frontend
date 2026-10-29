import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { jobTabs, jobs as mockJobs, jobsCompleted, getCreator } from '../../data/dashboard.js'
import { createCampaign, getCampaigns, updateCampaign, getCampaignBids, selectCampaignBid } from '../../api/dashboard.js'
import './dash-pages.css'
import './DashJobs.css'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

const emptyForm = { title: '', platform: 'Instagram', deliverables: '', budgetMin: '', budgetMax: '', applyBy: '', brief: '' }

export default function DashJobs() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState('all')
  const [jobs, setJobs] = useState(mockJobs)
  const [showForm, setShowForm] = useState(() => searchParams.get('post') === '1')
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [editingJob, setEditingJob] = useState(null)
  const [reviewingJob, setReviewingJob] = useState(null)
  const [reviewBids, setReviewBids] = useState([])
  const [bidError, setBidError] = useState('')
  const [selectingBid, setSelectingBid] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { setShowForm(searchParams.get('post') === '1') }, [searchParams])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  const openComposer = () => {
    setEditingJob(null)
    setForm(emptyForm)
    setShowForm(true)
    setSearchParams({ post: '1' })
  }

  const closeComposer = () => {
    setShowForm(false)
    setSearchParams({})
  }

  const openEdit = (job) => {
    setEditingJob(job)
    setForm({
      title: job.title || '', platform: job.platform || (job.meta?.split(' · ')[0] || 'Instagram'),
      deliverables: job.deliverables || (job.meta?.split(' · ')[1] || ''), budgetMin: job.budgetMin || '',
      budgetMax: job.budgetMax || '', applyBy: job.applyBy || '', brief: job.brief || '',
    })
    setFormError(''); setFieldErrors({}); setShowForm(true); setSearchParams({ post: '1' })
  }

  const openBids = async (job) => {
    setReviewingJob(job)
    setReviewBids([])
    setBidError('Loading bids…')
    if (job.id && !String(job.id).startsWith('local-')) {
      try {
        const data = await getCampaignBids(job.id)
        const bids = Array.isArray(data) ? data : data?.results || []
        setReviewBids(bids.map((bid) => ({ ...bid, creator: bid.creator || getCreator(bid.creatorId) })))
        setBidError('')
      } catch (_) { setBidError('Could not load bids. Close this panel and try again.') }
    }
  }

  const acceptBid = async (bid) => {
    if (selectingBid || !bid.id) return
    if (!window.confirm(`Select ${bid.creator?.name || 'this creator'} for ${inr(bid.price ?? bid.amount ?? bid.bidAmount ?? 0)}? This creates an order; it does not charge your account.`)) return
    setSelectingBid(bid.id)
    setBidError('')
    try {
      await selectCampaignBid(reviewingJob.id, bid.id)
      setReviewingJob(null)
      navigate('/dashboard/orders')
    } catch (error) {
      setBidError(error.message || 'Could not select this bid. Please try again.')
    } finally {
      setSelectingBid(null)
    }
  }

  useEffect(() => {
    getCampaigns().then((data) => {
      const next = Array.isArray(data) ? data : data?.results
      if (next?.length) setJobs(next.map((j) => ({
        ...j,
        status: j.status === 'open_for_bids' ? 'Open for bids' : j.status === 'in_progress' ? 'In progress' : j.status,
        tone: j.status === 'open_for_bids' ? 'green' : 'orange',
        bids: j.bidCount ?? j.bids ?? 0,
        budgetMin: j.budgetMin ?? 0,
        budgetMax: j.budgetMax ?? 0,
      })))
    }).catch(() => {})
  }, [])

  const submitJob = async (event) => {
    event.preventDefault(); setFormError('')
    if (saving) return
    const errors = {}
    if (!form.title.trim()) errors.title = 'Add a clear job title.'
    if (!form.deliverables.trim()) errors.deliverables = 'Add at least one deliverable.'
    if (!form.budgetMin || Number(form.budgetMin) < 1) errors.budgetMin = 'Enter a minimum budget.'
    if (!form.budgetMax || Number(form.budgetMax) < 1) errors.budgetMax = 'Enter a maximum budget.'
    if (Number(form.budgetMin) > Number(form.budgetMax)) errors.budgetMax = 'Maximum must be higher than minimum.'
    if (form.applyBy && new Date(form.applyBy) < new Date(new Date().toDateString())) errors.applyBy = 'Choose a future date.'
    if (Object.keys(errors).length) { setFieldErrors(errors); return }

    const body = { ...form, title: form.title.trim(), deliverables: form.deliverables.trim(), budgetMin: Number(form.budgetMin), budgetMax: Number(form.budgetMax) }
    setSaving(true)
    try {
      const saved = editingJob ? await updateCampaign(editingJob.id, body) : await createCampaign(body)
      setJobs((current) => editingJob
        ? current.map((job) => job.id === editingJob.id ? { ...job, ...body, ...(saved || {}) } : job)
        : [{ ...body, ...(saved || {}), id: saved?.id || `local-${Date.now()}`, status: 'Open for bids', tone: 'green', bids: 0 }, ...current])
      closeComposer()
      setForm(emptyForm); setFieldErrors({}); setEditingJob(null)
    } catch (err) {
      setFormError(err?.message || 'Could not save this job. Your entered details have been preserved.')
    } finally { setSaving(false) }
  }

  const visible = jobs.filter((j) => {
    if (tab === 'all') return true
    if (tab === 'open') return j.status === 'Open for bids'
    if (tab === 'progress') return j.status === 'In progress'
    return false
  })

  const tabCounts = {
    all: jobs.length,
    open: jobs.filter((j) => j.status === 'Open for bids').length,
    progress: jobs.filter((j) => j.status === 'In progress').length,
    completed: jobsCompleted.length,
    drafts: 0,
  }

  const input = (field, props = {}) => (
    <div className="jobform__field">
      <input {...props} value={form[field]} onChange={(event) => updateField(field, event.target.value)} aria-invalid={Boolean(fieldErrors[field])} />
      {fieldErrors[field] && <span className="jobform__error">{fieldErrors[field]}</span>}
    </div>
  )

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
      <button className="btn btn--dark" onClick={openComposer}>+ Post a job</button>
        </div>
      </div>

      {showForm && <div className="jobcomposer" role="dialog" aria-modal="true" aria-labelledby="jobcomposer-title">
        <button className="jobcomposer__backdrop" type="button" aria-label="Close job composer" onClick={closeComposer} />
        <form className="jobcomposer__panel" onSubmit={submitJob}>
          <div className="jobcomposer__head">
            <div><span className="eyebrow">{editingJob ? 'Update campaign' : 'New campaign'}</span><h2 id="jobcomposer-title">{editingJob ? 'Edit job' : 'Post a job'}</h2><p>Give creators enough detail to send a strong bid.</p></div>
            <button className="jobcomposer__close" type="button" onClick={closeComposer} aria-label="Close">×</button>
          </div>
          <div className="jobcomposer__body">
            <section className="jobform__section">
              <div className="jobform__section-title"><span>01</span><div><h3>Campaign basics</h3><p>Start with the essentials.</p></div></div>
              <label>Job title {input('title', { placeholder: 'e.g. Festive snack hamper launch' })}</label>
              <div className="jobform__grid">
                <label>Platform <select value={form.platform} onChange={(event) => updateField('platform', event.target.value)}><option>Instagram</option><option>YouTube</option><option>UGC</option><option>Multiple platforms</option></select></label>
                <label>Apply by {input('applyBy', { type: 'date' })}</label>
              </div>
              <label>Deliverables {input('deliverables', { placeholder: 'e.g. 1 Reel + 2 Stories' })}</label>
            </section>
            <section className="jobform__section">
              <div className="jobform__section-title"><span>02</span><div><h3>Budget & brief</h3><p>Set expectations before creators bid.</p></div></div>
              <div className="jobform__grid">
                <label>Minimum budget {input('budgetMin', { type: 'number', min: '1', placeholder: '₹ 5,000' })}</label>
                <label>Maximum budget {input('budgetMax', { type: 'number', min: '1', placeholder: '₹ 15,000' })}</label>
              </div>
              <label>Brief <div className="jobform__field"><textarea value={form.brief} onChange={(event) => updateField('brief', event.target.value)} placeholder="Share the product, audience, tone, dos and don'ts…" rows="5" maxLength="1000" /><span className="jobform__hint">{form.brief.length}/1000</span></div></label>
            </section>
          </div>
          <div className="jobcomposer__foot">
            {formError && <p className="jobform__error">{formError}</p>}
            <span className="jobcomposer__secure">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Payments stay protected in escrow
            </span>
            <div><button className="btn btn--outline" type="button" onClick={closeComposer}>Cancel</button><button className="btn btn--dark" disabled={saving} type="submit">{saving ? 'Saving…' : editingJob ? 'Save changes' : 'Post job'} <span>→</span></button></div>
          </div>
        </form>
      </div>}

      <div className="dtabrow">
        {jobTabs.map((t) => (
          <button
            key={t.key}
            className={`dtab ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="dtab__count">{tabCounts[t.key]}</span>
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
                  {j.closes ? `⏱ ${j.closes}` : `⚿ ${j.escrowNote}`}
                </span>
                <div className="jobcard-row__actions">
                  <button className="dbtn-ghost" onClick={() => openEdit(j)}>Edit</button>
                  <button className="btn btn--dark btn--sm" onClick={() => hired ? navigate('/dashboard/orders') : openBids(j)}>
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

      {reviewingJob && <div className="jobcomposer jobreview" role="dialog" aria-modal="true" aria-labelledby="review-title">
        <button className="jobcomposer__backdrop" type="button" aria-label="Close bid review" onClick={() => setReviewingJob(null)} />
        <section className="jobcomposer__panel jobreview__panel">
          <div className="jobcomposer__head"><div><span className="eyebrow">{reviewingJob.bids || reviewBids.length} creator bids</span><h2 id="review-title">Review bids</h2><p>{reviewingJob.title}</p></div><button className="jobcomposer__close" type="button" onClick={() => setReviewingJob(null)} aria-label="Close">×</button></div>
          <div className="jobreview__list">
            {bidError && <p role="status" className="dpage__sub">{bidError}</p>}
            {reviewBids.length ? reviewBids.map((bid, index) => <article className="jobreview__bid" key={bid.creator?.id || bid.creatorId || index}>
              {bid.creator?.image ? <img src={bid.creator.image} alt="" /> : <div className="jobreview__avatar">{(bid.creator?.name || 'C').charAt(0)}</div>}
              <div className="jobreview__info"><strong>{bid.creator?.name || bid.name || 'Creator'}</strong><span>{bid.creator?.handle || bid.handle || 'Creator profile'} · {bid.note || 'Ready to collaborate on your campaign.'}</span></div>
              <strong className="jobreview__amount">{inr(bid.price ?? bid.amount ?? bid.bidAmount ?? 0)}</strong>
              <button className="btn btn--outline btn--sm" type="button" disabled={!bid.creator?.id} onClick={() => navigate(`/creators/${bid.creator.id}`)}>View profile</button>
              <button className="btn btn--primary btn--sm" type="button" disabled={!bid.id || Boolean(selectingBid)} onClick={() => acceptBid(bid)}>{selectingBid === bid.id ? 'Selecting…' : 'Select creator'}</button>
            </article>) : <div className="jobreview__empty"><span>◎</span><strong>No bids yet</strong><p>Creators will appear here as they apply to this job.</p></div>}
          </div>
        </section>
      </div>}
    </div>
  )
}
