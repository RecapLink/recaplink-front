import { api } from './axios'

export const badgesApi = {
  list: () => api.get('/badges'),
  myBadges: () => api.get('/badges/user/me'),
  userBadges: (id: string) => api.get(`/badges/user/${id}`),
  assign: (badgeId: string, userId: string) => api.post(`/badges/${badgeId}/assign`, { userId }),
  create: (data: unknown) => api.post('/badges', data),
  update: (id: string, data: unknown) => api.patch(`/badges/${id}`, data),
  delete: (id: string) => api.delete(`/badges/${id}`),
}
