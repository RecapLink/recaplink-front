import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import router from '@/router'
import { useAuthStore } from '@/store/auth.store'
import { useSocketStore } from '@/store/socket.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function SocketManager() {
  const { isAuthenticated, accessToken } = useAuthStore()
  const { setSocket, setConnected, incrementUnread, clearSocket } = useSocketStore()

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      clearSocket()
      return
    }

    const socket = io(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/chat`, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    setSocket(socket)

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('new_message', () => incrementUnread())

    return () => {
      socket.disconnect()
      clearSocket()
    }
  }, [isAuthenticated, accessToken])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketManager />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
