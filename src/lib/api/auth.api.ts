import { api } from './axios'

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: Record<string, unknown>) =>
    api.post('/auth/register', data),
  refresh: () =>
    api.post('/auth/refresh'),
  logout: () =>
    api.post('/auth/logout'),
  me: () =>
    api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
}
