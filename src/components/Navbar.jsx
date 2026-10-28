import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

// Mega-menu content, mirrored from the Figma nav dropdown states.
const MENUS = {
  Features: {
    width: 660,
    columns: [
      [
        { icon: '🔍', color: 'pink', title: 'Search Creators', desc: 'Browse 25,000+ vetted Indian creators' },
        { icon: '💬', color: 'purple', title: 'Creator Chat & Management', desc: 'Brief, negotiate and track deliverables in one thread' },
        { icon: '📊', color: 'green', title: 'Performance Tracking', desc: 'Live reach, engagement and ROI reports' },
        { icon: '📄', color: 'orange', title: 'Campaign Briefs & Outreach', desc: 'Send one brief to hundreds of creators' },
      ],
      [
        { icon: '💳', color: 'blue', title: 'Secure Payments', desc: 'Escrow, GST invoices and TDS handled for you' },
        { icon: '👥', color: 'yellow', title: 'Team Workspace', desc: 'Bring teammates in and approve together' },
        { icon: '⭐', color: 'blue', title: 'Bring Your Own Creators', desc: 'Manage the creators you already work with' },
      ],
    ],
  },
  'For Brands': {
    width: 660,
    columns: [
      [
        { icon: '👥', color: 'yellow', title: 'Marketing Teams', desc: 'Plan and approve campaigns as a team' },
        { icon: '🏢', color: 'blue', title: 'Agencies', desc: 'Run every client from one login' },
        { icon: '🚀', color: 'orange', title: 'Founders', desc: 'Launch your first creator campaign this week' },
        { icon: '🏛️', color: 'blue', title: 'Enterprise', desc: 'Creator programmes at company scale' },
      ],
      [
        { icon: '🏆', color: 'purple', title: 'Case Studies', desc: 'How Indian brands grow with xxxxxx' },
      ],
    ],
  },
  'Use Cases': {
    width: 380,
    columns: [
      [
        { icon: '🎥', color: 'orange', title: 'UGC for Ads', desc: 'Creator videos for your paid social' },
        { icon: '📣', color: 'pink', title: 'Influencer Marketing', desc: 'Reach new buyers through trusted voices' },
        { icon: '🔗', color: 'green', title: 'Affiliate Marketing', desc: 'Pay creators per sale with tracked links' },
      ],
    ],
  },
}

const MENU_LABELS = Object.keys(MENUS)

function MenuItem({ item, onPick }) {
  return (
    <button className="menu__item" onClick={onPick}>
      <span className={`menu__icon menu__icon--${item.color}`}>{item.icon}</span>
      <span className="menu__text">
        <span className="menu__title">{item.title}</span>
        <span className="menu__desc">{item.desc}</span>
      </span>
    </button>
  )
}

// Devices with a real pointer get hover-to-open; touch devices get click-to-toggle.
const canHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

export default function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(null) // which mega-menu is open
  const [mobileOpen, setMobileOpen] = useState(false)

  const pick = () => {
    setOpen(null)
    setMobileOpen(false)
    navigate('/creators')
  }

  const toggle = (label) => setOpen((cur) => (cur === label ? null : label))

  // On hover devices the panel is already opened by onMouseEnter, so a click
  // must keep it open (not toggle it shut). On touch, click toggles.
  const onTriggerClick = (label) =>
    canHover ? setOpen(label) : toggle(label)

  // Close with a small delay so moving the cursor from a trigger down into the
  // panel (crossing a gap) doesn't snap the menu shut before a click lands.
  const closeTimer = useRef(null)
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(null), 140)
  }

  return (
    <header
      className="nav"
      onMouseEnter={canHover ? cancelClose : undefined}
      onMouseLeave={canHover ? scheduleClose : undefined}
    >
      <div className="nav__bar">
        <Link to="/" className="nav__logo" onClick={() => { setOpen(null); setMobileOpen(false) }}>
          <span className="nav__logo-mark" />
          XXXXXX
        </Link>

        <nav className={`nav__links ${mobileOpen ? 'is-open' : ''}`}>
          {MENU_LABELS.map((label) => (
            <div
              key={label}
              className={`nav__item ${open === label ? 'is-active' : ''}`}
              onMouseEnter={canHover ? () => setOpen(label) : undefined}
            >
              <button
                className="nav__trigger"
                aria-expanded={open === label}
                onClick={() => onTriggerClick(label)}
              >
                {label}
                <span className="nav__caret">▾</span>
              </button>

              {/* Mobile accordion submenu */}
              {open === label && (
                <div className="nav__submenu-mobile">
                  {MENUS[label].columns.flat().map((item) => (
                    <MenuItem key={item.title} item={item} onPick={pick} />
                  ))}
                </div>
              )}
            </div>
          ))}

          <a href="/#pricing" className="nav__plain" onClick={() => setMobileOpen(false)}>
            Pricing
          </a>

          <div className="nav__mobile-cta">
            <Link to="/login" className="btn btn--outline" onClick={() => setMobileOpen(false)}>
              Log in
            </Link>
            <Link to="/signup" className="btn btn--dark" onClick={() => setMobileOpen(false)}>
              Sign up free
            </Link>
          </div>
        </nav>

        <div className="nav__actions">
          <Link to="/login" className="btn btn--ghost-dark btn--sm nav__login">
            Log in
          </Link>
          <Link to="/signup" className="btn btn--white btn--sm nav__signup">
            Sign up
          </Link>
          <button
            className="nav__burger"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Desktop mega-menu panel */}
      {open && (
        <div
          className="nav__panel"
          style={{ maxWidth: MENUS[open].width }}
          onMouseEnter={cancelClose}
        >
          <div
            className="nav__panel-cols"
            style={{ gridTemplateColumns: `repeat(${MENUS[open].columns.length}, 1fr)` }}
          >
            {MENUS[open].columns.map((col, ci) => (
              <div className="nav__panel-col" key={ci}>
                {col.map((item) => (
                  <MenuItem key={item.title} item={item} onPick={pick} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
