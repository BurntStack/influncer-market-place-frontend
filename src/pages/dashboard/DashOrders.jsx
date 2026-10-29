import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderTabs, getCreator } from '../../data/dashboard.js'
import { approveOrder, getOrders, requestOrderChanges } from '../../api/dashboard.js'
import './dash-pages.css'
import './DashOrders.css'

const inr = (n) => '₹' + n.toLocaleString('en-IN')

export default function DashOrders() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getOrders().then((data) => {
      const next = Array.isArray(data) ? data : data?.results
      const statuses = { in_escrow: 'In escrow', draft_submitted: 'Draft submitted', changes_requested: 'Changes requested', in_progress: 'In progress', released: 'Completed', completed: 'Completed', cancelled: 'Cancelled' }
      setOrders((next || []).map((o) => ({ ...o, creatorId: o.creatorId || o.creator?.id, payment: o.payment || (['released', 'completed'].includes(o.status) ? 'Released' : 'Pending'), status: statuses[o.status] || o.status, statusTone: ['released', 'completed'].includes(o.status) ? 'green' : 'blue' })))
    }).catch((error) => setMessage(error.message || 'Could not load orders. Please refresh to try again.')).finally(() => setLoading(false))
  }, [])

  const orderAction = async (order) => {
    if (busy) return
    setMessage('')
    setBusy(true)
    try {
      if (order.status === 'Draft submitted') {
        if (!window.confirm('Approve this draft and release escrow?')) return
        await approveOrder(order.id)
        setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: 'Completed', statusTone: 'green', payment: 'Released' } : item))
      } else if (order.status === 'In progress') {
        const note = window.prompt('What changes should the creator make?')
        if (!note) return
        await requestOrderChanges(order.id, note)
        setMessage('Change request sent.')
      } else {
        setSelected(order)
      }
    } catch (err) { setMessage(err?.message || 'Could not complete this order action.') }
    finally { setBusy(false) }
  }

  const orderStats = [
    {label: 'Total orders', value: orders.length, sub: 'Across your campaigns'},
    {label: 'Awaiting approval', value: orders.filter(o => o.status === 'Draft submitted').length, sub: 'Ready for your review'},
    {label: 'Completed', value: orders.filter(o => o.status === 'Completed').length, sub: 'Approved and released'},
    {label: 'Booked value', value: inr(orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + Number(o.amount || 0), 0)), sub: 'Excludes cancelled orders'},
  ]

  const visible = orders.filter((o) => {
    if (tab === 'all') return true
    if (tab === 'completed') return o.status === 'Completed'
    if (tab === 'active') return !['Completed', 'Cancelled'].includes(o.status)
    if (tab === 'cancelled') return o.status === 'Cancelled'
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
          <button className="btn btn--dark" onClick={() => navigate('/dashboard/search')}>Explore creators</button>
        </div>
      </div>

      {selected && <section className="dcard" style={{ padding: 24, marginBottom: 20 }}><h2>{selected.deliverable}</h2><p className="dpage__sub">{selected.id} · {selected.status} · {selected.payment}</p><p className="dpage__sub">{inr(selected.amount)} · {selected.due}</p><button className="dbtn-ghost" onClick={() => setSelected(null)}>Close details</button></section>}
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
      {message && <p className="auth__error">{message}</p>}

      <div className="dtabrow">
        {orderTabs.map((t) => (
          <button
            key={t.key}
            className={`dtab ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="dtab__count">{orders.filter(o => t.key === 'all' || (t.key === 'completed' ? o.status === 'Completed' : t.key === 'cancelled' ? o.status === 'Cancelled' : !['Completed', 'Cancelled'].includes(o.status))).length}</span>
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
            {!visible.length && <tr><td colSpan="7">{loading ? 'Loading your orders…' : 'No orders in this view. Select a creator bid to start an order.'}</td></tr>}
            {visible.map((o) => {
              const c = getCreator(o.creatorId) || o.creator || { image: '', name: 'Creator' }
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
                    <button className="dbtn-ghost" disabled={busy} onClick={() => orderAction(o)}>{o.status === 'Draft submitted' ? 'Approve' : o.status === 'In progress' ? 'Request changes' : 'Open'}</button>
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
