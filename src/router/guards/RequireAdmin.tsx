import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { ReactNode } from 'react'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (!user || user.role !== 'admin') return <Navigate to="/home" replace />
  return <>{children}</>
}
