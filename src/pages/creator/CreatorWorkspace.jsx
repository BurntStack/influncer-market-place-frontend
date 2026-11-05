import { Navigate } from 'react-router-dom'
import { getUser } from '../../lib/auth.js'
import { getSocialAccounts } from '../../lib/socialAccounts.js'
import './CreatorWorkspace.css'

export default function CreatorWorkspace() {
  if (!getSocialAccounts(getUser()).length) return <Navigate to="/creator/setup" replace />
  return (
    <main className="creator-workspace">
      <h1>Coming soon</h1>
    </main>
  )
}
