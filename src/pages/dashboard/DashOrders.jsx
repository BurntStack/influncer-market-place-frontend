import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderTabs, getCreator } from '../../data/dashboard.js'
import { approveOrder, getOrders, getOrder, requestOrderChanges } from '../../api/dashboard.js'
import Modal from '../../components/Modal.jsx'
import './dash-pages.css'
import './DashOrders.css'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function DashOrders() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [action, setAction] = useState(null)
  const [note, setNote] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [reload, setReload] = useState(0)
  const isApproval = action?.status === 'Draft submitted' && action?.actionType !== 'revision'

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setMessage('')
    getOrders({ signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return
      const next = Array.isArray(data) ? data : data?.results
      const statuses = { in_escrow: 'In escrow', draft_submitted: 'Draft submitted', changes_requested: 'Changes requested', in_progress: 'In progress', released: 'Completed', completed: 'Completed', cancelled: 'Cancelled' }
      setOrders((next || []).map((o) => ({ ...o, creatorId: o.creatorId || o.creator?.id, payment: o.payment || (['released', 'completed'].includes(o.status) ? 'Released' : 'Pending'), status: statuses[o.status] || o.status, statusTone: ['released', 'completed'].includes(o.status) ? 'green' : 'blue' })))
    }).catch((error) => { if (!controller.signal.aborted) setMessage(error.message || 'Could not load orders. Please try again.') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload])

  const openOrder = async order => {
    setSelected(order); setDetailLoading(true); setDetailError('')
    try { const detail = await getOrder(order.id); setSelected(current => current?.id === order.id ? { ...current, ...detail, status: current.status } : current) }
    catch (error) { setDetailError(error.message || 'Could not load the full order details.') }
    finally { setDetailLoading(false) }
  }

  const orderAction = async (event) => {
    event.preventDefault()
    const order = action
    if (busy) return
    setMessage('')
    setBusy(true)
    try {
      if (isApproval) {
        await approveOrder(order.id)
        setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: 'Completed', statusTone: 'green', payment: 'Released' } : item))
      } else {
        if (!note.trim()) return
        await requestOrderChanges(order.id, note.trim())
        setOrders(current => current.map(item => item.id === order.id ? { ...item, status: 'Changes requested' } : item))
        setMessage('Change request sent.')
      }
      setAction(null); setNote('')
    } catch (err) { setDetailError(err?.message || 'Could not complete this order action.') }
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

      {selected && <Modal title="Your collaboration." subtitle={selected.deliverable || selected.id} onClose={() => setSelected(null)}><div className="workspace-form"><p>{selected.creator?.name || 'Creator'} · {selected.status}</p><div className="booking__total"><span>Order value</span><strong>{inr(selected.amount)}</strong></div><p>Payment: {selected.payment || 'Pending'}</p>{selected.due && <p>{selected.due}</p>}{selected.brief && <p>{selected.brief}</p>}{detailLoading && <p role="status">Loading order details…</p>}{detailError && <div className="workspace-message workspace-message--error" role="alert">{detailError}<button className="btn btn--outline" onClick={() => openOrder(selected)}>Retry details</button></div>}{(selected.contentUrl || selected.url) && <a className="btn btn--dark" href={selected.contentUrl || selected.url} target="_blank" rel="noreferrer">View submitted work ↗</a>}<button className="btn btn--outline" onClick={() => { setSelected(null); navigate('/dashboard/deliverables') }}>Open content library</button>{['Draft submitted','In progress','Changes requested'].includes(selected.status) && <button className="btn btn--dark" onClick={() => { setAction(selected); setSelected(null); setDetailError(''); setNote('') }}>{selected.status === 'Draft submitted' ? 'Review approval' : 'Request changes'}</button>}</div></Modal>}
      {action && <Modal title={isApproval ? 'Approve this work?' : 'Make room for a revision.'} subtitle={action.deliverable} busy={busy} onClose={() => setAction(null)}><form className="workspace-form" onSubmit={orderAction}><p className="dpage__sub">{isApproval ? `Approval requests release of ${inr(action.amount)} through the payment backend. Confirm only after reviewing the submitted work.` : 'Tell the creator exactly what needs to change.'}</p>{!isApproval && <label>Revision notes<textarea required value={note} maxLength={3000} onChange={event => setNote(event.target.value)} /></label>}{detailError && <p className="workspace-message workspace-message--error" role="alert">{detailError}</p>}<div className="workspace-form__actions"><button type="button" className="btn btn--outline" disabled={busy} onClick={() => setAction(null)}>Cancel</button><button className="btn btn--dark" disabled={busy}>{busy ? 'Saving…' : isApproval ? 'Confirm approval' : 'Send revision request'}</button></div></form></Modal>}
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
      {message && <div className="workspace-message" role="status">{message}<button className="btn btn--outline btn--sm" onClick={() => setReload(n => n + 1)}>Refresh orders</button></div>}

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
                    <button className="dbtn-ghost" disabled={busy} onClick={() => openOrder(o)}>Open order</button>
                    {['Draft submitted','In progress','Changes requested'].includes(o.status) && <button className="dbtn-ghost" disabled={busy} onClick={() => { setAction(o); setDetailError(''); setNote('') }}>{o.status === 'Draft submitted' ? 'Approve' : 'Request changes'}</button>}
                    {o.status === 'Draft submitted' && <button className="dbtn-ghost" disabled={busy} onClick={() => { setAction({ ...o, actionType:'revision' }); setDetailError(''); setNote('') }}>Request changes</button>}
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
