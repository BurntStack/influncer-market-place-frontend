import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getConversation, getConversations, getMessages, markConversationRead, sendMessage } from '../../api/messages.js'
import { openPrivateUpload, uploadFile } from '../../api/uploads.js'
import './dash-pages.css'
import './DashMessages.css'

const time = value => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''
const mergeMessages = (older, newer) => [...new Map([...older, ...newer].map(item => [item.id, item])).values()]

export default function DashMessages() {
  const [params, setParams] = useSearchParams()
  const activeId = params.get('chat')
  const [conversations, setConversations] = useState([])
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [cursor, setCursor] = useState(null)
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [error, setError] = useState('')
  const [listReload, setListReload] = useState(0)
  const [chatReload, setChatReload] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    getConversations().then(items => {
      if (!active) return
      setConversations(items)
      if (items[0]?.id) setParams(current => current.get('chat') ? current : new URLSearchParams({ chat: items[0].id }), { replace: true })
    }).catch(err => { if (active) setError(err.message || 'Could not load conversations.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [listReload])

  useEffect(() => {
    if (!activeId) { setConversation(null); setMessages([]); return }
    let active = true
    setChatLoading(true); setError(''); setMessages([]); setCursor(null)
    Promise.all([getConversation(activeId), getMessages(activeId)]).then(([detail, page]) => {
      if (!active) return
      setConversation(detail)
      setMessages(page.results.slice().reverse())
      setCursor(page.nextCursor)
      markConversationRead(activeId).then(() => setConversations(items => items.map(item => item.id === activeId ? { ...item, unread: 0 } : item))).catch(() => {})
    }).catch(err => { if (active) setError(err.message || 'Could not load this chat.') })
      .finally(() => { if (active) setChatLoading(false) })
    return () => { active = false }
  }, [activeId, chatReload])

  useEffect(() => {
    const handle = event => {
      const data = event.detail
      if (data?.event === 'reconnected') { setListReload(value => value + 1); setChatReload(value => value + 1); return }
      if (data?.event !== 'new_message') return
      if (String(data.conversationId) === String(activeId)) {
        setMessages(items => mergeMessages(items, [data.message]))
        markConversationRead(activeId).catch(() => {})
      }
      setListReload(value => value + 1)
    }
    window.addEventListener('linkloom-realtime', handle)
    return () => window.removeEventListener('linkloom-realtime', handle)
  }, [activeId])

  const loadOlder = async () => {
    if (!cursor || !activeId || busy) return
    setBusy(true); setError('')
    try {
      const page = await getMessages(activeId, cursor)
      setMessages(items => mergeMessages(page.results.slice().reverse(), items))
      setCursor(page.nextCursor)
    } catch (err) { setError(err.message || 'Could not load older messages.') }
    finally { setBusy(false) }
  }

  const send = async event => {
    event.preventDefault()
    if (!activeId || busy || (!text.trim() && !file)) return
    setBusy(true); setError('')
    try {
      const attachment = file ? await uploadFile(file, 'chat_attachment') : null
      const sent = await sendMessage(activeId, { text, attachmentUploadId: attachment?.id })
      setMessages(items => mergeMessages(items, [sent]))
      setText(''); setFile(null)
      setListReload(value => value + 1)
    } catch (err) { setError(err.message || 'Could not send the message.') }
    finally { setBusy(false) }
  }

  const party = conversation?.withParty || conversations.find(item => String(item.id) === String(activeId))?.withParty
  return <div className="dpage">
    <div className="dpage__head"><div><h1 className="dpage__title">Messages</h1><p className="dpage__sub">Keep each collaboration in one conversation.</p></div></div>
    {error && <p className="workspace-message workspace-message--error" role="alert">{error} <button className="dbtn-ghost" onClick={() => { setListReload(value => value + 1); setChatReload(value => value + 1) }}>Retry</button></p>}
    <div className="chat-layout">
      <aside className="chat-list" aria-label="Conversations">
        <h2>Conversations</h2>
        {loading && <p>Loading conversations…</p>}
        {!loading && !conversations.length && <p>No conversations yet. Open a creator profile to start a chat after a bid, offer, or order.</p>}
        {conversations.map(item => <button key={item.id} className={`chat-list__item ${String(item.id) === String(activeId) ? 'is-active' : ''}`} onClick={() => setParams({ chat: item.id })}>
          {item.withParty?.image ? <img src={item.withParty.image} alt="" /> : <span className="chat-list__avatar">{(item.withParty?.name || 'C')[0]}</span>}
          <span><strong>{item.withParty?.name || 'Conversation'}</strong><small>{item.lastMessage?.text || (item.lastMessage?.hasAttachment ? 'Attachment' : 'Start a conversation')}</small></span>
          {item.unread > 0 && <b aria-label={`${item.unread} unread`}>{item.unread}</b>}
        </button>)}
      </aside>
      <section className="chat-panel" aria-label="Messages">
        {!activeId ? <div className="chat-panel__empty">Select a conversation to read messages.</div> : <>
          <header className="chat-panel__header"><strong>{party?.name || 'Conversation'}</strong><span>{party?.type || 'Creator'}</span></header>
          <div className="chat-panel__messages">
            {chatLoading && <p role="status">Loading messages…</p>}
            {cursor && <button className="chat-panel__older" disabled={busy} onClick={loadOlder}>Load older messages</button>}
            {!chatLoading && !messages.length && <p className="chat-panel__empty">Say hello and share the details of your collaboration.</p>}
            {messages.map(item => <div key={item.id} className={`chat-bubble ${item.fromMe ? 'chat-bubble--mine' : ''}`}>
              {item.text && <p>{item.text}</p>}
              {item.attachment?.uploadId && <button type="button" onClick={() => openPrivateUpload(item.attachment.uploadId).catch(err => setError(err.message))}>Open attachment ↗</button>}
              <time dateTime={item.sentAt}>{time(item.sentAt)}</time>
            </div>)}
          </div>
          <form className="chat-compose" onSubmit={send}>
            {file && <div className="chat-compose__file">{file.name}<button type="button" onClick={() => setFile(null)} aria-label="Remove attachment">×</button></div>}
            <div><label className="chat-compose__attach">Attach<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={event => setFile(event.target.files?.[0] || null)} /></label><textarea value={text} onChange={event => setText(event.target.value)} placeholder="Write a message…" maxLength={4000} rows={2} /><button className="btn btn--dark" disabled={busy || (!text.trim() && !file)}>{busy ? 'Sending…' : 'Send'}</button></div>
          </form>
        </>}
      </section>
    </div>
  </div>
}
