import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { chatbotApi } from '@/lib/api/chatbot.api'
import { Send, Bot, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: Date
}

const FAQ_CHIPS = [
  'Comment créer une offre ?',
  'Trouver un collecteur',
  'Types de plastiques',
  'Comment fonctionne RecapLink ?',
]

export default function ChatbotPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bonjour ${user?.fullName?.split(' ')[0] || ''} ! Je suis l'assistant RecapLink. Je peux vous aider avec vos questions sur la plateforme, les offres, et le recyclage de plastique. Comment puis-je vous aider aujourd'hui ?`,
      ts: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [escalated, setEscalated] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: (msg: string) =>
      chatbotApi.sendMessage({ message: msg, sessionId }).then(r => r.data.data),
    onSuccess: res => {
      setSessionId(res.sessionId)
      if (res.escalated) setEscalated(true)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.reply, ts: new Date() },
      ])
    },
  })

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: text, ts: new Date() }])
    setInput('')
    mutate(text)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Assistant RecapLink</h1>
          <p className="text-sm text-gray-500 mt-0.5">Posez vos questions sur la plateforme et le recyclage</p>
        </div>
        <div className="flex items-center gap-2 bg-[#ebf5ea] text-[#4d9538] text-xs font-semibold px-3 py-1.5 rounded-full">
          <Sparkles size={13} />
          IA activée
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Sidebar — FAQ chips */}
        <div className="col-span-1 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-12 h-12 bg-[#ebf5ea] rounded-xl flex items-center justify-center mb-4">
              <Bot size={24} className="text-[#4d9538]" />
            </div>
            <p className="font-bold text-sm text-[#231F20]">Questions fréquentes</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Cliquez pour poser une question rapidement</p>
            <div className="space-y-2">
              {FAQ_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="w-full text-left text-xs font-medium px-3 py-2.5 bg-[#f0f9f0] text-[#231F20] rounded-xl hover:bg-[#ebf5ea] hover:text-[#4d9538] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {escalated && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
              <p className="font-bold mb-1">Transmission en cours</p>
              <p>Votre message a été transmis à notre équipe. Réponse sous 24h.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-bold text-xs text-[#231F20] mb-2">À propos</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Notre assistant utilise l'IA pour répondre à vos questions sur RecapLink, le recyclage plastique, et la gestion des offres.
            </p>
          </div>
        </div>

        {/* Chat panel */}
        <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
            <div className="w-9 h-9 bg-[#4d9538] rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#231F20]">Assistant RecapLink</p>
              <p className="text-[10px] text-[#4d9538] font-medium">En ligne · Répond instantanément</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#f8fbf8]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 bg-[#4d9538] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#4d9538] text-white rounded-tr-md'
                      : 'bg-white text-[#231F20] border border-gray-100 shadow-sm rounded-tl-md'
                  }`}
                >
                  {m.content}
                  <div className={`text-[10px] mt-2 ${m.role === 'user' ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                    {m.ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isPending && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-[#4d9538] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-md flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-3 px-4 py-3.5 border-t border-gray-100 flex-shrink-0 bg-white">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Posez votre question..."
              className="flex-1 h-11 bg-gray-50 rounded-xl px-4 text-sm outline-none border border-gray-200 focus:border-[#4d9538] transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isPending}
              className="w-11 h-11 bg-[#4d9538] rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#038543] transition-colors flex-shrink-0"
            >
              <Send size={17} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
