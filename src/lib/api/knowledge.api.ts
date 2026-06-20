import { api } from './axios'

export const knowledgeApi = {
  list: (params?: Record<string, unknown>) => api.get('/knowledge', { params }),
  detail: (slug: string) => api.get(`/knowledge/${slug}`),
  like: (slug: string) => api.post(`/knowledge/${slug}/like`),
  create: (data: unknown) => api.post('/knowledge', data),
  update: (slug: string, data: unknown) => api.patch(`/knowledge/${slug}`, data),
  delete: (slug: string) => api.delete(`/knowledge/${slug}`),
  publish: (slug: string) => api.patch(`/knowledge/${slug}/publish`),
  archive: (slug: string) => api.patch(`/knowledge/${slug}/archive`),
}
