import { useQuery } from '@tanstack/react-query'
import { badgesApi } from '@/lib/api/badges.api'
import { useAuthStore } from '@/store/auth.store'
import { Award, TrendingUp, Droplet, Recycle, Trophy, Lock } from 'lucide-react'

const BADGE_ICONS = [TrendingUp, Droplet, Recycle, Trophy, Award]
const BADGE_COLORS = ['#231F20', '#231F20', '#231F20', '#231F20', '#4d9538']

interface Badge {
  _id: string
  name: { fr?: string } | string
  description: { fr?: string } | string
  iconUrl?: string
  threshold?: number
  userCount?: number
}

function badgeLabel(val: Badge['name']): string {
  if (typeof val === 'string') return val
  return val?.fr ?? ''
}

export default function BadgesPage() {
  const { user } = useAuthStore()
  const earnedIds = new Set(user?.badges ?? [])

  const { data, isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => badgesApi.list().then(r => (r.data.data ?? r.data) as Badge[]),
  })

  const badges = data || []
  const earned = badges.filter(b => earnedIds.has(b._id))
  const locked = badges.filter(b => !earnedIds.has(b._id))

  const kgCollected = user?.totalKgCollected || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#231F20]">Mes badges</h1>
        <p className="text-sm text-gray-500 mt-0.5">Votre progression et vos récompenses</p>
      </div>

      {/* Progress banner */}
      <div className="bg-[#4d9538] rounded-2xl p-5 flex items-center gap-5 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-black/10 rounded-full" />
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
          <Award size={32} className="text-white" />
        </div>
        <div className="relative z-10 flex-1">
          <p className="font-bold text-lg">{earned.length} badge{earned.length !== 1 ? 's' : ''} obtenu{earned.length !== 1 ? 's' : ''}</p>
          <p className="text-white/80 text-sm mt-0.5">sur {badges.length} badges disponibles</p>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${badges.length > 0 ? (earned.length / badges.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="relative z-10 text-right flex-shrink-0">
          <p className="font-extrabold text-2xl leading-none">{kgCollected.toLocaleString()}</p>
          <p className="text-white/70 text-sm">kg collectés</p>
        </div>
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div>
          <h2 className="font-bold text-[#231F20] mb-3">Badges obtenus</h2>
          <div className="grid grid-cols-4 gap-4">
            {earned.map((badge, i) => {
              const Icon = BADGE_ICONS[i % BADGE_ICONS.length]
              const color = BADGE_COLORS[i % BADGE_COLORS.length]
              return (
                <div key={badge._id} className="bg-white rounded-2xl border border-[#4d9538]/20 p-5 flex flex-col items-center text-center shadow-sm">
                  <div className="w-16 h-16 bg-[#fef9e7] rounded-full flex items-center justify-center mb-3 ring-2 ring-[#f5c518]">
                    {badge.iconUrl
                      ? <img src={badge.iconUrl} className="w-8 h-8 object-contain" alt="" />
                      : <Icon size={28} style={{ color }} />
                    }
                  </div>
                  <p className="font-bold text-sm text-[#231F20] leading-snug">{badgeLabel(badge.name)}</p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">{badgeLabel(badge.description)}</p>
                  <span className="mt-3 text-[10px] font-bold bg-[#4d9538] text-white px-2.5 py-0.5 rounded-full">
                    ✓ Obtenu
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3" />
              <div className="h-4 bg-gray-100 rounded mx-auto w-3/4 mb-2" />
              <div className="h-3 bg-gray-50 rounded mx-auto w-full" />
            </div>
          ))}
        </div>
      ) : locked.length > 0 ? (
        <div>
          <h2 className="font-bold text-[#231F20] mb-3">Badges à débloquer</h2>
          <div className="grid grid-cols-4 gap-4">
            {locked.map((badge, i) => {
              const Icon = BADGE_ICONS[(earned.length + i) % BADGE_ICONS.length]
              const progress = badge.threshold ? Math.min(100, (kgCollected / badge.threshold) * 100) : 0
              return (
                <div key={badge._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center text-center opacity-70">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 relative">
                    {badge.iconUrl
                      ? <img src={badge.iconUrl} className="w-8 h-8 object-contain grayscale" alt="" />
                      : <Icon size={28} className="text-gray-400" />
                    }
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Lock size={11} className="text-gray-500" />
                    </div>
                  </div>
                  <p className="font-bold text-sm text-[#231F20] leading-snug">{badgeLabel(badge.name)}</p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">{badgeLabel(badge.description)}</p>
                  {badge.threshold && (
                    <div className="mt-3 w-full">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4d9538] rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {kgCollected} / {badge.threshold} kg
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {badges.length === 0 && !isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Award size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-[#231F20]">Aucun badge disponible</p>
          <p className="text-sm text-gray-400 mt-1">Les badges seront bientôt disponibles</p>
        </div>
      )}
    </div>
  )
}
