import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiData, collectPages } from '../../lib/apiClient.js'
import { getUser, updateLocalUser } from '../../lib/auth.js'
import { uploadFile } from '../../api/uploads.js'
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
  const [uploading, setUploading] = useState(false)
  const [reload, setReload] = useState(0)
  const title = { settings: 'Account settings', billing: 'Billing & plan', brands: 'Your brand', messages: 'Messages', notifications: 'Notifications', support: 'Help & support' }[section] || 'Account'

  useEffect(() => {
    let active = true
    if (section === 'brands') apiData('/brands/me/').then(data => { if (active) setBrand(data || {}) }).catch(err => { if (active) setMessage(err.message) })
    if (section === 'notifications') collectPages('/notifications/').then(data => { if (active) setNotifications(data) }).catch(err => { if (active) setMessage(err.message) })
    return () => { active = false }
  }, [section, reload])

  useEffect(() => {
    if (section !== 'notifications') return
    const refresh = event => { if (event.detail?.event === 'notification' || event.detail?.event === 'reconnected') setReload(value => value + 1) }
    window.addEventListener('linkloom-realtime', refresh)
    return () => window.removeEventListener('linkloom-realtime', refresh)
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
      window.dispatchEvent(new Event('linkloom-notifications-changed'))
    } catch (err) { setMessage(err.message || 'Could not mark the notification as read.') }
  }

  const markAllRead = async () => {
    try {
      await apiData('/notifications/read-all/', { method: 'POST' })
      setNotifications(items => items.map(item => ({ ...item, read: true })))
      window.dispatchEvent(new Event('linkloom-notifications-changed'))
    } catch (err) { setMessage(err.message || 'Could not mark notifications as read.') }
  }

  const uploadLogo = async file => {
    if (!file) return
    setUploading(true); setMessage('')
    try {
      const uploaded = await uploadFile(file, 'brand_logo')
      const updated = await apiData('/brands/me/')
      setBrand(updated || { ...brand, logoUrl: uploaded.url })
      setMessage('Brand logo uploaded.')
    } catch (err) { setMessage(err.message || 'Could not upload the logo.') }
    finally { setUploading(false) }
  }

  return <div className="dpage">
    <div className="dpage__head"><div><h1 className="dpage__title">{title}</h1><p className="dpage__sub">Manage your workspace.</p></div></div>
    <section className="dcard account-panel">
      {section === 'settings' && <><h2>Account</h2><p className="dpage__sub">Phone: {getUser()?.phone || getUser()?.destination || '—'}</p><p className="dpage__sub">Name: {getUser()?.fullName || getUser()?.name || '—'}</p><p className="dpage__sub">Role: {getUser()?.role || '—'}</p><p className="dpage__sub">To update your brand details, open Your brand.</p><Link className="btn btn--outline" to="/dashboard/account/brands">Your brand</Link></>}
      {section === 'brands' && <><div className="brand-logo-upload">{brand.logoUrl && <img src={brand.logoUrl} alt="Brand logo" />}<label>Brand logo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={event => uploadLogo(event.target.files?.[0])} /></label>{uploading && <p role="status">Uploading logo…</p>}</div><form onSubmit={saveBrand}><h2>Brand profile</h2>{fields.map(([key, label]) => <label key={key}>{label}<input value={brand[key] || ''} onChange={event => setBrand(current => ({ ...current, [key]: event.target.value }))} required={key === 'name'} /></label>)}<button className="btn btn--dark" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></form></>}
      {section === 'notifications' && <><h2>Notifications</h2>{notifications.some(item => !item.read && !item.readAt) && <button className="dbtn-ghost" onClick={markAllRead}>Mark all as read</button>}{notifications.length ? notifications.map(item => <div key={item.id} className="dpage__sub" style={{ marginTop: 18 }}><strong>{item.title || 'Notification'}</strong><p>{item.message || item.body}</p>{!item.read && !item.readAt && <button className="dbtn-ghost" onClick={() => markRead(item.id)}>Mark as read</button>}</div>) : <p className="dpage__sub">No notifications yet.</p>}</>}
      {section === 'billing' && <><h2>Billing</h2><p className="dpage__sub">Billing details will appear here when the payment flow is connected.</p></>}
      {section === 'messages' && <><h2>Messages</h2><p className="dpage__sub">Conversations are coming soon.</p></>}
      {section === 'support' && <><h2>How can we help?</h2><details><summary>How do I post a job?</summary><p>Choose Post a job, add deliverables and a budget, then submit your campaign.</p></details><details><summary>Where can I review creator bids?</summary><p>Open Jobs and choose Review bids on an open campaign.</p></details><Link className="btn btn--outline" to="/dashboard/jobs?post=1">Post a job</Link></>}
      {message && <p role="status" className="dpage__sub">{message}</p>}
    </section>
  </div>
}
