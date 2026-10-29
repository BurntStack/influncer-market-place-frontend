import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CreatorMarquee.css'

export default function CreatorMarquee({ creators, examples = false }) {
  const [paused, setPaused] = useState(false)
  // Keep each half wider than a desktop viewport, even with a small catalogue.
  const items = creators.length ? Array.from({ length: Math.max(8, creators.length) }, (_, index) => creators[index % creators.length]) : []
  if (!items.length) return null

  const cards = (copy = false) => <div className="creator-marquee__group" aria-hidden={copy || undefined} inert={copy ? '' : undefined}>
    {items.map((creator, index) => {
      const content = <><img src={creator.image} alt={copy ? '' : creator.name} loading={index < 6 ? 'eager' : 'lazy'} /><span className="marquee-card__platform">{creator.platform || 'Creator'}</span><div className="marquee-card__details"><strong>{creator.name}</strong><span>{creator.category}</span></div><span className="marquee-card__arrow" aria-hidden="true">↗</span></>
      return examples ? <article className="marquee-card" key={`${creator.id}-${index}`}>{content}</article> : <Link className="marquee-card" to={`/creators/${creator.id}`} key={`${creator.id}-${index}`} tabIndex={copy ? -1 : undefined}>{content}</Link>
    })}
  </div>

  return <section className={`creator-marquee ${paused ? 'is-paused' : ''}`} aria-label={examples ? 'Example creator profiles' : 'Discover creators'}>
    <div className="creator-marquee__viewport"><div className="creator-marquee__track" style={{ '--marquee-duration': `${items.length * 7}s` }}>{cards()}{cards(true)}</div></div>
    <div className="creator-marquee__caption container"><span>{examples ? 'A glimpse of the possibilities · Example profiles' : 'Fresh perspectives. Different voices. Your next collaboration.'}</span><button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play creator carousel' : 'Pause creator carousel'} aria-pressed={paused}><span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>{paused ? 'Play' : 'Pause'}</button></div>
  </section>
}
