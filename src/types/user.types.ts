export type Role = 'collecteur' | 'recycleur' | 'vendeur_plastique' | 'admin'
export type UserStatus = 'active' | 'pending' | 'suspended'
export type PlasticType = 'PET' | 'HDPE' | 'PP' | 'PVC' | 'Autres'

export interface User {
  _id: string
  email: string
  username: string
  fullName: string
  phone?: string
  avatarUrl?: string
  role: Role
  status: UserStatus
  zone?: string
  city?: string
  bio?: string
  plasticTypes?: PlasticType[]
  badges?: string[]
  totalKgCollected: number
  rating: number
  ratingCount: number
  lastActiveAt?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  offerCount: number
  badgeCount: number
  progression: number
}
