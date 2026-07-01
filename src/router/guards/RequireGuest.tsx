import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { ReactNode } from 'react'

export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
    return <Navigate to={isAdmin ? '/admin/overview' : '/home'} replace />
  }
  return <>{children}</>
}
