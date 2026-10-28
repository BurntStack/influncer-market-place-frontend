import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import './Dropdown.css'

/**
 * Reusable dropdown / menu.
 * - Value-select mode: pass `value` + `onChange` and string `options`.
 * - Action-menu mode: pass `options` as `[{ label, onClick }]`.
 * The menu renders in a portal with fixed positioning, so it is never clipped
 * by an ancestor's `overflow: hidden` (e.g. cards or tables).
 */
export default function Dropdown({
  label,
  value,
  placeholder,
  options = [],
  onChange,
  align = 'left',
  up = false,
  buttonClassName = '',
  menuClassName = '',
  trigger, // optional custom trigger content (hides the default text + caret)
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const place = () => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = Math.max(180, r.width)
    // Flip up automatically if a downward menu would overflow the viewport.
    const openUp = up || r.bottom + 280 > vh

    let left = align === 'right' ? r.right - width : r.left
    left = Math.max(8, Math.min(left, vw - width - 8))

    setPos({
      left,
      width,
      top: openUp ? undefined : Math.round(r.bottom + 6),
      bottom: openUp ? Math.round(vh - r.top + 6) : undefined,
    })
  }

  useLayoutEffect(() => {
    if (open) place()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (triggerRef.current?.contains(e.target)) return
      if (menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    // Close when the page scrolls (fixed menu would detach), but ignore scrolls
    // originating inside the menu itself so a long/scrollable list still works.
    const onScroll = (e) => {
      if (menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onResize = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const triggerText = label
    ? value
      ? `${label}: ${value}`
      : label
    : value ?? placeholder ?? 'Select'

  return (
    <div className={`dd ${open ? 'is-open' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`dd__trigger ${buttonClassName} ${value ? 'is-selected' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger ?? (
          <>
            <span className="dd__text">{triggerText}</span>
            <span className="dd__caret">▾</span>
          </>
        )}
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            className={`dd__menu ${menuClassName}`}
            role="menu"
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              minWidth: pos.width,
            }}
          >
            {options.map((opt) => {
              const o = typeof opt === 'string' ? { label: opt, value: opt } : opt
              const selected = value != null && value === o.value
              return (
                <button
                  type="button"
                  role="menuitem"
                  key={o.value ?? o.label}
                  className={`dd__item ${selected ? 'is-active' : ''} ${o.danger ? 'is-danger' : ''}`}
                  onClick={() => {
                    if (o.value !== undefined) onChange?.(o.value)
                    o.onClick?.()
                    setOpen(false)
                  }}
                >
                  <span>{o.label}</span>
                  {selected && <span className="dd__check">✓</span>}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
