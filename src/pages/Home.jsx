import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { creators as examples } from '../data/creators.js'
import { listCreators } from '../api/creators.js'
import CreatorMarquee from '../components/CreatorMarquee.jsx'
import './HomeStudio.css'

const QUESTIONS = [
  ['How does bidding work?', 'Post your brief, budget and deadline. Creators respond with their price and approach. Compare the proposals and choose the person who understands your brand.'],
  ['Do I need a large campaign budget?', 'You set the budget range. Start with a focused brief and clear deliverables, then compare the proposals you receive.'],
  ['Do I have to choose the lowest bid?', 'No. Consider the creator’s style, audience, previous work and proposed approach alongside their price.'],
  ['Are views and reach guaranteed?', 'No. Past results can inform your choice, but future views and reach are estimates. Agree on the work and delivery requirements before starting.'],
  ['What happens after I choose a creator?', 'Agree on the scope, price, deadline, revision limits and content usage. Your workspace brings the order and content review together.'],
]
const CATEGORIES = [
  {name:'Food & culture',query:'Food',image:examples.find(c => c.id === 'priya-nair')?.image,position:'center 35%',number:'01'},
  {name:'Beauty & wellness',query:'Beauty',image:examples.find(c => c.id === 'ananya-rao')?.image,position:'center 30%',number:'02'},
  {name:'Lifestyle & beyond',query:'Lifestyle',image:examples.find(c => c.id === 'meera-iyer')?.image,position:'center 35%',number:'03'},
]

function ProposalDemo() {
  const [selected,setSelected] = useState(0)
  const [stage,setStage] = useState('bids')
  const bidders = [examples.find(c => c.id === 'priya-nair'),examples.find(c => c.id === 'meera-iyer'),examples.find(c => c.id === 'ananya-rao')]
  const bid = bidders[selected]
  return <div className="studio-demo" aria-label="Interactive campaign example">
    <div className="studio-demo-top"><span><i /> Your campaign</span><span>Interactive example</span></div>
    <div className="studio-demo-brief"><span className="studio-label">THE BRIEF</span><h3>A fresh take on<br />your next launch.</h3><div><span>1 Instagram Reel</span><span>₹5,000–₹10,000</span></div></div>
    <div className="studio-demo-tabs" role="group" aria-label="Campaign example stages">{[['bids','Proposals'],['review','Review'],['done','Complete']].map(([key,label],i) => <button key={key} aria-pressed={stage===key} onClick={() => setStage(key)} className={stage===key ? 'active' : ''}><span>0{i+1}</span>{label}</button>)}</div>
    {stage==='bids' ? <div className="studio-proposals"><div className="studio-proposals-heading"><strong>Different voices. Your choice.</strong><span>3 proposals</span></div>{bidders.map((creator,i) => <button key={creator.id} className={`studio-proposal ${selected===i ? 'selected' : ''}`} aria-pressed={selected===i} onClick={() => setSelected(i)}><img src={creator.image} alt="" /><span><strong>{creator.name}</strong><small>{creator.category}</small></span><b>₹{Number(creator.priceFrom).toLocaleString('en-IN')}</b><span className="studio-select" aria-hidden="true">{selected===i ? '✓' : ''}</span></button>)}<button className="studio-demo-next" onClick={() => setStage('review')}>Review proposal <span aria-hidden="true">↗</span></button></div> : <div className="studio-demo-review" aria-live="polite"><img src={bid.image} alt="" /><span className="studio-label">{bid.name}</span><h3>{stage==='done' ? 'A good collaboration.' : 'The right kind of creative.'}</h3><p>{stage==='done' ? 'Your example is complete. Start a real campaign when you’re ready.' : `One Instagram Reel with ${bid.name}. Review the scope together before starting.`}</p><button className="studio-button studio-button--dark" onClick={() => setStage(stage==='done' ? 'bids' : 'done')}>{stage==='done' ? 'Try another proposal' : 'Approve example'} <span aria-hidden="true">↗</span></button></div>}
    <p className="studio-demo-note">Example only. No booking or payment is made.</p>
  </div>
}

