import { useEffect, useRef, useState } from 'react'
import { deliverables as mockDeliverables, getCreator } from '../../data/dashboard.js'
import { getDeliverables } from '../../api/dashboard.js'
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
  const [deliverables, setDeliverables] = useState(mockDeliverables)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))
  const downloadAll = () => downloadFile('/deliverables/export', 'deliverables-export').catch(() => {})
  const debounce = useRef()

  useEffect(() => {
    const controller = new AbortController()
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      getDeliverables({ q: query, jobId: filters.job === 'All jobs' ? '' : filters.job, platform: filters.platform === 'All' ? '' : filters.platform }, { signal: controller.signal })
        .then((data) => {
          const next = Array.isArray(data) ? data : data?.results
          if (next?.length) setDeliverables(next.map((d) => ({ ...d, creatorId: d.creatorId || d.creator?.id, job: d.job?.title || d.job, delivered: d.delivered || d.deliveredAt, tone: d.tone || String(d.status || '').toLowerCase().replaceAll(' ', '-') })))
        }).catch((err) => { if (err?.name !== 'AbortError') {} })
    }, 300)
    return () => { controller.abort(); clearTimeout(debounce.current) }
  }, [query, filters.job, filters.platform])

  return (
    <div className="dpage">
      <div className="dpage__head">
        <div>
          <h1 className="dpage__title">Deliverables</h1>
          <p className="dpage__sub">See all your delivered content in one place.</p>
        </div>
        <div className="dpage__actions">
          <button className="dbtn-ghost" onClick={downloadAll}>⬇ Download all</button>
        </div>
      </div>

      {selected && <section className="dcard" style={{ padding: 24, marginBottom: 20 }}><h2>{selected.content}</h2><p className="dpage__sub">{selected.type} · {selected.status}</p><p className="dpage__sub">{selected.job} · Delivered {selected.delivered}</p>{selected.url ? <a className="btn btn--dark" href={selected.url} target="_blank" rel="noreferrer">Open content</a> : <p className="dpage__sub">Content preview has not been provided.</p>}<button className="dbtn-ghost" onClick={() => setSelected(null)}>Close details</button></section>}
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
            options={f.options}
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
                    <button className="dbtn-ghost" onClick={() => setSelected(d)}>View</button>
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
