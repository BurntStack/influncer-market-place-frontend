import { lists, getCreator } from '../../data/dashboard.js'
import Dropdown from '../../components/Dropdown.jsx'
import './dash-pages.css'
import './DashLists.css'

export default function DashLists() {
  return (
    <div className="dpage">
      <div className="dpage__head">
        <div>
          <h1 className="dpage__title">Lists</h1>
          <p className="dpage__sub">Save creators you like and keep shortlists for every job.</p>
        </div>
        <div className="dpage__actions">
          <button className="btn btn--dark">+ Create a list</button>
        </div>
      </div>

      <div className="lists__grid">
        {lists.map((list) => {
          const covers = list.covers.map(getCreator)
          return (
            <article className="listcard" key={list.id}>
              <div className="listcard__collage">
                <img className="listcard__main" src={covers[0].image} alt="" loading="lazy" />
                <img src={covers[1].image} alt="" loading="lazy" />
                <img src={covers[2].image} alt="" loading="lazy" />
              </div>
              <div className="listcard__foot">
                <div className="listcard__text">
                  <strong>{list.name}</strong>
                  <span>
                    {list.count} creators · {list.updated}
                  </span>
                </div>
                <Dropdown
                  align="right"
                  buttonClassName="listcard__menu"
                  trigger="•••"
                  options={[
                    { label: 'Open list', onClick: () => {} },
                    { label: 'Rename', onClick: () => {} },
                    { label: 'Duplicate', onClick: () => {} },
                    { label: 'Delete', danger: true, onClick: () => {} },
                  ]}
                />
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
