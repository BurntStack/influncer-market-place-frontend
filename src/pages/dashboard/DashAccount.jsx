import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiData, apiRequest, listPage } from '../../lib/apiClient.js'
import { getUser, updateLocalUser } from '../../lib/auth.js'
import './dash-pages.css'

const fields = [
  ['name', 'Brand name'], ['website', 'Website'], ['industry', 'Industry'],
  ['legalName', 'Legal name'], ['gstin', 'GSTIN'], ['stateCode', 'State code'],
  ['billingAddress', 'Billing address'],
]

export default function DashAccount() {
  const { section } = useParams()
  const [brand, setBrand] = useState({})
  const [notifications, setNotifications] = useState([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const title = { settings: 'Account settings', billing: 'Billing & plan', brands: 'Your brand', messages: 'Messages', notifications: 'Notifications', support: 'Help & support' }[section] || 'Account'

  useEffect(() => {
    if (section === 'brands') apiData('/brands/me/').then(data => setBrand(data || {})).catch(err => setMessage(err.message))
    if (section === 'notifications') apiRequest('/notifications/', { query: { limit: 50 } }).then(result => setNotifications(listPage(result).results)).catch(err => setMessage(err.message))
  }, [section])

  const saveBrand = async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const body = Object.fromEntries(fields.filter(([key]) => String(brand[key] || '').trim()).map(([key]) => [key, brand[key].trim()]))
      const saved = await apiData('/brands/me/', { method: 'PATCH', body })
      setBrand(saved || brand)
      updateLocalUser({ brandName: saved?.name || brand.name })
      window.dispatchEvent(new Event('profile-updated'))
      setMessage('Brand profile saved.')
    } catch (err) { setMessage(err.message || 'Could not save the brand profile.') }
    finally { setBusy(false) }
  }

  const markRead = async id => {
    try {
      await apiData(`/notifications/${encodeURIComponent(id)}/read/`, { method: 'PATCH' })
      setNotifications(current => current.map(item => item.id === id ? { ...item, read: true } : item))
    } catch (err) { setMessage(err.message || 'Could not mark the notification as read.') }
  }

  return <div className="dpage">
    <div className="dpage__head"><div><h1 className="dpage__title">{title}</h1><p className="dpage__sub">Manage your workspace.</p></div></div>
    <section className="dcard account-panel">
      {section === 'settings' && <><h2>Account</h2><p className="dpage__sub">Phone: {getUser()?.phone || getUser()?.destination || '—'}</p><p className="dpage__sub">Name: {getUser()?.fullName || getUser()?.name || '—'}</p><p className="dpage__sub">Role: {getUser()?.role || '—'}</p><p className="dpage__sub">To update your brand details, open Your brand.</p><Link className="btn btn--outline" to="/dashboard/account/brands">Your brand</Link></>}
      {section === 'brands' && <form onSubmit={saveBrand}><h2>Brand profile</h2>{fields.map(([key, label]) => <label key={key}>{label}<input value={brand[key] || ''} onChange={event => setBrand(current => ({ ...current, [key]: event.target.value }))} required={key === 'name'} /></label>)}<button className="btn btn--dark" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></form>}
      {section === 'notifications' && <><h2>Notifications</h2>{notifications.length ? notifications.map(item => <div key={item.id} className="dpage__sub" style={{ marginTop: 18 }}><strong>{item.title || 'Notification'}</strong><p>{item.message || item.body}</p>{!item.read && !item.readAt && <button className="dbtn-ghost" onClick={() => markRead(item.id)}>Mark as read</button>}</div>) : <p className="dpage__sub">No notifications yet.</p>}</>}
      {section === 'billing' && <><h2>Billing</h2><p className="dpage__sub">Billing details will appear here when the payment flow is connected.</p></>}
      {section === 'messages' && <><h2>Messages</h2><p className="dpage__sub">Conversations are coming soon.</p></>}
      {section === 'support' && <><h2>How can we help?</h2><details><summary>How do I post a job?</summary><p>Choose Post a job, add deliverables and a budget, then submit your campaign.</p></details><details><summary>Where can I review creator bids?</summary><p>Open Jobs and choose Review bids on an open campaign.</p></details><Link className="btn btn--outline" to="/dashboard/jobs?post=1">Post a job</Link></>}
      {message && <p role="status" className="dpage__sub">{message}</p>}
    </section>
  </div>
}
