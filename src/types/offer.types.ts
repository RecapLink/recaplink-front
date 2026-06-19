import type { PlasticType } from './user.types'

export type OfferStatus = 'active' | 'pending' | 'closed' | 'verified' | 'reported'

export interface OfferLocation {
  city: string
  zone: string
  coordinates?: [number, number]
}

export interface Offer {
  _id: string
  refCode: string
  title: string
  description?: string
  plasticType: PlasticType
  quantityKg?: number
  quantityPiece?: number
  pricePerKg?: number
  isFree: boolean
  location: OfferLocation
  images: string[]
  status: OfferStatus
  availability?: string
  owner: {
    _id: string
    fullName: string
    username: string
    avatarUrl?: string
    rating: number
  }
  viewCount: number
  messageCount: number
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface OfferFilters {
  plasticType?: PlasticType | 'all'
  zone?: string
  status?: OfferStatus
  search?: string
  page?: number
  limit?: number
}
