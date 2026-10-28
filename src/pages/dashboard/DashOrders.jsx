import { useState } from 'react'
import { orderStats, orderTabs, orders, getCreator } from '../../data/dashboard.js'
import './dash-pages.css'
import './DashOrders.css'

const inr = (n) => '₹' + n.toLocaleString('en-IN')

export default function DashOrders() {
  const [tab, setTab] = useState('all')

  const visible = orders.filter((o) => {
    if (tab === 'all') return true
    if (tab === 'completed') return o.status === 'Completed'
    if (tab === 'active') return o.status !== 'Completed'
    return false
  })

  return (
    <div className="dpage">
      <div className="dpage__head">
        <div>
          <h1 className="dpage__title">Orders</h1>
          <p className="dpage__sub">
            Every package you’ve bought. Your money stays in escrow until you approve the work.
          </p>
        </div>
        <div className="dpage__actions">
          <button className="btn btn--dark">Explore creators</button>
        </div>
      </div>

      <div className="orders__stats">
        {orderStats.map((s) => (
          <div className="dstat" key={s.label}>
            <div className="dstat__label">
              {s.icon ? `${s.icon} ` : ''}
              {s.label}
            </div>
            <div className="dstat__value">{s.value}</div>
            <div className="dstat__sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="dtabrow">
        {orderTabs.map((t) => (
          <button
            key={t.key}
            className={`dtab ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="dtab__count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="dtable-wrap">
        <table className="dtable">
          <thead>
            <tr>
              <th>Order</th>
              <th>Creator</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const c = getCreator(o.creatorId)
              const payTone = o.payment === 'Released' ? 'green' : 'yellow'
              return (
                <tr key={o.id}>
                  <td>
                    <strong>{o.id}</strong>
                    <div className="orders__deliverable">{o.deliverable}</div>
                  </td>
                  <td>
                    <div className="dcell-creator">
                      <img src={c.image} alt="" />
                      {c.name}
                    </div>
                  </td>
                  <td>
                    <strong>{inr(o.amount)}</strong>
                  </td>
                  <td>
                    <span className={`pill pill--${payTone} pill--dot`}>{o.payment}</span>
                  </td>
                  <td>{o.due}</td>
                  <td>
                    <span className={`pill pill--${o.statusTone}`}>{o.status}</span>
                  </td>
                  <td>
                    <button className="dbtn-ghost">Open</button>
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
