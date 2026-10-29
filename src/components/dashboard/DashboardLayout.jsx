import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { logout, getUser } from '../../lib/auth.js'
import Dropdown from '../Dropdown.jsx'
import './DashboardLayout.css'

/* Feather-style SVG icons — stroke="currentColor" so they respond to CSS color */
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)
const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
  </svg>
)

const NAV = [
  { to: '/dashboard', end: true, label: 'Home', Icon: HomeIcon },
  { to: '/dashboard/search', label: 'Search', Icon: SearchIcon },
  { to: '/dashboard/favorites', label: 'Favorites', Icon: HeartIcon },
  { to: '/dashboard/jobs', label: 'Jobs', Icon: BriefcaseIcon },
  { to: '/dashboard/deliverables', label: 'Deliverables', Icon: BoxIcon },
  { to: '/dashboard/orders', label: 'Orders', Icon: MessageIcon },
  { to: '/dashboard/reporting', label: 'Reporting', Icon: ChartIcon },
]

const TABS = ['/dashboard', '/dashboard/search', '/dashboard/jobs', '/dashboard/orders']
const MORE_ROUTES = [
  '/dashboard/more',
  '/dashboard/favorites',
  '/dashboard/deliverables',
  '/dashboard/reporting',
]

const TITLES = {
  '/dashboard': 'Home',
  '/dashboard/search': 'Search',
  '/dashboard/favorites': 'Favorites',
  '/dashboard/jobs': 'Jobs',
  '/dashboard/deliverables': 'Deliverables',
  '/dashboard/orders': 'Orders',
  '/dashboard/reporting': 'Reporting',
  '/dashboard/more': 'More',
}

export default function DashboardLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const accountTitles = { settings: 'Account settings', billing: 'Billing & plan', brands: 'Your brand', messages: 'Messages', notifications: 'Notifications', support: 'Help & support' }
  const title = TITLES[pathname] || accountTitles[pathname.split('/').pop()] || 'Dashboard'
  const moreActive = MORE_ROUTES.includes(pathname) || pathname.startsWith('/dashboard/account/')

  const user = getUser()
  const brand = {
    name: user?.companyName || user?.name || 'Your brand',
    initial: (user?.companyName || user?.name || 'Y').charAt(0).toUpperCase(),
    plan: 'Free plan',
  }

  const userMenu = [
    { label: 'Account settings', onClick: () => navigate('/dashboard/account/settings') },
    { label: 'Billing & plan', onClick: () => navigate('/dashboard/account/billing') },
    { label: 'Your brand', onClick: () => navigate('/dashboard/account/brands') },
    { label: 'Log out', danger: true, onClick: () => { logout(); navigate('/') } },
  ]

  const navItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => `dside__link ${isActive ? 'is-active' : ''}`}
    >
      <span className="dside__icon"><item.Icon /></span>
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
        <Link to="/dashboard/jobs?post=1" className="dside__post">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post a job
        </Link>
        <nav className="dside__nav" aria-label="Brand workspace"><span className="brand-nav-label">Workspace</span>{NAV.map(navItem)}</nav>
        <Link className="brand-sidebar-help" to="/dashboard/account/support"><span>Help & support</span><span aria-hidden="true">↗</span></Link>
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
                <span>{brand.plan}</span>
              </span>
              <span className="dside__chev">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="7 15 12 20 17 15"/><polyline points="7 9 12 4 17 9"/></svg>
              </span>
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
              <SearchIcon />
              <input placeholder="Search creators" onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/dashboard/search?q=${encodeURIComponent(event.target.value)}`) }} />
            </div>
            <button className="dtop__icon" aria-label="Messages" onClick={() => navigate('/dashboard/account/messages')}>
              <MessageIcon />
            </button>
            <button className="dtop__icon" aria-label="Notifications" onClick={() => navigate('/dashboard/account/notifications')}>
              <BellIcon />
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
            <button className="dtop__icon" aria-label="Notifications" onClick={() => navigate('/dashboard/account/notifications')}>
              <BellIcon />
            </button>
            <span className="dside__avatar">{brand.initial}</span>
          </div>
        </header>

        <div className="dcontent">
          <div className="brand-section-meta"><span>YOUR BRAND WORKSPACE</span><span>{title}</span></div>
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
              <span className="dtabs__icon"><item.Icon /></span>
              {item.label}
            </NavLink>
          )
        })}
        <Link to="/dashboard/more" className={`dtabs__tab ${moreActive ? 'is-active' : ''}`}>
          <span className="dtabs__icon"><MoreIcon /></span>
          More
        </Link>
      </nav>
    </div>
  )
}
