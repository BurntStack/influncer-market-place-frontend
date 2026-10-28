import { Navigate, useLocation } from 'react-router-dom'
import { isAuthed } from '../lib/auth.js'

// Gate a route behind login. Sends unauthenticated users to /login and
// remembers where they were headed so we can return them after they sign in.
export default function RequireAuth({ children }) {
  const location = useLocation()
  if (!isAuthed()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}
