import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
