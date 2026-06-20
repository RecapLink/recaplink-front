import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Plus, Package, Recycle, Bot, BookOpen, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { offersApi } from '@/lib/api/offers.api'
import { Avatar } from '@/components/ui/avatar'
import type { Offer } from '@/types/offer.types'

const PLASTIC_TYPES = ['PET', 'HDPE', 'PP', 'PVC', 'Autres'] as const

const ROLE_LABEL: Record<string, string> = {
  collecteur: 'Collecteur',
  recycleur: 'Recycleur',
  vendeur: 'Vendeur de plastique',
  admin: 'Administrateur',
}

const QUICK_ACTIONS = [
  { icon: Plus, label: 'Publier une offre', desc: 'Proposez votre plastique', to: '/offers/new', bg: '#4d9538', color: 'white' },
  { icon: Package, label: 'Voir les offres', desc: 'Parcourez le marché', to: '/offers', bg: '#ebf5ea', color: '#4d9538' },
  { icon: Bot, label: 'Assistant IA', desc: 'Posez vos questions', to: '/chatbot', bg: '#ebf5ea', color: '#4d9538' },
  { icon: BookOpen, label: 'Savoir-faire', desc: 'Articles et tutoriels', to: '/knowledge', bg: '#ebf5ea', color: '#4d9538' },
]

