import { useEffect, useState } from 'react'
import { createList, deleteList, duplicateList, getList, getLists, renameList } from '../../api/dashboard.js'
import Dropdown from '../../components/Dropdown.jsx'
import './dash-pages.css'
import './DashLists.css'

export default function DashLists() {
  const [lists, setLists] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    getLists().then((data) => {
      const next = Array.isArray(data) ? data : data?.results
      setLists(next || [])
    }).catch(err => setError(err.message || 'Could not load your lists.'))
  }, [])

  const create = async () => {
    const name = window.prompt('Name this list')
    if (!name?.trim()) return
    try {
      const created = await createList({ name: name.trim() })
      setLists((current) => [...current, created])
    } catch (err) { setError(err.message || 'Could not create the list.') }
  }

  const rename = async (list) => {
    const name = window.prompt('New list name', list.name)
    if (!name?.trim() || name === list.name) return
    try { await renameList(list.id, { name: name.trim() }); setLists((current) => current.map((item) => item.id === list.id ? { ...item, name: name.trim() } : item)) }
    catch (err) { setError(err.message || 'Could not rename the list.') }
  }

  const duplicate = async (list) => {
    try {
      const copy = await duplicateList(list.id)
      setLists((current) => [...current, copy])
    } catch (err) { setError(err.message || 'Could not duplicate the list.') }
  }

  const remove = async (list) => {
    if (!window.confirm(`Delete “${list.name}”?`)) return
    try { await deleteList(list.id); setLists((current) => current.filter((item) => item.id !== list.id)) }
    catch (err) { setError(err.message || 'Could not delete the list.') }
  }

  const openList = async list => {
    setError('')
    try { setSelected(await getList(list.id)) }
    catch (err) { setError(err.message || 'Could not open this list.') }
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
      {error && <p className="workspace-message workspace-message--error" role="alert">{error}</p>}

      {selected && <section className="dcard" style={{ padding: 24, marginBottom: 20 }}><h2>{selected.name}</h2><p className="dpage__sub">Saved creators</p>{(selected.creators || []).map(item => item.creator || item).map(item => typeof item === 'string' ? { id: item } : item).map(creator => <a key={creator.id || creator.creatorId} className="dside__link" href={`/creators/${creator.id || creator.creatorId}`}>{creator.name || creator.displayName || 'View creator'} →</a>)}{!selected.creators?.length && <p>No creators saved yet. Find creators to build your shortlist.</p>}<button className="dbtn-ghost" onClick={() => setSelected(null)}>Close list</button></section>}
      <div className="lists__grid">
        {lists.map((list) => {
          const covers = (list.creators || []).map(item => item.creator || item).map(item => ({ image: item.image || item.avatarUrl })).filter(item => item.image)
          while (covers.length < 3) covers.push(covers[0] || { image: '/favicon.svg' })
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
                    { label: 'Open list', onClick: () => openList(list) },
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
