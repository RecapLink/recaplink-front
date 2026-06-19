export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

export type Language = 'fr' | 'ar' | 'wo'
export type Direction = 'ltr' | 'rtl'

export interface NotifPrefs {
  newSignalement: boolean
  newInscriptions: boolean
  chatbotEscalade: boolean
  rapportsHebdo: boolean
  alertePerformance: boolean
}

export interface Notification {
  _id: string
  type: 'new_offer' | 'new_member' | 'badge_awarded' | 'report' | 'system' | 'chatbot_escalation'
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}
