import { Link } from 'react-router-dom'
import './Footer.css'

const COLUMNS = [
  {
    title: 'Product',
    links: ['Find creators', 'Campaigns', 'Escrow payments', 'Reporting'],
  },
  {
    title: 'For brands',
    links: ['D2C founders', 'Agencies', 'Marketing teams', 'Enterprise'],
  },
  {
    title: 'Free tools',
    links: ['Rate calculator', 'Engagement checker', 'Brief template', 'Contract template'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Help centre', 'Contact'],
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
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} xxxxxx. All rights reserved.</span>
        <div className="footer__legal">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Refund policy</a>
        </div>
      </div>
    </footer>
  )
}
