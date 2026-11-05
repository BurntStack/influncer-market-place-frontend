import { Navigate } from 'react-router-dom'
import { getUser } from '../../lib/auth.js'
import { getSocialAccounts } from '../../lib/socialAccounts.js'
import { getCreatorDemographics } from '../../lib/creatorDemographics.js'
import { getCreatorAvatar } from '../../lib/creatorAvatar.js'
import { getCreatorSubmittedAt } from '../../lib/creatorSubmission.js'
import LogoMark from '../../components/LogoMark.jsx'
import './CreatorWorkspace.css'

export default function CreatorWorkspace() {
  const user = getUser()
  const demographics = getCreatorDemographics(user)
  const submittedAt = getCreatorSubmittedAt(user)
  if (!getSocialAccounts(user).length || !demographics.age || !demographics.gender || !getCreatorAvatar(user) || !submittedAt) return <Navigate to="/creator/setup" replace />
  return (
    <main className="creator-workspace">
      <div className="creator-workspace__card"><LogoMark /><span className="creator-workspace__eyebrow">PROFILE SUBMITTED</span><div className="creator-workspace__check" aria-hidden="true">✓</div><h1>Your profile is under review.</h1><p>Thanks for sharing your details. Our team will review your profile within 48 hours.</p><small>Submitted {new Date(submittedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</small><span className="creator-workspace__coming">Your creator workspace is coming soon.</span></div>
    </main>
  )
}
