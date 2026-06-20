import { api } from './axios'

export const notificationsApi = {
  list: (page = 1) => api.get('/notifications', { params: { page } }),
  count: () => api.get('/notifications/count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}
