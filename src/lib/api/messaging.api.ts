import { api } from './axios'

export const messagingApi = {
  conversations: () => api.get('/conversations'),
  messages: (id: string, page = 1) => api.get(`/conversations/${id}/messages`, { params: { page } }),
  create: (data: { recipientId: string; offerId?: string }) => api.post('/conversations', data),
  markRead: (id: string) => api.patch(`/conversations/${id}/read`),
  send: (id: string, data: { content: string; type: string }) =>
    api.post(`/conversations/${id}/messages`, data),
}
