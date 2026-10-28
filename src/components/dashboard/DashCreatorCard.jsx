import { Link } from 'react-router-dom'
import './DashCreatorCard.css'

const inr = (n) => '₹' + n.toLocaleString('en-IN')

export default function DashCreatorCard({ creator }) {
  return (
    <Link to={`/creators/${creator.id}`} className="dccard">
      <div className="dccard__media">
        <img src={creator.image} alt={creator.name} loading="lazy" />
        {creator.badge && <span className="dccard__badge">{creator.badge}</span>}
        <button className="dccard__save" aria-label="Save" onClick={(e) => e.preventDefault()}>
          ♡
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
