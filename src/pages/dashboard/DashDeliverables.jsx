import { useEffect, useRef, useState } from 'react'
import { getCreator } from '../../data/dashboard.js'
import { getDeliverables, getDeliverable, getCampaigns } from '../../api/dashboard.js'
import Modal from '../../components/Modal.jsx'
import { downloadFile } from '../../lib/apiClient.js'
import Dropdown from '../../components/Dropdown.jsx'
import './dash-pages.css'
import './DashDeliverables.css'

const FILTERS = [
  { key: 'job', label: 'Job', options: ['All jobs', 'Festive snack hamper launch', 'Diwali gift box unboxing', 'Nimbu masala soda — UGC'] },
  { key: 'platform', label: 'Platform', options: ['All', 'Instagram', 'YouTube'] },
  { key: 'date', label: 'Date', options: ['All time', 'Last 7 days', 'Last 30 days', 'This year'] },
]

export default function DashDeliverables() {
  const [filters, setFilters] = useState({ job: 'All jobs', platform: 'All', date: 'All time' })
  const [deliverables, setDeliverables] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [reload, setReload] = useState(0)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))
  const downloadAll = async () => {
    if (exporting) return
    setExporting(true); setError('')
    try { await downloadFile('/deliverables/export', 'deliverables-export') }
    catch (err) { setError(err.message || 'Could not download your content. Please try again.') }
    finally { setExporting(false) }
  }
  const openContent = async item => {
    setSelected(item); setDetailLoading(true); setDetailError('')
    try { const detail = await getDeliverable(item.id); setSelected(current => current?.id === item.id ? { ...current, ...detail, job: detail.job?.title || detail.job || current.job } : current) }
    catch (err) { setDetailError(err.message || 'Could not load this content.') }
    finally { setDetailLoading(false) }
  }
  const debounce = useRef()
  useEffect(() => { getCampaigns().then(data => setCampaigns(Array.isArray(data) ? data : data?.results || [])).catch(() => {}) }, [])

  useEffect(() => {
    const controller = new AbortController()
    clearTimeout(debounce.current)
    setLoading(true); setError('')
    debounce.current = setTimeout(() => {
      const from = new Date()
      if (filters.date === 'This year') from.setMonth(0,1)
      else from.setDate(from.getDate() - (filters.date === 'Last 7 days' ? 7 : 30))
      getDeliverables({ q: query, jobId: filters.job === 'All jobs' ? '' : campaigns.find(job => job.title === filters.job)?.id || '', platform: filters.platform === 'All' ? '' : filters.platform, from: filters.date === 'All time' ? '' : from.toISOString().slice(0,10) }, { signal: controller.signal })
        .then((data) => {
          const next = Array.isArray(data) ? data : data?.results
          if (!controller.signal.aborted) setDeliverables((next || []).map((d) => ({ ...d, creatorId: d.creatorId || d.creator?.id, job: d.job?.title || d.job, delivered: d.delivered || (d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString('en-IN') : '—'), tone: d.tone || String(d.status || '').toLowerCase().replaceAll(' ', '-') })))
        }).catch(err => { if (!controller.signal.aborted) setError(err.message || 'Could not load your content.') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, 300)
    return () => { controller.abort(); clearTimeout(debounce.current) }
  }, [query, filters.job, filters.platform, filters.date, campaigns, reload])

  return (
    <div className="dpage">
      <div className="dpage__head">
        <div>
          <h1 className="dpage__title">Deliverables</h1>
          <p className="dpage__sub">See all your delivered content in one place.</p>
        </div>
        <div className="dpage__actions">
          <button className="btn btn--outline" disabled={exporting} onClick={downloadAll}>{exporting ? 'Downloading…' : 'Download all ↗'}</button>
        </div>
      </div>

      {error && <div className="workspace-message workspace-message--error" role="alert">{error}<button className="btn btn--outline btn--sm" onClick={() => setReload(n => n + 1)}>Try again</button></div>}
      {selected && <Modal title={selected.content || 'Your content.'} subtitle={[selected.type, selected.status].filter(Boolean).join(' · ')} onClose={() => setSelected(null)} wide><div className="workspace-form"><p>{selected.job} · Delivered {selected.delivered}</p>{detailLoading && <p role="status">Loading content preview…</p>}{detailError && <div className="workspace-message workspace-message--error" role="alert">{detailError}<button className="btn btn--outline" onClick={() => openContent(selected)}>Retry preview</button></div>}{(() => { const url = selected.previewUrl || selected.url || selected.downloadUrl; return url && /^https?:\/\//.test(url) ? <>{/\.(mp4|webm)(\?|$)/i.test(url) ? <video controls playsInline src={url} style={{ width:'100%',maxHeight:'50vh',borderRadius:12 }} /> : /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url) ? <img src={url} alt={selected.content} style={{ width:'100%',maxHeight:'50vh',objectFit:'contain',borderRadius:12 }} /> : null}<a className="btn btn--dark" href={url} target="_blank" rel="noreferrer">Open content ↗</a></> : !detailLoading && !detailError ? <div className="workspace-empty"><h3>No file attached yet.</h3><p>The creator needs to attach a content link before a preview is available.</p></div> : null })()}</div></Modal>}
      <div className="deliv__search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search anything in your library…" />
      </div>

      <div className="deliv__filters">
        {FILTERS.map((f) => (
          <Dropdown
            key={f.key}
            label={f.label}
            value={filters[f.key]}
            options={f.key === 'job' ? ['All jobs', ...new Set(campaigns.map(job => job.title))] : f.options}
            onChange={(v) => setFilter(f.key, v)}
            buttonClassName="deliv__filter"
          />
        ))}
      </div>

      <div className="dtable-wrap">
        <table className="dtable">
          <thead>
            <tr>
              <th>Content</th>
              <th>Creator</th>
              <th>Job</th>
              <th>Delivered</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!deliverables.length && <tr><td colSpan="6">{loading ? 'Loading your content…' : error ? 'Your content could not be loaded. Use Try again above.' : 'No content matches this view yet.'}</td></tr>}
            {deliverables.map((d) => {
              const c = getCreator(d.creatorId) || d.creator || { image: '', name: 'Creator' }
              return (
                <tr key={d.id}>
                  <td>
                    <div className="dcell-media">
                      <img src={c.image} alt="" />
                      <div>
                        <strong>{d.content}</strong>
                        <span>▶ {d.type}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="dcell-creator">
                      <img src={c.image} alt="" />
                      {c.name}
                    </div>
                  </td>
                  <td>{d.job}</td>
                  <td>{d.delivered}</td>
                  <td>
                    <span className={`pill pill--${d.tone} pill--dot`}>{d.status}</span>
                  </td>
                  <td>
                    <button className="dbtn-ghost" onClick={() => openContent(d)}>View content</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
