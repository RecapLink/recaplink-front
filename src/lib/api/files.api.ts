import { api } from './axios'

export const filesApi = {
  upload: (file: File, folder = 'recaplink') => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/files/upload?folder=${folder}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (publicId: string) => api.delete(`/files/${publicId}`),
}
