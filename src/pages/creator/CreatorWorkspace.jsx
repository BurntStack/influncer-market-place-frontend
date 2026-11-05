import { Navigate } from 'react-router-dom'
import { getUser } from '../../lib/auth.js'
import { getSocialAccounts } from '../../lib/socialAccounts.js'
import { getCreatorDemographics } from '../../lib/creatorDemographics.js'
import { getCreatorAvatar } from '../../lib/creatorAvatar.js'
import './CreatorWorkspace.css'

export default function CreatorWorkspace() {
  const user = getUser()
  const demographics = getCreatorDemographics(user)
  if (!getSocialAccounts(user).length || !demographics.age || !demographics.gender || !getCreatorAvatar(user)) return <Navigate to="/creator/setup" replace />
  return (
    <main className="creator-workspace">
      <h1>Coming soon</h1>
    </main>
  )
}
