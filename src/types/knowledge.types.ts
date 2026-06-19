export type KnowledgeStatus = 'draft' | 'published' | 'archived'
export type KnowledgeType = 'article' | 'video' | 'tutorial'

export interface KnowledgeItem {
  _id: string
  slug: string
  title: { fr: string; ar: string; wo: string }
  content: { fr: string; ar: string; wo: string }
  type: KnowledgeType
  category: string
  tags: string[]
  coverImageUrl?: string
  coverColor?: string
  author: {
    _id: string
    fullName: string
    avatarUrl?: string
  }
  status: KnowledgeStatus
  viewCount: number
  likeCount: number
  stepCount?: number
  videoDuration?: string
  createdAt: string
  updatedAt: string
}

export interface KnowledgeFilters {
  type?: KnowledgeType | 'all'
  category?: string
  search?: string
  page?: number
  limit?: number
}
