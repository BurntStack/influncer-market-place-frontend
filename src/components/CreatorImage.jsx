import { useState } from 'react'
import './CreatorImage.css'

// Creator photos come from API records. Missing photos use a neutral placeholder.
export default function CreatorImage({ src, alt = '', className = '', ...props }) {
  const [failed, setFailed] = useState(null)
  const oldLocalPhoto = /^\/creators\/(ananya-rao|rohan-mehta|meera-iyer|kabir-singh|sana-qureshi|priya-nair|arjun-das|ishita-kapoor)\.jpg(?:\?|$)/.test(src || '')
  if (src && !oldLocalPhoto && failed !== src) {
    return <img {...props} className={className} src={src} alt={alt} onError={() => setFailed(src)} />
  }
  return <figure className={`creator-image-empty ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}><svg width="42" height="42" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="24" cy="17" r="7"/><path d="M10 40v-4a14 14 0 0 1 28 0v4"/></svg></figure>
}
