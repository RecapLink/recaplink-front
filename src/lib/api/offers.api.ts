import { api } from './axios'
import type { OfferFilters } from '@/types/offer.types'

export const offersApi = {
  list: (params: OfferFilters) => api.get('/offers', { params }),
  detail: (id: string) => api.get(`/offers/${id}`),
  create: (data: FormData) =>
    api.post('/offers', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.patch(`/offers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/offers/${id}`),
  report: (id: string) => api.post(`/offers/${id}/report`),
  verify: (id: string) => api.patch(`/offers/${id}/verify`),
  close: (id: string) => api.patch(`/offers/${id}/close`),
  mine: () => api.get('/users/me/offers'),
  similar: (id: string) => api.get(`/offers/${id}/similar`),
}
