import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, MapPin, Clock, Package, Filter } from 'lucide-react'
import { offersApi } from '@/lib/api/offers.api'
import type { Offer } from '@/types/offer.types'
import type { PlasticType } from '@/types/user.types'
import { Avatar } from '@/components/ui/avatar'

const PLASTICS = ['Tous', 'PET', 'HDPE', 'PP', 'PVC', 'Autres'] as const

const PLASTIC_COLORS: Record<string, string> = {
  PET: '#4d9538', HDPE: '#c41539', PP: '#231F20', PVC: '#c41539', Autres: '#9ca3af',
}

function OfferCard({ offer }: { offer: Offer }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/offers/${offer._id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all text-left w-full group"
    >
      <div className="h-36 bg-[#f0f9f0] relative flex items-center justify-center">
        {offer.images?.[0] ? (
          <img src={offer.images[0]} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-14 h-14 bg-[#ebf5ea] rounded-full flex items-center justify-center">
            <Package size={26} className="text-[#4d9538]" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
            style={{ backgroundColor: PLASTIC_COLORS[offer.plasticType] || '#4d9538' }}
          >
            {offer.plasticType}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <Avatar src={offer.owner?.avatarUrl} name={offer.owner?.fullName || '?'} size="xs" className="border-2 border-white shadow-sm" />
        </div>
        {offer.quantityKg && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {offer.quantityKg} kg
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="font-semibold text-sm text-[#231F20] truncate mb-1">{offer.title}</p>
        <div className="flex items-center gap-1 mb-1">
          <MapPin size={11} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] text-gray-500 truncate">{offer.location?.city}, {offer.location?.zone}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Clock size={11} />
            {new Date(offer.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </div>
          <span className="text-sm font-bold text-[#4d9538]">
            {offer.isFree ? 'Gratuit' : offer.pricePerKg ? `${offer.pricePerKg} DT/kg` : '—'}
          </span>
        </div>
      </div>
      <div className="bg-[#4d9538] text-white text-xs font-bold py-2 text-center hover:bg-[#038543] transition-colors">
        ♻ Collecter
      </div>
    </button>
  )
}

export default function OffersPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('Tous')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['offers', filter, search, page],
    queryFn: () =>
      offersApi
        .list({
          plasticType: filter !== 'Tous' ? (filter as PlasticType) : undefined,
          search: search || undefined,
          page,
          limit: 12,
        })
        .then(r => r.data.data),
  })

  const offers: Offer[] = data?.data || []
  const total: number = data?.total || 0
  const totalPages: number = data?.totalPages || 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Offres de plastique</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} offres disponibles sur la plateforme</p>
        </div>
        <button
          onClick={() => navigate('/offers/new')}
          className="flex items-center gap-2 bg-[#4d9538] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#038543] transition-colors"
        >
          <Plus size={15} /> Publier une offre
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Plastic type filters */}
        <div className="flex gap-2 flex-wrap">
          {PLASTICS.map(p => (
            <button
              key={p}
              onClick={() => { setFilter(p); setPage(1) }}
              className={`px-3 h-9 rounded-xl text-xs font-semibold transition-colors border ${
                filter === p
                  ? 'bg-[#4d9538] text-white border-[#4d9538]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#4d9538] hover:text-[#4d9538]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Rechercher une offre, ville, matière..."
            className="w-full h-9 pl-8 pr-4 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-[#4d9538]"
          />
        </div>

        <button className="flex items-center gap-1.5 px-3 h-9 border border-gray-200 bg-white rounded-xl text-sm text-gray-600 hover:border-gray-300 transition-colors">
          <Filter size={13} /> Filtres
        </button>

        <button
          onClick={() => navigate('/offers/mine')}
          className="flex items-center gap-1.5 px-3 h-9 border border-[#4d9538] text-[#4d9538] bg-[#ebf5ea] rounded-xl text-sm font-medium hover:bg-[#d4edcc] transition-colors"
        >
          Mes offres
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="h-36 bg-gray-100" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-[#ebf5ea] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-[#4d9538]" />
          </div>
          <p className="font-bold text-[#231F20]">Aucune offre trouvée</p>
          <p className="text-sm text-gray-400 mt-1">Modifiez vos critères ou publiez la première offre</p>
          <button
            onClick={() => navigate('/offers/new')}
            className="mt-4 bg-[#4d9538] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#038543] transition-colors text-sm"
          >
            Publier une offre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {offers.map(offer => <OfferCard key={offer._id} offer={offer} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Page {page} / {totalPages} · {total} offres</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-[#4d9538] hover:text-[#4d9538] text-sm transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  n === page ? 'bg-[#4d9538] text-white' : 'border border-gray-200 text-gray-600 hover:border-[#4d9538]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-[#4d9538] hover:text-[#4d9538] text-sm transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
