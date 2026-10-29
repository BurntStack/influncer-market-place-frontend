import { useEffect, useState } from 'react'
import { lists as mockLists, getCreator } from '../../data/dashboard.js'
import { createList, deleteList, duplicateList, getLists, renameList } from '../../api/dashboard.js'
import Dropdown from '../../components/Dropdown.jsx'
import './dash-pages.css'
import './DashLists.css'

export default function DashLists() {
  const [lists, setLists] = useState(mockLists)
  const [selected, setSelected] = useState(null)
  useEffect(() => {
    getLists().then((data) => {
      const next = Array.isArray(data) ? data : data?.results
      if (next?.length) setLists(next)
    }).catch(() => {})
  }, [])

  const create = async () => {
    const name = window.prompt('Name this list')
    if (!name?.trim()) return
    try {
      const created = await createList({ name: name.trim() })
      setLists((current) => [...current, created || { id: `local-${Date.now()}`, name: name.trim(), count: 0, covers: [] }])
    } catch { setLists((current) => [...current, { id: `local-${Date.now()}`, name: name.trim(), count: 0, covers: [] }]) }
  }

  const rename = async (list) => {
    const name = window.prompt('New list name', list.name)
    if (!name?.trim() || name === list.name) return
    try { await renameList(list.id, { name: name.trim() }) } catch {}
    setLists((current) => current.map((item) => item.id === list.id ? { ...item, name: name.trim() } : item))
  }

  const duplicate = async (list) => {
    try {
      const copy = await duplicateList(list.id)
      setLists((current) => [...current, copy || { ...list, id: `local-${Date.now()}`, name: `${list.name} copy` }])
    } catch { setLists((current) => [...current, { ...list, id: `local-${Date.now()}`, name: `${list.name} copy` }]) }
  }

  const remove = async (list) => {
    if (!window.confirm(`Delete “${list.name}”?`)) return
    try { await deleteList(list.id) } catch {}
    setLists((current) => current.filter((item) => item.id !== list.id))
  }

  return (
    <div className="dpage">
      <div className="dpage__head">
        <div>
          <h1 className="dpage__title">Lists</h1>
          <p className="dpage__sub">Save creators you like and keep shortlists for every job.</p>
        </div>
        <div className="dpage__actions">
          <button className="btn btn--dark" onClick={create}>+ Create a list</button>
        </div>
      </div>

      {selected && <section className="dcard" style={{ padding: 24, marginBottom: 20 }}><h2>{selected.name}</h2><p className="dpage__sub">Saved creators</p>{(selected.covers || []).map(getCreator).filter(Boolean).map((creator) => <a key={creator.id} className="dside__link" href={`/creators/${creator.id}`}>{creator.name} →</a>)}{!selected.covers?.length && <p>No creators saved yet. Find creators to build your shortlist.</p>}<button className="dbtn-ghost" onClick={() => setSelected(null)}>Close list</button></section>}
      <div className="lists__grid">
        {lists.map((list) => {
          const covers = (list.covers || []).map((cover) => typeof cover === 'string' && cover.startsWith('http') ? { image: cover } : getCreator(cover)).filter(Boolean)
          while (covers.length < 3) covers.push(covers[0] || { image: '' })
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
                    {list.count ?? list.creatorCount ?? 0} creators · {list.updated || list.updatedAt || ''}
                  </span>
                </div>
                <Dropdown
                  align="right"
                  buttonClassName="listcard__menu"
                  trigger="•••"
                  options={[
                    { label: 'Open list', onClick: () => setSelected(list) },
                    { label: 'Rename', onClick: () => rename(list) },
                    { label: 'Duplicate', onClick: () => duplicate(list) },
                    { label: 'Delete', danger: true, onClick: () => remove(list) },
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
