export type BadgeCategory = 'expert' | 'pioneer' | 'administrator' | 'volume' | 'activity'
export type BadgeCriteriaType = 'kg_collected' | 'offers_completed' | 'days_active' | 'manual'

export interface Badge {
  _id: string
  name: { fr: string; ar: string; wo: string }
  description: { fr: string; ar: string; wo: string }
  iconUrl?: string
  category: BadgeCategory
  criteriaType: BadgeCriteriaType
  criteriaValue?: number
  autoAssign: boolean
  userCount?: number
  createdAt: string
}

export interface UserBadge {
  badge: Badge
  awardedAt: string
  completed: boolean
  progress?: number
}
