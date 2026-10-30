import { useEffect, useRef } from 'react'
import './Modal.css'

// Native dialogs provide focus trapping, Escape handling, and focus restoration.
export default function Modal({ title, subtitle, children, onClose, busy = false, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = previous }
  }, [])
  return <dialog ref={ref} className={`workspace-modal ${wide ? 'workspace-modal--wide' : ''}`} aria-label={title}
    onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
    onClick={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <div className="workspace-modal__surface">
      <header className="workspace-modal__head"><div><span className="eyebrow">YOUR NEXT COLLABORATION</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button type="button" className="workspace-modal__close" aria-label="Close dialog" disabled={busy} onClick={onClose}>×</button></header>
      <div className="workspace-modal__body">{children}</div>
    </div>
  </dialog>
}
