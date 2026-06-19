export type MessageType = 'text' | 'image' | 'file' | 'system'

export interface Message {
  _id: string
  conversation: string
  sender: {
    _id: string
    fullName: string
    avatarUrl?: string
  }
  content: string
  type: MessageType
  fileUrl?: string
  readBy: string[]
  createdAt: string
}

export interface Conversation {
  _id: string
  participants: Array<{
    _id: string
    fullName: string
    username: string
    avatarUrl?: string
  }>
  offer?: {
    _id: string
    title: string
    plasticType: string
  }
  lastMessage?: Message
  lastActivityAt: string
  createdAt: string
  unreadCount?: number
}
