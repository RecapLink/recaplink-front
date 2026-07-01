import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'
import AdminLayout from '@/layouts/AdminLayout'
import { RequireAuth } from './guards/RequireAuth'
import { RequireAdmin } from './guards/RequireAdmin'
import { RequireGuest } from './guards/RequireGuest'
import { RequireUser } from './guards/RequireUser'

function L(importFn: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(importFn)
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-dvh"><span className="w-8 h-8 border-4 border-[#4d9538] border-t-transparent rounded-full animate-spin" /></div>}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  // Auth
  {
    element: <RequireGuest><AuthLayout /></RequireGuest>,
    children: [
      { path: '/', element: <Navigate to="/login" replace /> },
      { path: '/login', element: L(() => import('@/features/auth/pages/LoginPage')) },
      { path: '/verify', element: L(() => import('@/features/auth/pages/VerifyPage')) },
      { path: '/role', element: L(() => import('@/features/auth/pages/RolePage')) },
      { path: '/welcome', element: L(() => import('@/features/auth/pages/WelcomePage')) },
      { path: '/forgot-password', element: L(() => import('@/features/auth/pages/ForgotPasswordPage')) },
      { path: '/forgot-password/sent', element: L(() => import('@/features/auth/pages/ForgotPasswordSentPage')) },
      { path: '/reset-password/:token', element: L(() => import('@/features/auth/pages/ResetPasswordPage')) },
      { path: '/reset-password/success', element: L(() => import('@/features/auth/pages/ResetPasswordSuccessPage')) },
    ],
  },
  // App
  {
    element: <RequireAuth><RequireUser><AppLayout /></RequireUser></RequireAuth>,
    children: [
      { path: '/home', element: L(() => import('@/features/home/pages/HomePage')) },
      { path: '/offers', element: L(() => import('@/features/offers/pages/OffersPage')) },
      { path: '/offers/new', element: L(() => import('@/features/offers/pages/NewOfferPage')) },
      { path: '/offers/mine', element: L(() => import('@/features/offers/pages/MyOffersPage')) },
      { path: '/offers/:id', element: L(() => import('@/features/offers/pages/OfferDetailPage')) },
      { path: '/knowledge', element: L(() => import('@/features/knowledge/pages/KnowledgePage')) },
      { path: '/knowledge/:slug', element: L(() => import('@/features/knowledge/pages/KnowledgeDetailPage')) },
      { path: '/chatbot', element: L(() => import('@/features/chatbot/pages/ChatbotPage')) },
      { path: '/messaging', element: L(() => import('@/features/messaging/pages/MessagingPage')) },
      { path: '/messaging/:id', element: L(() => import('@/features/messaging/pages/ConversationPage')) },
      { path: '/profile', element: L(() => import('@/features/profile/pages/ProfilePage')) },
      { path: '/profile/edit', element: L(() => import('@/features/profile/pages/EditProfilePage')) },
      { path: '/profile/badges', element: L(() => import('@/features/profile/pages/BadgesPage')) },
      { path: '/notifications', element: L(() => import('@/features/notifications/pages/NotificationsPage')) },
      { path: '/settings', element: L(() => import('@/features/settings/pages/SettingsPage')) },
    ],
  },
  // Admin
  {
    path: '/admin',
    element: <RequireAuth><RequireAdmin><AdminLayout /></RequireAdmin></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/admin/overview" replace /> },
      { path: 'overview', element: L(() => import('@/features/admin/pages/AdminOverviewPage')) },
      { path: 'collectors', element: L(() => import('@/features/admin/pages/AdminCollectorsPage')) },
      { path: 'recyclers', element: L(() => import('@/features/admin/pages/AdminRecyclersPage')) },
      { path: 'offers', element: L(() => import('@/features/admin/pages/AdminOffersPage')) },
      { path: 'knowledge', element: L(() => import('@/features/admin/pages/AdminKnowledgePage')) },
      { path: 'badges', element: L(() => import('@/features/admin/pages/AdminBadgesPage')) },
      { path: 'settings', element: L(() => import('@/features/admin/pages/AdminSettingsPage')) },
      { path: 'profile', element: L(() => import('@/features/admin/pages/AdminProfilePage')) },
    ],
  },
  // Fallback
  { path: '/404', element: <div className="flex items-center justify-center min-h-dvh text-[#4d9538] text-xl font-bold">404 — Page introuvable</div> },
  { path: '*', element: <Navigate to="/404" replace /> },
])

export default router
