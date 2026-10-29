import { Link } from 'react-router-dom'
import './Footer.css'

const COLUMNS = [
  {
    title: 'Product',
    links: [['Find creators', '/creators'], ['Post a campaign', '/dashboard/jobs?post=1'], ['Orders & payments', '/dashboard/orders'], ['Reporting', '/dashboard/reporting']],
  },
  {
    title: 'For brands',
    links: [['How it works', '/#brands'], ['Explore features', '/#features'], ['Campaign budgets', '/#pricing']],
  },
  {
    title: 'Your workspace',
    links: [['Saved creators', '/dashboard/favorites'], ['Campaigns', '/dashboard/jobs'], ['Content library', '/dashboard/deliverables']],
  },
  {
    title: 'Get started',
    links: [['Create an account', '/signup'], ['Log in', '/login'], ['Account settings', '/dashboard/account/settings']],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-mark" />
            XXXXXX
          </Link>
          <p>
            The simplest way for Indian brands to hire creators, approve content
            and pay safely.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="footer__col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} xxxxxx. All rights reserved.</span>
        <div className="footer__legal">
          <Link to="/#brands">How hiring works</Link>
          <Link to="/dashboard/orders">Manage orders</Link>
        </div>
      </div>
    </footer>
  )
}
