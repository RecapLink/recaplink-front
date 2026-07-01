import { api } from './axios'

export const adminApi = {
  // Users
  listUsers: (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),
  updateUserStatus: (id: string, status: string) => api.patch(`/admin/users/${id}/status`, { status }),

  // Offers
  listOffers: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/offers', { params }),
  verifyOffer: (id: string) => api.patch(`/offers/${id}/verify`),

  // Stats / Dashboard
  overview: () => api.get('/dashboard/stats'),
  plasticDistribution: () => api.get('/dashboard/plastic-distribution'),
  dashboardActivity: () => api.get('/dashboard/activity'),
  registrationsByMonth: () => api.get('/dashboard/monthly'),
  collectionsByZone: () => api.get('/dashboard/zones'),

  // Knowledge
  listKnowledge: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/knowledge', { params }),
  publishKnowledge: (id: string) => api.patch(`/admin/knowledge/${id}/publish`),
  deleteKnowledge: (id: string) => api.delete(`/knowledge/${id}`),

  // Badges
  listBadges: () => api.get('/badges'),
  createBadge: (data: unknown) => api.post('/badges', data),
  deleteBadge: (id: string) => api.delete(`/badges/${id}`),
  awardBadge: (userId: string, badgeId: string) => api.post('/badges/award', { userId, badgeId }),

  // Settings (profile/notifications of admin)
  getSettings: () => api.get('/auth/me'),
  updateNotifPrefs: (prefs: unknown) => api.patch('/users/me', { notifPrefs: prefs }),

  // Offers — create & upload
  createOffer: (data: Record<string, unknown>) => api.post('/offers', data),
  uploadOfferImage: (file: File, onProgress?: (pct: number) => void) => {
    const fd = new FormData()
    fd.append('images', file)
    return api.post('/offers/upload-images', fd, {
      onUploadProgress: e => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
  },
  uploadOfferVoice: (blob: Blob, filename = 'recording.webm', onProgress?: (pct: number) => void) => {
    const fd = new FormData()
    fd.append('voice', blob, filename)
    return api.post('/offers/upload-voice', fd, {
      onUploadProgress: e => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
  },

  // Support widget settings
  getSupportSettings: () => api.get('/settings/support'),
  updateSupportSettings: (data: {
    supportEnabled?: boolean
    supportTitle?: string
    supportStartHour?: string
    supportEndHour?: string
    supportPhone?: string
    supportEmail?: string
    supportIllustration?: string
    supportBubbleColor?: string
  }) => api.patch('/settings/support', data),
}
