import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/notifications.api'
import { Bell, Check, Trash2, Package, Award, Bot, AlertTriangle } from 'lucide-react'

interface Notification {
  _id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  new_offer: { icon: Package, color: '#4d9538', bg: '#ebf5ea' },
  badge_awarded: { icon: Award, color: '#f5c518', bg: '#fef9e7' },
  system: { icon: Bell, color: '#038543', bg: '#ebf5ea' },
  chatbot_escalation: { icon: Bot, color: '#231F20', bg: '#f5f5f5' },
  report: { icon: AlertTriangle, color: '#c41539', bg: '#fef2f2' },
}

const DEFAULT_TYPE = { icon: Bell, color: '#4d9538', bg: '#ebf5ea' }

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(1).then(r => r.data),
  })

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications: Notification[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : []

  const unread = notifications.filter(n => !n.isRead)
  const read = notifications.filter(n => n.isRead)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            {unread.length > 0 && ` · ${unread.length} non lue${unread.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-2 border border-[#4d9538] text-[#4d9538] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#ebf5ea] transition-colors"
          >
            <Check size={15} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Summary cards */}
        <div className="col-span-3 grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: notifications.length, color: '#4d9538', bg: '#ebf5ea' },
            { label: 'Non lues', value: unread.length, color: '#c41539', bg: '#fef2f2' },
            { label: 'Lues', value: read.length, color: '#231F20', bg: '#f5f5f5' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <Bell size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="font-extrabold text-2xl leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications list */}
        <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-50 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-[#ebf5ea] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell size={28} className="text-[#4d9538]" />
              </div>
              <p className="font-bold text-[#231F20]">Aucune notification</p>
              <p className="text-sm text-gray-400 mt-1">Vous n'avez pas encore reçu de notifications</p>
            </div>
          ) : (
            <>
              {/* Unread section */}
              {unread.length > 0 && (
                <>
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-bold text-[#231F20] uppercase tracking-wider">Non lues</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {unread.map(notif => {
                      const cfg = TYPE_CONFIG[notif.type] || DEFAULT_TYPE
                      const Icon = cfg.icon
                      return (
                        <div
                          key={notif._id}
                          className="flex items-start gap-4 px-5 py-4 bg-[#ebf5ea]/30 hover:bg-[#ebf5ea]/50 transition-colors"
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: cfg.bg }}
                          >
                            <Icon size={20} style={{ color: cfg.color }} />
                          </div>
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => markRead(notif._id)}
                          >
                            <p className="font-semibold text-sm text-[#231F20] leading-snug">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">
                              {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-2 h-2 bg-[#4d9538] rounded-full" />
                            <button
                              onClick={() => deleteNotif(notif._id)}
                              className="p-1.5 text-gray-300 hover:text-[#c41539] transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Read section */}
              {read.length > 0 && (
                <>
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lues</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {read.map(notif => {
                      const cfg = TYPE_CONFIG[notif.type] || DEFAULT_TYPE
                      const Icon = cfg.icon
                      return (
                        <div
                          key={notif._id}
                          className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors opacity-70"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon size={20} className="text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#231F20] leading-snug">{notif.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.body}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">
                              {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteNotif(notif._id)}
                            className="p-1.5 text-gray-300 hover:text-[#c41539] transition-colors flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
