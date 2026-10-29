import { Link } from 'react-router-dom'
import { useFavorites, toggleFavorite } from '../lib/favorites.js'
import './HeroCreatorCard.css'

const inr = (n) => '₹' + n.toLocaleString('en-IN')
const platformIcon = (p) => (p === 'YouTube' ? '▶' : '◉')

export default function HeroCreatorCard({ creator }) {
  const saved = useFavorites().some((item) => item.id === creator.id)
  const toggleSave = (e) => {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(creator)
  }
  return (
    <Link to={`/creators/${creator.id}`} className="hcard">
      <img className="hcard__img" src={creator.image} alt={creator.name} loading="lazy" />
      <span className="hcard__followers">
        {platformIcon(creator.platform)} {creator.followers}
      </span>
      <button
        className={`hcard__save ${saved ? 'is-saved' : ''}`}
        aria-label="Save creator"
        onClick={toggleSave}
      >
        ♡
      </button>

      <div className="hcard__foot">
        <div className="hcard__info">
          <span className="hcard__name">{creator.name}</span>
          <span className="hcard__cat">{creator.category}</span>
        </div>
        <span className="hcard__price">{inr(creator.priceFrom)}</span>
      </div>
    </Link>
  )
}
