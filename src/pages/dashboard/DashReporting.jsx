import { useEffect, useState } from 'react'
import {
  reportStats,
  viewsByMonth,
  spendByPlatform,
  reportTopCreators,
  getCreator,
} from '../../data/dashboard.js'
import { getReporting } from '../../api/dashboard.js'
import { downloadFile } from '../../lib/apiClient.js'
import Dropdown from '../../components/Dropdown.jsx'
import './dash-pages.css'
import './DashReporting.css'

const CHART_MAX = 800 // y-axis top in k
const PERIOD_MAP = { 'Last 30 days': 'last_30_days', 'Last 3 months': 'last_3_months', 'Last 6 months': 'last_6_months', 'Last 12 months': 'last_12_months', 'All time': 'all_time' }

export default function DashReporting() {
  const [period, setPeriod] = useState('Last 6 months')
  const [report, setReport] = useState({ reportStats, viewsByMonth, spendByPlatform, reportTopCreators })

  useEffect(() => {
    getReporting(PERIOD_MAP[period]).then((data) => {
      if (!data) return
      setReport({
        reportStats: data.stats || reportStats,
        viewsByMonth: data.viewsByMonth || viewsByMonth,
        spendByPlatform: data.spendByPlatform || spendByPlatform,
        reportTopCreators: data.topCreators || reportTopCreators,
      })
    }).catch(() => {})
  }, [period])

  const { reportStats: stats, viewsByMonth: monthlyViews, spendByPlatform: platformSpend, reportTopCreators: creators } = report
  const exportReport = () => downloadFile(`/reporting/export?period=${encodeURIComponent(PERIOD_MAP[period])}`, 'reporting-export').catch(() => {})
  return (
    <div className="dpage">
      <div className="dpage__head">
        <div>
          <h1 className="dpage__title">Reporting</h1>
          <p className="dpage__sub">How your creator jobs are performing across platforms.</p>
        </div>
        <div className="dpage__actions">
          <Dropdown
            value={period}
            options={['Last 30 days', 'Last 3 months', 'Last 6 months', 'Last 12 months', 'All time']}
            onChange={setPeriod}
            align="right"
            buttonClassName="dbtn-ghost"
          />
          <button className="btn btn--dark" onClick={exportReport}>⬇ Export CSV</button>
        </div>
      </div>

      <div className="dstats report__stats">
        {stats.map((s) => (
          <div className="dstat" key={s.label}>
            <div className="dstat__label">{s.label}</div>
            <div className="dstat__value">{s.value}</div>
            <div className="dstat__sub">
              <span className="report__delta">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="report__panels">
        {/* Bar chart */}
        <div className="dcard report__chart">
          <div className="report__chart-head">
            <h3>Views by month</h3>
            <div className="report__legend">
              <span><i className="dot dot--ig" /> Instagram</span>
              <span><i className="dot dot--yt" /> YouTube</span>
            </div>
          </div>
          <div className="report__bars">
            <div className="report__yaxis">
              <span>800k</span>
              <span>600k</span>
              <span>400k</span>
              <span>200k</span>
              <span>0</span>
            </div>
            <div className="report__plot">
              {monthlyViews.map((m) => (
                <div className="report__group" key={m.month}>
                  <div className="report__pair">
                    <span
                      className="report__bar report__bar--ig"
                      style={{ height: `${(m.instagram / CHART_MAX) * 100}%` }}
                    />
                    <span
                      className="report__bar report__bar--yt"
                      style={{ height: `${(m.youtube / CHART_MAX) * 100}%` }}
                    />
                  </div>
                  <span className="report__month">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spend by platform */}
        <div className="dcard report__spend">
          <h3>Spend by platform</h3>
          <ul>
            {platformSpend.map((s, index) => (
              <li key={s.label}>
                <div className="report__spend-row">
                  <span>{s.label}</span>
                  <span className="report__spend-amt">
                    {s.amount} · {s.pct}%
                  </span>
                </div>
                <span className="report__spend-bar">
                  <span style={{ width: `${s.pct}%`, background: ['#354f34', '#829b5d', '#c5dd8a'][index % 3] }} />
                </span>
              </li>
            ))}
          </ul>
          <p className="report__note">
            Reels from micro-creators gave you 2.1× more views per rupee than YouTube.
          </p>
        </div>
      </div>

      {/* Top creators table */}
      <h2 className="report__table-title">Top creators</h2>
      <div className="dtable-wrap">
        <table className="dtable">
          <thead>
            <tr>
              <th>Creator</th>
              <th>Posts</th>
              <th>Views</th>
              <th>Engagement</th>
              <th>Spend</th>
              <th>Cost / 1k views</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((r) => {
              const c = getCreator(r.creatorId) || r.creator || { image: '', name: 'Creator', category: '' }
              return (
                <tr key={r.creatorId}>
                  <td>
                    <div className="dcell-creator">
                      <img src={c.image} alt="" />
                      <div>
                        <strong>{c.name}</strong>
                        <div className="report__cat">{c.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.posts}</td>
                  <td>
                    <strong>{r.views}</strong>
                  </td>
                  <td>{r.engagement}</td>
                  <td>{r.spend}</td>
                  <td>
                    <strong>{r.cpv}</strong>
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
