import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { logout, getUser } from '../../lib/auth.js'
import Dropdown from '../Dropdown.jsx'
import './DashboardLayout.css'

const NAV = [
  { to: '/dashboard', end: true, label: 'Home', icon: '🏠' },
  { to: '/dashboard/search', label: 'Search', icon: '🔍' },
  { to: '/dashboard/lists', label: 'Lists', icon: '🔖' },
  { to: '/dashboard/jobs', label: 'Jobs', icon: '💼' },
  { to: '/dashboard/deliverables', label: 'Deliverables', icon: '📦' },
  { to: '/dashboard/orders', label: 'Orders', icon: '💬', badge: 3 },
  { to: '/dashboard/reporting', label: 'Reporting', icon: '📊' },
]

// Bottom tab bar (mobile): Home, Search, Jobs, Orders, More
const TABS = ['/dashboard', '/dashboard/search', '/dashboard/jobs', '/dashboard/orders']
// Pages reached via the "More" tab — keep that tab highlighted on them too.
const MORE_ROUTES = [
  '/dashboard/more',
  '/dashboard/lists',
  '/dashboard/deliverables',
  '/dashboard/reporting',
]

const TITLES = {
  '/dashboard': 'Home',
  '/dashboard/search': 'Search',
  '/dashboard/lists': 'Lists',
  '/dashboard/jobs': 'Jobs',
  '/dashboard/deliverables': 'Deliverables',
  '/dashboard/orders': 'Orders',
  '/dashboard/reporting': 'Reporting',
  '/dashboard/more': 'More',
}

export default function DashboardLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = TITLES[pathname] || 'Dashboard'
  const moreActive = MORE_ROUTES.includes(pathname)

  const user = getUser()
  const brand = {
    name: user?.companyName || user?.name || 'Your brand',
    initial: (user?.companyName || user?.name || 'Y').charAt(0).toUpperCase(),
    plan: 'Free plan',
  }

  const userMenu = [
    { label: 'Account settings', onClick: () => {} },
    { label: 'Billing & plan', onClick: () => {} },
    { label: 'Switch brand', onClick: () => {} },
    { label: 'Log out', danger: true, onClick: () => { logout(); navigate('/') } },
  ]

  const navItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => `dside__link ${isActive ? 'is-active' : ''}`}
    >
      {item.label}
      {item.badge && <span className="dside__badge">{item.badge}</span>}
    </NavLink>
  )

  return (
    <div className="dash">
      {/* Sidebar (desktop) */}
      <aside className="dside">
        <Link to="/" className="dside__logo">
          <span className="dside__logo-mark" />
          XXXXXX
        </Link>
        <Link to="/dashboard/jobs" className="btn btn--dark dside__post">
          + Post a job
        </Link>
        <nav className="dside__nav">{NAV.map(navItem)}</nav>
        <Dropdown
          up
          align="left"
          buttonClassName="dside__user"
          menuClassName="dside__user-menu"
          options={userMenu}
          trigger={
            <>
              <span className="dside__avatar">{brand.initial}</span>
              <span className="dside__user-info">
                <strong>{brand.name}</strong>
                <span>
                  {brand.plan} · <em>Upgrade</em>
                </span>
              </span>
              <span className="dside__chev">⇅</span>
            </>
          }
        />
      </aside>

      {/* Main column */}
      <div className="dmain">
        {/* Desktop top bar */}
        <header className="dtop">
          <h1 className="dtop__title">{title}</h1>
          <div className="dtop__right">
            <div className="dtop__search">
              <span>🔍</span>
              <input placeholder="Search creators, jobs, orders" />
            </div>
            <button className="dtop__icon" aria-label="Messages">
              💬
            </button>
            <button className="dtop__icon" aria-label="Notifications">
              🔔<span className="dtop__dot">4</span>
            </button>
          </div>
        </header>

        {/* Mobile top bar */}
        <header className="dtop-mobile">
          <Link to="/" className="dside__logo">
            <span className="dside__logo-mark" />
            XXXXXX
          </Link>
          <div className="dtop-mobile__right">
            <button className="dtop__icon" aria-label="Notifications">
              🔔<span className="dtop__dot">4</span>
            </button>
            <span className="dside__avatar">{brand.initial}</span>
          </div>
        </header>

        <div className="dcontent">
          <Outlet />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="dtabs">
        {TABS.map((to) => {
          const item = NAV.find((n) => n.to === to)
          return (
            <NavLink
              key={to}
              to={to}
              end={item.end}
              className={({ isActive }) => `dtabs__tab ${isActive ? 'is-active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          )
        })}
        <Link to="/dashboard/more" className={`dtabs__tab ${moreActive ? 'is-active' : ''}`}>
          <span>•••</span>
          More
        </Link>
      </nav>
    </div>
  )
}