export default function Home() {
  const navigate=useNavigate()
  const [creators,setCreators]=useState([])
  const [query,setQuery]=useState('')
  useEffect(() => {
    let active=true
    listCreators({pageSize:12}).then(data => {if(active) setCreators(Array.isArray(data) ? data : data?.results || [])}).catch(() => {})
    return () => {active=false}
  },[])
  const post=() => navigate('/dashboard/jobs?post=1')
  const heroOne=examples.find(c => c.id==='sana-qureshi')
  const heroTwo=examples.find(c => c.id==='rohan-mehta')
  return <div className="studio-home">
    <section className="studio-hero studio-container">
      <div className="studio-hero-copy"><span className="studio-label"><i /> THE CREATOR MARKETPLACE. REIMAGINED.</span><h1>Good stories<br />start with<br /><span>the right people.</span></h1><p>A new way for brands and creators to find each other. Share your brief, compare their bids, and make something that connects.</p><div className="studio-hero-actions"><button className="studio-button studio-button--dark" onClick={post}>Find your next collaborator <span aria-hidden="true">↗</span></button><Link className="studio-link" to="/creators">Explore creators <span aria-hidden="true">→</span></Link></div><div className="studio-hero-foot"><span>YOUR BRIEF.</span><span>THEIR IDEAS.</span><span>A BETTER FIT.</span></div></div>
      <div className="studio-hero-art" aria-label="Example creator collaboration"><span className="studio-art-orbit" aria-hidden="true" /><div className="studio-photo studio-photo--one"><img src={heroOne.image} alt="Example fashion creator portrait" /><div><span>Creative perspectives</span><strong>A voice that feels<br />like your brand.</strong></div></div><div className="studio-photo studio-photo--two"><img src={heroTwo.image} alt="Example technology creator portrait" /><span>Made to connect.</span></div><div className="studio-float"><span className="studio-float-icon" aria-hidden="true">↗</span><div><strong>The next great partnership?</strong><span>It starts with your idea.</span></div></div><span className="studio-art-note">A glimpse of the possibilities · Example imagery</span></div>
    </section>

    <section className="studio-talent" aria-labelledby="talent-heading"><div className="studio-container studio-talent-head"><div><span className="studio-label">FRESH PERSPECTIVES, EVERY DAY.</span><h2 id="talent-heading">Not just a following.<br /><span>A point of view.</span></h2></div><p>For every kind of brand,<br />there’s a different kind of creative.</p></div><CreatorMarquee creators={creators.length ? creators : examples} examples={!creators.length} /></section>

    <section className="studio-how studio-container" id="brands"><div className="studio-how-intro"><span className="studio-label">LESS CHASING. MORE CREATING.</span><h2>One good brief.<br />A world of<br /><span>possibilities.</span></h2><p>You know your brand. They know their audience. Bring the two together, on terms that work for you.</p><ol>{[['Tell your story.','Set the idea, budget and deliverables.'],['Hear their ideas.','Creators bid with their price and approach.'],['Choose your people.','Find the right fit, then bring it to life.']].map(([title,body],i) => <li key={title}><span>0{i+1}</span><div><strong>{title}</strong><p>{body}</p></div></li>)}</ol><button className="studio-link" onClick={post}>Write your first brief <span aria-hidden="true">↗</span></button></div><ProposalDemo /></section>

    <section className="studio-worlds" id="creators"><div className="studio-container"><div className="studio-section-head"><div><span className="studio-label">FIND YOUR CORNER OF THE INTERNET.</span><h2>Different worlds.<br /><span>The same possibility.</span></h2></div><Link className="studio-link" to="/creators">Discover all creators ↗</Link></div><div className="studio-category-grid">{CATEGORIES.map(item => <Link key={item.query} to={`/creators?q=${encodeURIComponent(item.query)}`} className="studio-category"><div><img src={item.image} style={{objectPosition:item.position}} alt={`${item.name} example creator portrait`} /><span>Explore the category <span aria-hidden="true">↗</span></span></div><footer><span>{item.number}</span><h3>{item.name}</h3><span aria-hidden="true">↗</span></footer></Link>)}</div><form className="studio-search" onSubmit={event => {event.preventDefault();navigate(`/creators${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)}}><label htmlFor="studio-search-input">Have someone specific in mind?</label><div><input id="studio-search-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try Telugu, skincare or Hyderabad" /><button type="submit" aria-label="Search creators">Search creators <span aria-hidden="true">↗</span></button></div></form><p className="studio-category-note">Category imagery is illustrative. Explore the directory for available creators.</p></div></section>

    <section className="studio-workspace studio-container" id="features"><div className="studio-workspace-header"><span className="studio-label">THE DETAILS, TAKEN CARE OF.</span><h2>More room for the idea.<br /><span>Less room for the chaos.</span></h2></div><div className="studio-workspace-grid"><article className="studio-workspace-main"><div className="studio-mini-bar"><span>YOUR CAMPAIGN, IN FOCUS.</span><span>Example</span></div><h3>Everything in its place.</h3><p>Keep your brief, proposals, content and orders connected. Pick up where you left off.</p><div className="studio-mini-flow">{[['01','Brief','The starting point.'],['02','Proposals','Find your fit.'],['03','Content','Bring it to life.']].map(([n,title,body]) => <div key={n}><span>{n}</span><strong>{title}</strong><small>{body}</small><span aria-hidden="true">↗</span></div>)}</div><Link className="studio-link" to="/dashboard">Step into your workspace ↗</Link></article><article className="studio-workspace-side"><span className="studio-big-arrow" aria-hidden="true">↗</span><h3>Your budget.<br />Your standards.<br /><span>Your choice.</span></h3><p>Compare the people behind the proposals. A great partnership is about more than the lowest price.</p><button className="studio-button studio-button--light" onClick={post}>Make your first move ↗</button></article></div></section>

    <section className="studio-faq studio-container" id="questions"><div><span className="studio-label">BEFORE YOU BEGIN.</span><h2>A little clarity<br /><span>goes a long way.</span></h2><p>Everything you need to take<br />the first step.</p></div><div>{QUESTIONS.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="studio-finale" id="pricing"><div className="studio-container"><span className="studio-label">YOUR NEXT CHAPTER IS A COLLABORATION.</span><h2>Let’s make<br />something <span>matter.</span></h2><div><p>The idea is yours.<br />The possibilities are out there.</p><button className="studio-button studio-button--lime" onClick={post}>Post your first campaign <span aria-hidden="true">↗</span></button></div><span className="studio-finale-line">BRANDS × CREATORS × POSSIBILITIES</span></div></section>
  </div>
}
