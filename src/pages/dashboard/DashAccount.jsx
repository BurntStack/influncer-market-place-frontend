import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUser, updateLocalUser } from '../../lib/auth.js'
import './dash-pages.css'

export default function DashAccount() {
  const { section } = useParams()
  const [profile, setProfile] = useState(() => getUser() || {})
  const [message, setMessage] = useState('')
  const title = { settings: 'Account settings', billing: 'Billing & plan', brands: 'Your brand', messages: 'Messages', notifications: 'Notifications', support: 'Help & support' }[section] || 'Account'
  return <div className="dpage"><div className="dpage__head"><div><h1 className="dpage__title">{title}</h1><p className="dpage__sub">Manage your workspace.</p></div></div>
    <section className="dcard account-panel">
      {(section === 'settings' || section === 'brands') && <form onSubmit={(event) => { event.preventDefault(); updateLocalUser(profile); setMessage('Profile saved on this device.'); window.dispatchEvent(new Event('profile-updated')) }}>
        <h2>{section === 'brands' ? 'Brand profile' : 'Personal information'}</h2>
        <p className="dpage__sub">These preferences are saved on this device.</p>
        <label>Name<input required value={profile.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
        <label>Company name<input required value={profile.companyName || ''} onChange={(event) => setProfile({ ...profile, companyName: event.target.value })} /></label>
        <label>Email<input value={profile.email || ''} readOnly /></label>
        <button className="btn btn--dark">Save changes</button>
      </form>}
      {section === 'billing' && <><span className="pill pill--green">Current plan</span><h2>Free plan</h2><p className="dpage__sub">Search creators and manage campaigns from your workspace. No billing account or invoices have been connected.</p><Link className="btn btn--outline" to="/dashboard/account/support">Billing help</Link></>}
      {section === 'messages' && <><h2>No conversations yet</h2><p className="dpage__sub">Your creator conversations will appear here when messaging is connected.</p><Link className="btn btn--dark" to="/dashboard/orders">View your orders</Link></>}
      {section === 'notifications' && <><h2>You’re all caught up</h2><p className="dpage__sub">There are no new notifications available.</p><Link className="btn btn--outline" to="/dashboard/jobs">View campaigns</Link></>}
      {section === 'support' && <><h2>How can we help?</h2><details><summary>How do I post a job?</summary><p>Choose Post a job, add deliverables and a budget, then submit your campaign.</p></details><details><summary>Where can I review creator bids?</summary><p>Open Jobs and choose Review bids on an open campaign.</p></details><details><summary>How do payments work?</summary><p>Review orders and their payment status on the Orders page. Payment actions require a connected backend.</p></details><Link className="btn btn--outline" to="/dashboard/jobs?post=1">Post a job</Link></>}
      {message && <p role="status" className="dpage__sub">{message}</p>}
    </section></div>
}
