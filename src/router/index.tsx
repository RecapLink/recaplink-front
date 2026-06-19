import { createBrowserRouter, Navigate } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <div className="flex items-center justify-center min-h-dvh text-primary font-bold text-xl">RecapLink 🚀</div>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
