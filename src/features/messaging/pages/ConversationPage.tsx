import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingApi } from '@/lib/api/messaging.api'
import { useAuthStore } from '@/store/auth.store'
import { Avatar } from '@/components/ui/avatar'
import { Send, ChevronLeft, Search, MessageCircle } from 'lucide-react'

interface Message {
  _id: string
  content: string
  sender: { _id: string; fullName: string; avatarUrl?: string }
  createdAt: string
}

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

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: msgData } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => messagingApi.messages(id!).then(r => r.data.data),
    enabled: !!id,
    refetchInterval: 3000,
  })

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.conversations().then(r => r.data.data || []),
  })

  const conversations: Conversation[] = convData || []
  const conv = conversations.find((c: Conversation) => c._id === id)
  const other = conv?.participants?.find(p => p._id !== user?._id)
  const messages: Message[] = msgData?.data || []

  const filteredConvs = conversations.filter(c => {
    const o = c.participants?.find(p => p._id !== user?._id)
    return !search || o?.fullName?.toLowerCase().includes(search.toLowerCase())
  })

  const { mutate: sendMsg, isPending } = useMutation({
    mutationFn: (content: string) =>
      messagingApi.send(id!, { content, type: 'text' }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', id] })
      setInput('')
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => { if (input.trim()) sendMsg(input) }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/messaging')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4d9538] transition-colors"
        >
          <ChevronLeft size={16} /> Messagerie
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-[#231F20]">{other?.fullName || 'Conversation'}</span>
      </div>

      <div className="grid grid-cols-3 gap-5" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations sidebar */}
        <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredConvs.length === 0 ? (
              <div className="py-8 text-center">
                <MessageCircle size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Aucune conversation</p>
              </div>
            ) : (
              filteredConvs.map(c => {
                const o = c.participants?.find(p => p._id !== user?._id)
                const isActive = c._id === id
                return (
                  <button
                    key={c._id}
                    onClick={() => navigate(`/messaging/${c._id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                      isActive ? 'bg-[#ebf5ea]' : 'hover:bg-[#f0f9f0]'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={o?.avatarUrl} name={o?.fullName || '?'} size="sm" />
                      {c.unreadCount && c.unreadCount > 0 ? (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c41539] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isActive ? 'font-bold text-[#4d9538]' : 'font-semibold text-[#231F20]'}`}>
                        {o?.fullName}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {c.lastMessage?.content || '...'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
            <Avatar src={other?.avatarUrl} name={other?.fullName || '?'} size="sm" />
            <div>
              <p className="font-bold text-sm text-[#231F20]">{other?.fullName}</p>
              <p className="text-[10px] text-[#4d9538] font-medium">En ligne</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#f8fbf8]">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageCircle size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Aucun message · Commencez la conversation</p>
                </div>
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.sender?._id === user?._id
                return (
                  <div key={m._id} className={`flex gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <Avatar src={m.sender?.avatarUrl} name={m.sender?.fullName} size="xs" className="flex-shrink-0 mt-0.5" />
                    )}
                    <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? 'bg-[#4d9538] text-white rounded-tr-md'
                        : 'bg-white text-[#231F20] border border-gray-100 rounded-tl-md shadow-sm'
                    }`}>
                      {m.content}
                      <div className={`text-[10px] mt-1.5 ${isMine ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-3 px-4 py-3.5 border-t border-gray-100 flex-shrink-0 bg-white">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Écrivez votre message..."
              className="flex-1 h-11 bg-gray-50 rounded-xl px-4 text-sm outline-none border border-gray-200 focus:border-[#4d9538] transition-colors"
            />
            <button
              onClick={send}
              disabled={!input.trim() || isPending}
              className="w-11 h-11 bg-[#4d9538] rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#038543] transition-colors"
            >
              <Send size={17} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
