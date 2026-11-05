import { Navigate, useLocation } from 'react-router-dom'
import { getUser, isAuthed } from '../lib/auth.js'

// Gate a route behind login. Sends unauthenticated users to /login and
// remembers where they were headed so we can return them after they sign in.
export default function RequireAuth({ children, role }) {
  const location = useLocation()
  if (!isAuthed()) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search + location.hash }} replace />
  }
  if (role && getUser()?.role !== role) {
    return <Navigate to={getUser()?.role ? (getUser().role === 'creator' ? '/creator/workspace' : '/dashboard') : '/choose-role'} replace />
  }
  return children
}
