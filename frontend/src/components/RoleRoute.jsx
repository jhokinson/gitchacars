import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRoute({ role, children }) {
  const { isAuthenticated, isRole, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/auth?mode=login" replace />
  if (!isRole(role)) return <Navigate to="/" replace />
  return children
}
