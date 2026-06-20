import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { messagingApi } from '@/lib/api/messaging.api'
import { Avatar } from '@/components/ui/avatar'
import { MessageCircle, Search } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useState } from 'react'

interface Participant {
  _id: string
  fullName: string
  avatarUrl?: string
}

interface Conversation {
  _id: string
  participants: Participant[]
  lastMessage?: { content: string }
  lastActivityAt?: string
  unreadCount?: number
}

export default function MessagingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.conversations().then(r => r.data.data || []),
  })

  const conversations: Conversation[] = data || []
  const filtered = conversations.filter(conv => {
    const other = conv.participants?.find(p => p._id !== user?._id)
    return !search || other?.fullName?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Messagerie</h1>
          <p className="text-sm text-gray-500 mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Conversations list */}
        <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full h-9 pl-8 pr-4 bg-gray-50 rounded-lg text-sm outline-none border border-gray-100 focus:border-[#4d9538] transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[calc(100vh-280px)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-50 rounded w-full" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-[#ebf5ea] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={22} className="text-[#4d9538]" />
                </div>
                <p className="text-sm font-semibold text-[#231F20]">Aucune conversation</p>
                <p className="text-xs text-gray-400 mt-1">Contactez un vendeur depuis une offre</p>
              </div>
            ) : (
              filtered.map(conv => {
                const other = conv.participants?.find(p => p._id !== user?._id)
                const lastMsg = conv.lastMessage
                return (
                  <button
                    key={conv._id}
                    onClick={() => navigate(`/messaging/${conv._id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#f0f9f0] transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={other?.avatarUrl} name={other?.fullName || '?'} size="sm" />
                      {conv.unreadCount && conv.unreadCount > 0 ? (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c41539] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#231F20] truncate">{other?.fullName}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {lastMsg?.content || 'Commencer la conversation...'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-[10px] text-gray-400">
                        {conv.lastActivityAt
                          ? new Date(conv.lastActivityAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                          : ''}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Empty state / select conversation */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#ebf5ea] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={36} className="text-[#4d9538]" />
            </div>
            <p className="font-bold text-[#231F20]">Sélectionnez une conversation</p>
            <p className="text-sm text-gray-400 mt-1">Choisissez une conversation à gauche pour commencer</p>
          </div>
        </div>
      </div>
    </div>
  )
}
