import { api } from './axios'

export const chatbotApi = {
  sendMessage: (data: { message: string; sessionId?: string }) => api.post('/chatbot/message', data),
  sessions: (params?: Record<string, unknown>) => api.get('/chatbot/sessions', { params }),
  session: (id: string) => api.get(`/chatbot/sessions/${id}`),
  resolve: (id: string) => api.patch(`/chatbot/sessions/${id}/resolve`),
  faq: () => api.get('/chatbot/faq'),
}
