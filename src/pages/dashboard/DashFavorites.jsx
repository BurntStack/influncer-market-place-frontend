import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useFavorites, refreshFavorites } from '../../lib/favorites.js'
import DashCreatorCard from '../../components/dashboard/DashCreatorCard.jsx'
import './dash-pages.css'
export default function DashFavorites() {
  const items = useFavorites()
  useEffect(() => { refreshFavorites().catch(() => {}) }, [])
  return <div className="dpage"><div className="dpage__head"><div><h1 className="dpage__title">Favorites</h1><p className="dpage__sub">{items.length} saved creators · Saved on this device.</p></div><Link className="btn btn--dark" to="/dashboard/search">Explore creators</Link></div>{items.length ? <div className="dcreator-grid">{items.map((creator) => <DashCreatorCard key={creator.id} creator={creator} />)}</div> : <section className="dcard account-panel"><h2>No favorites yet</h2><p className="dpage__sub">Tap a creator’s heart to save them here. Tap again to remove them.</p><Link className="btn btn--outline" to="/dashboard/search">Find creators →</Link></section>}</div>
}
