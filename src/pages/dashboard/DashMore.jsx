import { Link, useNavigate } from 'react-router-dom'
import { logout, getUser } from '../../lib/auth.js'
import './dash-pages.css'
import './DashMore.css'

const WORKSPACE = [
  { label: 'Lists', meta: '6 lists', to: '/dashboard/lists' },
  { label: 'Deliverables', meta: '2 to review', to: '/dashboard/deliverables' },
  { label: 'Reporting', to: '/dashboard/reporting' },
  { label: 'Messages', meta: '3 unread', to: '/dashboard/orders' },
]

export default function DashMore() {
  const navigate = useNavigate()
  const user = getUser()
  const brand = {
    name: user?.companyName || user?.name || 'Your brand',
    initial: (user?.companyName || user?.name || 'Y').charAt(0).toUpperCase(),
    plan: 'Free',
  }

  return (
    <div className="more">
      <div className="more__user">
        <span className="dside__avatar">{brand.initial}</span>
        <span className="more__user-info">
          <strong>{brand.name}</strong>
          <span>
            {brand.plan} plan · <em>Upgrade</em>
          </span>
        </span>
        <span className="more__chev">›</span>
      </div>

      <Link to="/dashboard/jobs" className="btn btn--dark more__post">
        + Post a job
      </Link>

      <div className="more__label">Workspace</div>
      <div className="more__group">
        {WORKSPACE.map((row) => (
          <Link key={row.label} to={row.to} className="more__row">
            <span>{row.label}</span>
            <span className="more__meta">
              {row.meta && <em>{row.meta}</em>}
              <span className="more__chev">›</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="more__label">Account</div>
      <div className="more__group">
        <button className="more__row" onClick={() => {}}>
          <span>Settings</span>
          <span className="more__chev">›</span>
        </button>
        <button className="more__row" onClick={() => {}}>
          <span>Help &amp; support</span>
          <span className="more__chev">›</span>
        </button>
        <button
          className="more__row more__row--danger"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}
