import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { jobTabs, getCreator } from '../../data/dashboard.js'
import Modal from '../../components/Modal.jsx'
import { createCampaign, getCampaigns, updateCampaign, getCampaignBids, selectCampaignBid } from '../../api/dashboard.js'
import './dash-pages.css'
import './DashJobs.css'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

const emptyForm = { title: '', platform: 'Instagram', deliverables: '', budgetMin: '', budgetMax: '', applyBy: '', brief: '' }
const normalizeJob = job => {
  const statuses = { open_for_bids: 'Open for bids', in_progress: 'In progress', awarded: 'In progress', completed: 'Completed', closed: 'Closed', draft: 'Draft' }
  const status = statuses[job.status] || job.status || 'Open for bids'
  return { ...job, status, tone: status === 'Open for bids' ? 'green' : 'gray', bids: Number(job.bidCount ?? job.bids ?? 0), budgetMin: Number(job.budgetMin || 0), budgetMax: Number(job.budgetMax || 0) }
}

export default function DashJobs() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState('all')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reload, setReload] = useState(0)
  const [showForm, setShowForm] = useState(() => searchParams.get('post') === '1')
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [editingJob, setEditingJob] = useState(null)
  const [reviewingJob, setReviewingJob] = useState(null)
  const [reviewBids, setReviewBids] = useState([])
  const [bidError, setBidError] = useState('')
  const [bidsLoading, setBidsLoading] = useState(false)
  const [confirmBid, setConfirmBid] = useState(null)
  const bidRequest = useRef(0)
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
    setFormError(''); setFieldErrors({})
    setShowForm(true)
    setSearchParams({ post: '1' })
  }

  const closeComposer = (afterSave = false) => {
    if (saving && afterSave !== true) return
    setShowForm(false)
    setSearchParams({})
  }

  const openEdit = (job) => {
    setEditingJob(job)
    setForm({
      title: job.title || '', platform: job.platform || (job.meta?.split(' · ')[0] || 'Instagram'),
      deliverables: job.deliverables || (job.meta?.split(' · ')[1] || ''), budgetMin: job.budgetMin || '',
      budgetMax: job.budgetMax || '', applyBy: (job.applyBy || '').slice(0,10), brief: job.brief || '',
    })
    setFormError(''); setFieldErrors({}); setShowForm(true); setSearchParams({ post: '1' })
  }

  const openBids = async (job) => {
    const requestId = ++bidRequest.current
    setReviewingJob(job)
    setReviewBids([])
    setBidError(''); setBidsLoading(true); setConfirmBid(null)
    try {
      const data = await getCampaignBids(job.id)
      if (requestId !== bidRequest.current) return
      const bids = Array.isArray(data) ? data : data?.results || []
      setReviewBids(bids.map(bid => ({ ...bid, creator: bid.creator || getCreator(bid.creatorId), creatorId: bid.creator?.id || bid.creatorId })))
    } catch (error) { if (requestId === bidRequest.current) setBidError(error.message || 'Could not load bids. Please try again.') }
    finally { if (requestId === bidRequest.current) setBidsLoading(false) }
  }
  const closeBids = () => {
    if (selectingBid) return
    ++bidRequest.current; setReviewingJob(null); setConfirmBid(null)
    setSearchParams(current => { const next = new URLSearchParams(current); next.delete('review'); return next })
  }
  useEffect(() => {
    const job = jobs.find(item => String(item.id) === searchParams.get('review'))
    if (job && !reviewingJob) openBids(job)
  }, [jobs, searchParams])
  useEffect(() => () => { ++bidRequest.current }, [])

  const acceptBid = async (bid) => {
    if (selectingBid || !bid.id) return
    setSelectingBid(bid.id)
    setBidError('')
    try {
      await selectCampaignBid(reviewingJob.id, bid.id)
      setReviewingJob(null); setConfirmBid(null)
      navigate('/dashboard/orders')
    } catch (error) {
      setBidError(error.message || 'Could not select this bid. Please try again.')
    } finally {
      setSelectingBid(null)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setLoadError('')
    getCampaigns({ signal: controller.signal }).then((data) => {
      const next = Array.isArray(data) ? data : data?.results
      if (!controller.signal.aborted) setJobs((next || []).map(normalizeJob))
    }).catch(error => { if (!controller.signal.aborted) setLoadError(error.message || 'Could not load campaigns.') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload])

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
        ? current.map((job) => job.id === editingJob.id ? normalizeJob({ ...job, ...body, ...(saved || {}) }) : job)
        : [normalizeJob({ ...body, status: 'open_for_bids', ...(saved || {}) }), ...current])
      closeComposer(true)
      setForm(emptyForm); setFieldErrors({}); setEditingJob(null)
    } catch (err) {
      setFormError(err?.message || 'Could not save this job. Your entered details have been preserved.')
    } finally { setSaving(false) }
  }

  const visible = jobs.filter((j) => {
    if (tab === 'all') return true
    if (tab === 'open') return j.status === 'Open for bids'
    if (tab === 'progress') return j.status === 'In progress'
    if (tab === 'completed') return j.status === 'Completed'
    if (tab === 'drafts') return j.status === 'Draft'
    return false
  })

  const tabCounts = {
    all: jobs.length,
    open: jobs.filter((j) => j.status === 'Open for bids').length,
    progress: jobs.filter((j) => j.status === 'In progress').length,
    completed: jobs.filter(j => j.status === 'Completed').length,
    drafts: jobs.filter(j => j.status === 'Draft').length,
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
            A clear brief. Fresh perspectives. Choose the right creator for your next story.
          </p>
        </div>
        <div className="dpage__actions">
      <button className="btn btn--dark" onClick={openComposer}>+ Post a job</button>
        </div>
      </div>

      {showForm && <Modal title={editingJob ? 'Edit job' : 'Post a job'} subtitle="Give creators enough detail to send a strong bid." onClose={closeComposer} busy={saving}>
        <form className="campaign-form" onSubmit={submitJob}>
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
              Set the scope before funding the work
            </span>
            <div><button className="btn btn--outline" disabled={saving} type="button" onClick={closeComposer}>Cancel</button><button className="btn btn--dark" disabled={saving} type="submit">{saving ? 'Saving…' : editingJob ? 'Save changes' : 'Post job'} <span>→</span></button></div>
          </div>
        </form>
      </Modal>}

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
        {loading && <p className="workspace-message" role="status">Loading your campaigns…</p>}
        {loadError && <div className="workspace-message workspace-message--error" role="alert">{loadError} <button className="btn btn--outline btn--sm" onClick={() => setReload(n => n + 1)}>Try again</button></div>}
        {!loading && !loadError && !visible.length && <div className="workspace-empty"><h3>{tab === 'all' ? 'Your next story starts here.' : 'No campaigns in this view.'}</h3><p>Post a brief, set your budget, and invite fresh ideas from creators.</p><button className="btn btn--dark" onClick={openComposer}>Post a campaign ↗</button></div>}
        {visible.map((j) => {
          const bidders = (j.bidders || []).map(item => typeof item === 'object' ? item : getCreator(item)).filter(Boolean)
          const hired = typeof j.hired === 'object' ? j.hired : j.hired ? getCreator(j.hired) : null
          return (
            <article className="jobcard-row dcard" key={j.id}>
              <div className="jobcard-row__top">
                <div>
                  <h3>
                    {j.title}{' '}
                    <span className={`pill pill--${j.tone} pill--dot`}>{j.status}</span>
                  </h3>
                  <p className="jobcard-row__meta">{j.meta || [j.platform, j.deliverables, j.applyBy && `Apply by ${new Date(j.applyBy).toLocaleDateString('en-IN')}`].filter(Boolean).join(' · ')}</p>
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
                  {j.closes || j.escrowNote || (j.status === 'Open for bids' ? 'Compare proposals before choosing your creator.' : 'Keep your collaboration moving.')}
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

      {reviewingJob && <Modal title={confirmBid ? 'Ready to work together?' : 'Review bids'} subtitle={reviewingJob.title} onClose={closeBids} busy={Boolean(selectingBid)} wide>
        <div className="bid-summary"><span>{bidsLoading ? 'Loading proposals' : `${reviewBids.length} creator proposals`}</span><strong>Budget {inr(reviewingJob.budgetMin)} – {inr(reviewingJob.budgetMax)}</strong></div>
        {bidError && <div className="workspace-message workspace-message--error" role="alert">{bidError}{!confirmBid && <button className="btn btn--outline btn--sm" onClick={() => openBids(reviewingJob)}>Retry bids</button>}</div>}
        {bidsLoading ? <p className="workspace-message" role="status">Finding the ideas behind your next campaign…</p> : confirmBid ? <div className="bid-confirm"><span className="eyebrow">YOUR CHOSEN COLLABORATOR</span><h3>{confirmBid.creator?.name || confirmBid.name || 'Creator'}</h3><strong>{inr(confirmBid.price ?? confirmBid.amount ?? confirmBid.bidAmount)}</strong><p>Confirming creates an order for this proposal. Review the scope with the creator before funding the work. Your account will not be charged by this action.</p><div className="workspace-form__actions"><button className="btn btn--outline" disabled={Boolean(selectingBid)} onClick={() => { setConfirmBid(null); setBidError('') }}>Back to proposals</button><button className="btn btn--dark" disabled={Boolean(selectingBid)} onClick={() => acceptBid(confirmBid)}>{selectingBid ? 'Creating order…' : 'Confirm creator & create order'}</button></div></div> : <div className="bid-list">
          {reviewBids.map((bid,index) => <article className="bid-card" key={bid.id || index}><div className="bid-card__head">{bid.creator?.image || bid.creator?.avatar ? <img src={bid.creator.image || bid.creator.avatar} alt="" /> : <span className="bid-card__avatar">{(bid.creator?.name || bid.name || 'C').charAt(0)}</span>}<div><h3>{bid.creator?.name || bid.name || 'Creator'}</h3><span>{[bid.creator?.platform, bid.creator?.followers && `${bid.creator.followers} followers`, bid.creator?.location].filter(Boolean).join(' · ') || 'Campaign proposal'}</span></div><strong>{inr(bid.price ?? bid.amount ?? bid.bidAmount)}</strong></div><p>{bid.message || bid.note || bid.creator?.note || 'This creator has submitted a proposal for your campaign.'}</p><div className="bid-card__estimates">{bid.expectedViews != null && <span>Estimated views: {Number(bid.expectedViews).toLocaleString('en-IN')}</span>}{bid.expectedReach != null && <span>Estimated reach: {Number(bid.expectedReach).toLocaleString('en-IN')}</span>}{bid.deliveryDays && <span>Delivery: {bid.deliveryDays} days</span>}</div><div className="bid-card__actions">{bid.creatorId ? <Link className="btn btn--outline btn--sm" to={`/creators/${bid.creatorId}`} state={{ fromBids: `/dashboard/jobs?review=${encodeURIComponent(reviewingJob.id)}` }}>View profile ↗</Link> : <span>Profile unavailable</span>}<button className="btn btn--dark btn--sm" disabled={!bid.id || (bid.status && !['pending','submitted','Pending'].includes(bid.status)) || ['Completed','Closed','In progress'].includes(reviewingJob.status)} onClick={() => { setConfirmBid(bid); setBidError('') }}>{bid.status && !['pending','submitted','Pending'].includes(bid.status) ? bid.status : 'Select creator'}</button></div></article>)}
          {!reviewBids.length && !bidError && <div className="workspace-empty"><h3>No bids yet.</h3><p>Proposals will appear here when creators apply. You can check back or update your campaign brief.</p><button className="btn btn--outline" onClick={() => { const job = reviewingJob; closeBids(); openEdit(job) }}>Edit campaign brief</button></div>}
        </div>}
      </Modal>}
    </div>
  )
}
