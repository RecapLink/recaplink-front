import { create } from 'zustand'
import type { Socket } from 'socket.io-client'

interface SocketStore {
  socket: Socket | null
  connected: boolean
  unreadCount: number
  setSocket: (socket: Socket) => void
  setConnected: (connected: boolean) => void
  incrementUnread: () => void
  resetUnread: () => void
  clearSocket: () => void
}

export const useSocketStore = create<SocketStore>()((set) => ({
  socket: null,
  connected: false,
  unreadCount: 0,

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
  clearSocket: () => set({ socket: null, connected: false }),
}))
