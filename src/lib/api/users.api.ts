import { api } from './axios'

export const usersApi = {
  list: (params?: Record<string, unknown>) => api.get('/users', { params }),
  detail: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: FormData) =>
    api.patch(`/users/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/users/${id}`),
  setStatus: (id: string, status: string) =>
    api.patch(`/users/${id}/status`, { status }),
  stats: (id: string) => api.get(`/users/${id}/stats`),
  badges: (id: string) => api.get(`/users/${id}/badges`),
  offers: (id: string) => api.get(`/users/${id}/offers`),
}
