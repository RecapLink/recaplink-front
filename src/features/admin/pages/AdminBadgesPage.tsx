import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'
import { Award, Plus, TrendingUp, Droplet, Recycle, Trophy } from 'lucide-react'

const BADGE_ICONS = [TrendingUp, Droplet, Recycle, Trophy, Award]
const BADGE_ICON_COLORS = ['#231F20', '#231F20', '#231F20', '#231F20', '#4d9538']

interface Badge {
  _id: string
  name: string | { fr?: string }
  description?: string | { fr?: string }
  iconUrl?: string
  category?: string
  userCount?: number
  threshold?: number
}

function getLabel(val: string | { fr?: string } | undefined): string {
  if (!val) return '—'
  if (typeof val === 'string') return val
  return val.fr || '—'
}

export default function AdminBadgesPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'badges'],
    queryFn: () => adminApi.listBadges().then(r => (r.data.data || []) as Badge[]),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => adminApi.deleteBadge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'badges'] }),
  })

  const badges = data || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Gestion des Badges</h1>
          <p className="text-sm text-gray-500 mt-0.5">Attribuer et gérer les badges des utilisateurs</p>
        </div>
        <button className="flex items-center gap-2 bg-[#4d9538] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#038543] transition-colors">
          <Plus size={15} />
          Créer badge
        </button>
      </div>

      {/* Badge cards */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4" />
              <div className="h-4 bg-gray-100 rounded mx-auto w-3/4 mb-2" />
              <div className="h-3 bg-gray-50 rounded mx-auto w-full" />
            </div>
          ))}
        </div>
      ) : badges.length === 0 ? (
        /* Static Figma-matching fallback */
        <BadgeGrid onAward={() => {}} onEdit={() => {}} onDelete={() => {}} static />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {badges.map((badge, i) => {
            const Icon = BADGE_ICONS[i % BADGE_ICONS.length]
            const iconColor = BADGE_ICON_COLORS[i % BADGE_ICON_COLORS.length]
            return (
              <div key={badge._id} className="bg-white rounded-2xl p-5 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#fef9e7' }}>
                  {badge.iconUrl ? (
                    <img src={badge.iconUrl} className="w-8 h-8 object-contain" alt="" />
                  ) : (
                    <Icon size={28} style={{ color: iconColor }} />
                  )}
                </div>

                <p className="font-bold text-sm text-[#231F20] leading-snug">{getLabel(badge.name)}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">{getLabel(badge.description)}</p>

                {/* User count */}
                <button className="mt-3 text-sm font-bold text-[#4d9538] hover:underline">
                  {badge.userCount || 0} Utilisateurs
                </button>

                {/* Actions */}
                <div className="flex gap-2 mt-3 w-full">
                  <button
                    onClick={() => remove(badge._id)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-500 border border-gray-200 hover:border-red-300 hover:text-[#c41539] transition-colors flex items-center justify-center gap-1"
                  >
                    ✏ Editer
                  </button>
                  <button
                    onClick={() => adminApi.awardBadge('', badge._id).catch(() => {})}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#4d9538] text-white hover:bg-[#038543] transition-colors"
                  >
                    Attribuer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BadgeGrid(_props: { onAward: (id: string) => void; onEdit: (id: string) => void; onDelete: (id: string) => void; static?: boolean }) {
  const STATIC_BADGES = [
    { id: '1', icon: TrendingUp, name: 'Premier Pas', desc: 'Première collecte ou offre réalisée sur la plateforme', users: 342 },
    { id: '2', icon: Droplet, name: 'Collecteur Bronze', desc: '100 kg de plastique collectés au total', users: 218 },
    { id: '3', icon: Recycle, name: 'Collecteur Argent', desc: '500 kg de plastique collectés au total', users: 97 },
    { id: '4', icon: Trophy, name: 'Collecteur Or', desc: '1000 kg de plastique collectés au total', users: 43 },
  ]
  return (
    <div className="grid grid-cols-4 gap-4">
      {STATIC_BADGES.map(b => {
        const Icon = b.icon
        return (
          <div key={b.id} className="bg-white rounded-2xl p-5 flex flex-col items-center text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#fef9e7' }}>
              <Icon size={28} className="text-[#231F20]" />
            </div>
            <p className="font-bold text-sm text-[#231F20]">{b.name}</p>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">{b.desc}</p>
            <button className="mt-3 text-sm font-bold text-[#4d9538] hover:underline">{b.users} Utilisateurs</button>
            <div className="flex gap-2 mt-3 w-full">
              {b.users > 100 ? (
                <>
                  <button className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors">
                    ✏ Editer
                  </button>
                  <button className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#4d9538] text-white hover:bg-[#038543] transition-colors">
                    Attribuer
                  </button>
                </>
              ) : (
                <button className="w-full py-2 rounded-xl text-xs font-semibold bg-[#4d9538] text-white hover:bg-[#038543] transition-colors">
                  Attribuer
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
