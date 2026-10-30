import CreatorImage from '../CreatorImage.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites, toggleFavorite } from '../../lib/favorites.js'
import './DashCreatorCard.css'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function DashCreatorCard({ creator }) {
  const saved = useFavorites().some((item) => item.id === creator.id)
  const toggleSave = async (e) => {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(creator)
  }
  return (
    <Link to={`/creators/${creator.id}`} className="dccard">
      <div className="dccard__media">
        <CreatorImage src={creator.image} alt={creator.name} loading="lazy" />
        {creator.badge && <span className="dccard__badge">{creator.badge}</span>}
        <button className={`dccard__save ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove from saved creators' : 'Save'} onClick={toggleSave}>
          {saved ? '♥' : '♡'}
        </button>
        <span className="dccard__followers">◉ {creator.followers}</span>
        <div className="dccard__name">
          {creator.name} <span>★ {creator.rating}</span>
        </div>
      </div>
      <div className="dccard__foot">
        <div className="dccard__row">
          <span>{creator.deliverable}</span>
          <strong>{inr(creator.priceFrom)}</strong>
        </div>
        <div className="dccard__loc">
          ⚲ {creator.location} · {creator.category}
        </div>
      </div>
    </Link>
  )
}
