import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isAuthed } from '../lib/auth.js'
import './Navbar.css'

const LINKS = [ ['Find creators','/creators'], ['How it works','/#brands'], ['The workspace','/#features'], ['Questions','/#questions'] ]
export default function Navbar() {
  const [open,setOpen] = useState(false)
  const location = useLocation()
  const menuButton = useRef(null)
  const header = useRef(null)
  useEffect(() => {setOpen(false)},[location.pathname,location.hash])
  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape') {setOpen(false);menuButton.current?.focus()}
      if (event.type === 'pointerdown' && !header.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown',close)
    document.addEventListener('pointerdown',close)
    return () => {document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',close)}
  },[])
  return <header className="nav editorial-nav" ref={header}><div className="nav__bar">
    <Link className="nav__logo" to="/" aria-label="Home"><span className="nav__logo-mark" aria-hidden="true" />XXXXXX<span className="editorial-brand-label">for brands</span></Link>
    <nav id="main-navigation" aria-label="Main navigation" className={`nav__links ${open ? 'is-open' : ''}`}>{LINKS.map(([label,to]) => <Link key={label} to={to} className={`nav__plain ${location.pathname === '/creators' && to === '/creators' ? 'current' : ''}`} onClick={() => setOpen(false)}>{label}</Link>)}<Link className="btn btn--primary nav__mobile-cta" to="/dashboard/jobs?post=1" onClick={() => setOpen(false)}>Post a campaign ↗</Link></nav>
    <div className="nav__actions"><Link className="nav__login" to={isAuthed() ? '/dashboard' : '/login'}>{isAuthed() ? 'Workspace' : 'Log in'}</Link><Link className="btn btn--primary btn--sm editorial-nav-cta" to="/dashboard/jobs?post=1">Post a campaign ↗</Link><button ref={menuButton} className="nav__burger" aria-label="Toggle menu" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(value => !value)}><span /><span /></button></div>
  </div></header>
}
