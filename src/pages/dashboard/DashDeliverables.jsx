import { useState } from 'react'
import { deliverables, getCreator } from '../../data/dashboard.js'
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
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))

  return (
    <div className="dpage">
      <div className="dpage__head">
        <div>
          <h1 className="dpage__title">Deliverables</h1>
          <p className="dpage__sub">See all your delivered content in one place.</p>
        </div>
        <div className="dpage__actions">
          <button className="dbtn-ghost">⬇ Download all</button>
        </div>
      </div>

      <div className="deliv__search">
        <span>🔍</span>
        <input placeholder="Search anything in your library…" />
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
              const c = getCreator(d.creatorId)
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
                    <button className="dbtn-ghost">View</button>
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
