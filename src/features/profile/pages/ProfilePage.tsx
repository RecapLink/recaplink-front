import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { offersApi } from '@/lib/api/offers.api'
import { badgesApi } from '@/lib/api/badges.api'
import { Star, Package, Award, Pencil, LogOut, MapPin, TrendingUp, Droplet, Recycle, Trophy } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  collecteur: 'Collecteur',
  recycleur: 'Recycleur',
  vendeur: 'Vendeur de plastique',
  admin: 'Administrateur',
}

const ROLE_COLORS: Record<string, string> = {
  collecteur: '#4d9538',
  recycleur: '#038543',
  vendeur: '#231F20',
  admin: '#c41539',
}

const BADGE_ICONS = [TrendingUp, Droplet, Recycle, Trophy, Award]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const earnedIds = new Set(user?.badges ?? [])

  const { data: offersData } = useQuery({
    queryKey: ['offers', 'mine'],
    queryFn: () => offersApi.mine().then(r => r.data.data || []),
  })

  const { data: badgesData } = useQuery({
    queryKey: ['badges'],
    queryFn: () => badgesApi.list().then(r => r.data.data ?? r.data ?? []),
  })

  const myOffers = offersData || []
  const allBadges = badgesData || []
  const myBadges = allBadges.filter((b: { _id: string }) => earnedIds.has(b._id))

  const initials = user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Mon profil</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user?.fullName} · {ROLE_LABELS[user?.role || ''] || user?.role}</p>
        </div>
        <button
          onClick={() => navigate('/profile/edit')}
          className="flex items-center gap-2 border border-[#4d9538] text-[#4d9538] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#ebf5ea] transition-colors"
        >
          <Pencil size={14} /> Modifier le profil
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left — profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: ROLE_COLORS[user?.role || ''] || '#4d9538' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-white font-black text-3xl">{initials}</span>
              )}
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#4d9538] rounded-full flex items-center justify-center border-2 border-white"
            >
              <Pencil size={11} className="text-white" />
            </button>
          </div>

          <div>
            <p className="font-bold text-base text-[#231F20]">{user?.fullName}</p>
            <p className="text-xs text-gray-400">@{user?.username}</p>
            {user?.city && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <MapPin size={11} className="text-gray-400" />
                <span className="text-xs text-gray-400">{user.city}</span>
              </div>
            )}
          </div>

          {/* Role badge */}
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: ROLE_COLORS[user?.role || ''] || '#4d9538' }}
          >
            {ROLE_LABELS[user?.role || ''] || user?.role}
          </span>

          {/* Stats grid */}
          <div className="w-full grid grid-cols-2 gap-2">
            {[
              { label: 'kg collectés', value: user?.totalKgCollected ?? 0, icon: TrendingUp },
              { label: 'Note', value: user?.rating ? `${user.rating.toFixed(1)} ★` : '—', icon: Star },
              { label: 'Offres', value: myOffers.length, icon: Package },
              { label: 'Badges', value: myBadges.length, icon: Award },
            ].map(s => (
              <div key={s.label} className="bg-[#f0f9f0] rounded-xl p-3 text-center">
                <p className="font-extrabold text-[#4d9538] text-base leading-none">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {user?.bio && (
            <p className="text-xs text-gray-500 italic text-center leading-relaxed">"{user.bio}"</p>
          )}

          {/* Actions */}
          <div className="w-full space-y-2 pt-1 border-t border-gray-100">
            <button
              onClick={() => { logout(); navigate('/login', { replace: true }) }}
              className="w-full text-sm font-semibold text-[#c41539] py-2 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>

        {/* Right — details */}
        <div className="col-span-2 space-y-4">
          {/* Recent offers */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#231F20]">Mes offres récentes</h2>
              <button
                onClick={() => navigate('/offers/mine')}
                className="text-xs text-[#4d9538] font-semibold hover:underline"
              >
                Tout voir
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {myOffers.slice(0, 5).length === 0 ? (
                <div className="py-8 text-center">
                  <Package size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucune offre publiée</p>
                  <button
                    onClick={() => navigate('/offers/new')}
                    className="mt-3 text-xs text-[#4d9538] font-semibold hover:underline"
                  >
                    Publier une offre
                  </button>
                </div>
              ) : (
                myOffers.slice(0, 5).map((offer: { _id: string; title: string; plasticType: string; status: string; quantity?: number }) => (
                  <button
                    key={offer._id}
                    onClick={() => navigate(`/offers/${offer._id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-[#f0f9f0] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-[#4d9538]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#231F20] truncate">{offer.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold bg-[#ebf5ea] text-[#4d9538] px-1.5 py-0.5 rounded">{offer.plasticType}</span>
                        {offer.quantity && <span className="text-[11px] text-gray-400">{offer.quantity} kg</span>}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      offer.status === 'active' ? 'bg-[#ebf5ea] text-[#4d9538]'
                        : offer.status === 'pending' ? 'bg-amber-50 text-amber-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {offer.status === 'active' ? 'Active' : offer.status === 'pending' ? 'En attente' : offer.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#231F20]">Mes badges</h2>
              <button
                onClick={() => navigate('/profile/badges')}
                className="text-xs text-[#4d9538] font-semibold hover:underline"
              >
                Tout voir
              </button>
            </div>
            <div className="p-5">
              {myBadges.length === 0 ? (
                <div className="text-center py-4">
                  <Award size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucun badge obtenu pour le moment</p>
                  <p className="text-xs text-gray-300 mt-1">Collectez du plastique pour débloquer des badges</p>
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {myBadges.slice(0, 6).map((badge: { _id: string; name: { fr?: string } | string; iconUrl?: string }, i: number) => {
                    const BIcon = BADGE_ICONS[i % BADGE_ICONS.length]
                    const name = typeof badge.name === 'string' ? badge.name : badge.name?.fr || ''
                    return (
                      <div key={badge._id} className="flex flex-col items-center gap-1.5 text-center">
                        <div className="w-14 h-14 bg-[#fef9e7] rounded-full flex items-center justify-center">
                          {badge.iconUrl
                            ? <img src={badge.iconUrl} className="w-8 h-8 object-contain" alt="" />
                            : <BIcon size={24} className="text-[#231F20]" />
                          }
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 max-w-[60px] leading-tight text-center">{name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
