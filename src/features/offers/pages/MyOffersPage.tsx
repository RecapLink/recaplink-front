import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { offersApi } from '@/lib/api/offers.api'
import type { Offer } from '@/types/offer.types'
import { Package, Plus, Eye, Pencil, Trash2, MapPin, Clock } from 'lucide-react'

const TABS = [
  { key: 'active', label: 'Actives', color: '#4d9538', bg: '#ebf5ea' },
  { key: 'pending', label: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
  { key: 'completed', label: 'Complétées', color: '#6b7280', bg: '#f9fafb' },
  { key: 'rejected', label: 'Refusées', color: '#c41539', bg: '#fef2f2' },
] as const

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-[#ebf5ea] text-[#4d9538]' },
  pending: { label: 'En attente', className: 'bg-amber-50 text-amber-600' },
  completed: { label: 'Complétée', className: 'bg-gray-100 text-gray-600' },
  rejected: { label: 'Refusée', className: 'bg-red-50 text-[#c41539]' },
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-500' },
}

export default function MyOffersPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<string>('active')

  const { data, isLoading } = useQuery({
    queryKey: ['offers', 'mine'],
    queryFn: () => offersApi.mine().then(r => r.data.data || []),
  })

  const { mutate: deleteOffer } = useMutation({
    mutationFn: (id: string) => offersApi.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers', 'mine'] }),
  })

  const allOffers: Offer[] = data || []
  const filtered = allOffers.filter(o => o.status === tab)
  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = allOffers.filter(o => o.status === t.key).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Mes offres</h1>
          <p className="text-sm text-gray-500 mt-0.5">{allOffers.length} offre{allOffers.length !== 1 ? 's' : ''} publiée{allOffers.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/offers/new')}
          className="flex items-center gap-2 bg-[#4d9538] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#038543] transition-colors"
        >
          <Plus size={15} /> Nouvelle offre
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`bg-white rounded-2xl p-4 text-left border transition-all ${tab === t.key ? 'border-[#4d9538] shadow-sm' : 'border-gray-100'}`}
          >
            <p className="text-2xl font-extrabold leading-none" style={{ color: t.color }}>{counts[t.key] || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{t.label}</p>
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                tab === t.key
                  ? 'border-[#4d9538] text-[#4d9538] font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-[#4d9538] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Offers list */}
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-50 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-[#ebf5ea] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package size={28} className="text-[#4d9538]" />
              </div>
              <p className="font-bold text-[#231F20]">Aucune offre {
                tab === 'active' ? 'active' : tab === 'pending' ? 'en attente' : tab === 'completed' ? 'complétée' : 'refusée'
              }</p>
              {tab === 'active' && (
                <>
                  <p className="text-sm text-gray-400 mt-1">Publiez votre première offre</p>
                  <button
                    onClick={() => navigate('/offers/new')}
                    className="mt-4 bg-[#4d9538] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#038543] transition-colors text-sm"
                  >
                    Publier une offre
                  </button>
                </>
              )}
            </div>
          ) : (
            filtered.map((offer: Offer) => {
              const badge = STATUS_BADGE[offer.status] || STATUS_BADGE.draft
              return (
                <div key={offer._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-[#f0f9f0] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {offer.images?.[0]
                      ? <img src={offer.images[0]} alt="" className="w-full h-full object-cover" />
                      : <Package size={20} className="text-[#4d9538]" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#231F20] truncate">{offer.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] font-bold bg-[#ebf5ea] text-[#4d9538] px-1.5 py-0.5 rounded">
                        {offer.plasticType}
                      </span>
                      {offer.location?.city && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <MapPin size={10} /> {offer.location.city}
                        </span>
                      )}
                      {offer.quantityKg && (
                        <span className="text-[11px] text-gray-400">{offer.quantityKg} kg</span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Clock size={10} />
                        {new Date(offer.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Status + price */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-sm font-bold text-[#231F20]">
                      {offer.isFree ? 'Gratuit' : offer.pricePerKg ? `${offer.pricePerKg} DT/kg` : '—'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/offers/${offer._id}`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                      title="Voir"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteOffer(offer._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-[#c41539] transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
