import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { ReactNode } from 'react'

export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/overview' : '/home'} replace />
  }
  return <>{children}</>
}
