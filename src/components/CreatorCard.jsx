import CreatorImage from './CreatorImage.jsx'
import { Link } from 'react-router-dom'
import { useFavorites, toggleFavorite } from '../lib/favorites.js'
import './CreatorCard.css'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function CreatorCard({ creator }) {
  const saved = useFavorites().some((item) => item.id === creator.id)
  const toggleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(creator)
  }
  return (
    <Link to={`/creators/${creator.id}`} className="ccard">
      <div className="ccard__media">
        <CreatorImage src={creator.image} alt={creator.name} loading="lazy" />
        <span className="ccard__followers">▶ {creator.followers}</span>
        <button className={`ccard__save ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove from saved creators' : 'Save creator'} onClick={toggleSave}>
          {saved ? '♥' : '♡'}
        </button>
        <div className="ccard__overlay">
          <div className="ccard__name">{creator.name}</div>
          <div className="ccard__meta">
            {creator.category} · {creator.location}
          </div>
        </div>
      </div>
      <div className="ccard__foot">
        <span className="ccard__deliverable">{creator.deliverable}</span>
        <span className="ccard__price">{inr(creator.priceFrom)}</span>
      </div>
    </Link>
  )
}