function OfferCard({ offer }: { offer: Offer }) {
  const navigate = useNavigate()
  const PLASTIC_COLORS: Record<string, string> = {
    PET: '#4d9538', HDPE: '#c41539', PP: '#231F20', PVC: '#c41539', Autres: '#9ca3af',
  }
  return (
    <button
      onClick={() => navigate(`/offers/${offer._id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow text-left w-full"
    >
      <div className="h-28 bg-[#f0f9f0] relative flex items-center justify-center">
        {offer.images?.[0] ? (
          <img src={offer.images[0]} alt={offer.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-12 h-12 bg-[#ebf5ea] rounded-full flex items-center justify-center">
            <Package size={22} className="text-[#4d9538]" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: PLASTIC_COLORS[offer.plasticType] || '#4d9538' }}
          >
            {offer.plasticType}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <Avatar src={offer.owner?.avatarUrl} name={offer.owner?.fullName || '?'} size="xs" className="border border-white shadow-sm" />
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-[#231F20] truncate">{offer.title}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPin size={11} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] text-gray-500 truncate">{offer.location?.city}, {offer.location?.zone}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Clock size={11} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] text-gray-500">
            {new Date(offer.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        {offer.quantityKg && (
          <p className="mt-2 text-sm font-bold text-[#4d9538]">{offer.quantityKg.toLocaleString()} kg</p>
        )}
      </div>
    </button>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [plasticFilter, setPlasticFilter] = useState<string>('Tous')
  const [locationInput, setLocationInput] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['offers', plasticFilter, 'home'],
    queryFn: () =>
      offersApi
        .list({ plasticType: plasticFilter !== 'Tous' ? plasticFilter as typeof PLASTIC_TYPES[number] : undefined, limit: 8 })
        .then(r => r.data.data),
  })

  const offers: Offer[] = data?.data || []

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-5">
        <Avatar src={user?.avatarUrl} name={user?.fullName || '?'} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-[#231F20] font-bold text-lg">
            Bonjour, {user?.fullName?.split(' ')[0]} 👋
          </p>
          <p className="text-gray-500 text-sm mt-0.5">
            {ROLE_LABEL[user?.role || ''] || 'Bienvenue'} · RecapLink
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-center">
          {[
            { label: 'Offres actives', value: '247' },
            { label: 'Collecteurs', value: '84' },
            { label: 'kg recyclés', value: '12 480' },
          ].map(s => (
            <div key={s.label} className="bg-[#f0f9f0] rounded-xl px-4 py-2.5">
              <p className="font-extrabold text-[#4d9538] text-lg leading-none">{s.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search + quick actions */}
      <div className="grid grid-cols-3 gap-5">
        {/* Search panel */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-bold text-[#231F20]">Trouver un collecteur ou recycleur</h2>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/offers?role=collecteur')}
              className="flex-1 h-10 bg-[#4d9538] text-white rounded-xl text-sm font-semibold hover:bg-[#038543] transition-colors flex items-center justify-center gap-2"
            >
              <Recycle size={15} /> Collecteur
            </button>
            <button
              onClick={() => navigate('/offers?role=recycleur')}
              className="flex-1 h-10 bg-[#ebf5ea] text-[#4d9538] rounded-xl text-sm font-semibold hover:bg-[#d4edcc] transition-colors flex items-center justify-center gap-2"
            >
              <Package size={15} /> Recycleur
            </button>
          </div>

          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4d9538]" />
            <input
              value={locationInput}
              onChange={e => setLocationInput(e.target.value)}
              placeholder="Entrez votre ville ou adresse..."
              className="w-full h-11 pl-10 pr-4 border-2 border-gray-200 rounded-xl text-sm text-[#231F20] outline-none focus:border-[#4d9538] transition-colors"
            />
          </div>

          <button
            className="w-full h-11 bg-[#4d9538] text-white font-semibold rounded-xl hover:bg-[#038543] transition-colors text-sm flex items-center justify-center gap-2"
            onClick={() => navigate('/offers')}
          >
            <MapPin size={15} /> Utiliser ma position actuelle
          </button>

          <button
            className="w-full h-11 border-2 border-[#4d9538] text-[#4d9538] font-semibold rounded-xl hover:bg-[#ebf5ea] transition-colors text-sm"
            onClick={() => navigate('/offers')}
          >
            Rechercher
          </button>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.to}
              onClick={() => navigate(a.to)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 hover:shadow-md transition-shadow text-left"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: a.bg }}
              >
                <a.icon size={18} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#231F20]">{a.label}</p>
                <p className="text-[11px] text-gray-400">{a.desc}</p>
              </div>
              <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Offers section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#231F20]">Offres récentes</h2>
            <p className="text-xs text-gray-400 mt-0.5">Plastiques disponibles sur la plateforme</p>
          </div>
          <button
            onClick={() => navigate('/offers')}
            className="flex items-center gap-1.5 text-sm text-[#4d9538] font-semibold hover:underline"
          >
            Tout voir <ArrowRight size={14} />
          </button>
        </div>

        {/* Plastic type filter chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['Tous', ...PLASTIC_TYPES].map(p => (
            <button
              key={p}
              onClick={() => setPlasticFilter(p)}
              className={`px-3 h-8 rounded-full text-xs font-semibold transition-colors border ${
                plasticFilter === p
                  ? 'bg-[#4d9538] text-white border-[#4d9538]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#4d9538] hover:text-[#4d9538]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-28 bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-[#ebf5ea] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-[#4d9538]" />
            </div>
            <p className="font-bold text-[#231F20]">Aucune offre disponible</p>
            <p className="text-sm text-gray-400 mt-1">Soyez le premier à publier une offre</p>
            <button
              onClick={() => navigate('/offers/new')}
              className="mt-4 bg-[#4d9538] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#038543] transition-colors text-sm"
            >
              Publier une offre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {offers.map(offer => (
              <OfferCard key={offer._id} offer={offer} />
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: 'kg recyclés ce mois', value: '12 480', change: '+18%', color: '#4d9538' },
          { icon: Package, label: 'Offres actives', value: '247', change: '+12%', color: '#c41539' },
          { icon: Recycle, label: 'Collecteurs actifs', value: '84', change: '5 nouveaux', color: '#231F20' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + '15' }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="font-extrabold text-2xl text-[#231F20] leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-[11px] font-semibold mt-1" style={{ color: s.color }}>{s.change}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
