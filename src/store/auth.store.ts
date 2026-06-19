import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user.types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ accessToken: token }),
      setAuth: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'rl-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
)
