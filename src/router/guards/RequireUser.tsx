import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { ReactNode } from 'react'

export function RequireUser({ children }: { children: ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (user?.role === 'super_admin') return <Navigate to="/admin/overview" replace />
  return <>{children}</>
}
