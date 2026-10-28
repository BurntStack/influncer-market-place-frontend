import { Link } from 'react-router-dom'
import './CreatorCard.css'

const inr = (n) => '₹' + n.toLocaleString('en-IN')

export default function CreatorCard({ creator }) {
  return (
    <Link to={`/creators/${creator.id}`} className="ccard">
      <div className="ccard__media">
        <img src={creator.image} alt={creator.name} loading="lazy" />
        <span className="ccard__followers">▶ {creator.followers}</span>
        <button className="ccard__save" aria-label="Save creator">
          ♡
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
