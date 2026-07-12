import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return <Navigate to="/quests" replace />
  }

  return <Outlet />
}
