import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'
import { Package, Recycle, Users, Plus, Search, Eye, Pencil, Ban, ChevronLeft, ChevronRight } from 'lucide-react'
import { AddOfferModal } from '../offers/AddOfferModal'

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'verified', label: 'Certifié' },
  { key: 'active', label: 'Actifs' },
  { key: 'suspended', label: 'Suspendus', icon: Ban },
]

const PLASTIC_COLORS: Record<string, string> = {
  PET: '#4d9538', HDPE: '#038543', PP: '#3b82f6', PVC: '#c41539', Autres: '#9ca3af',
}

interface OfferRow {
  _id: string
  title: string
  refCode?: string
  plasticType: string
  quantityKg?: number
  status: string
  flagged?: boolean
  owner?: { fullName: string }
  location?: { zone?: string; city?: string; address?: string }
  createdAt?: string
  imageUrl?: string
}
interface ListResponse { data: OfferRow[]; total: number; totalPages: number }

function StatCard({ icon: Icon, iconBg, value, label, change, changeColor }: {
  icon: React.ElementType; iconBg: string; value: string | number; label: string; change: string; changeColor: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 flex gap-3 items-start">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon size={22} className="text-[#4d9538]" />
      </div>
      <div>
        <p className="font-extrabold text-2xl text-[#231F20] leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        <p className="text-[11px] font-semibold mt-1" style={{ color: changeColor }}>{change}</p>
      </div>
    </div>
  )
}

export default function AdminOffersPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'offers', statusFilter, search, page],
    queryFn: () =>
      adminApi
        .listOffers({ status: statusFilter !== 'all' ? statusFilter : undefined, page, limit: 10 })
        .then(r => r.data.data as ListResponse),
  })

  const { mutate: verify } = useMutation({
    mutationFn: (id: string) => adminApi.verifyOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'offers'] }),
  })

  const offers = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Offres</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez et suivez toutes vos offres</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#4d9538] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#038543] transition-colors"
        >
          <Plus size={15} />
          Ajouter une offre
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Package} iconBg="#ebf5ea" value={total || 312} label="Offres actives" change="▲ 5 ce mois" changeColor="#4d9538" />
        <StatCard icon={Recycle} iconBg="#ebf5ea" value={89} label="Total recyclé" change="▲ 5 nouveaux" changeColor="#4d9538" />
        <StatCard icon={Users} iconBg="#ebf5ea" value={198} label="Collecteurs actifs" change="▲ 63%" changeColor="#4d9538" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setStatusFilter(f.key); setPage(1) }}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f.key ? 'bg-[#4d9538] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#4d9538]'
              }`}
            >
              {f.icon && <f.icon size={13} />}
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Rechercher une offre ..."
            className="w-full h-9 pl-8 pr-4 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-[#4d9538]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Recycleur</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Quantité (kg)</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Localisation</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-[#4d9538]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Package size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucune offre trouvée</p>
                  </td>
                </tr>
              ) : (
                offers.map(offer => {
                  const plasticColor = PLASTIC_COLORS[offer.plasticType] || '#4d9538'
                  return (
                    <tr key={offer._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {offer.imageUrl ? (
                            <img src={offer.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: plasticColor + '20' }}>
                              <Package size={14} style={{ color: plasticColor }} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-[#231F20] leading-snug">{offer.title}</p>
                            <p className="text-[11px] text-gray-400">Offre #{offer.refCode || offer._id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: plasticColor }}>
                          {offer.plasticType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#231F20]">
                        {offer.quantityKg ? `${offer.quantityKg} kilos` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {offer.createdAt
                          ? new Date(offer.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {[offer.location?.city, offer.location?.zone].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold text-[#4d9538] bg-[#ebf5ea] px-2 py-0.5 rounded-full self-start">
                            Vérifiée
                          </span>
                          {offer.flagged && (
                            <span className="text-[10px] font-semibold text-[#c41539] bg-red-50 px-2 py-0.5 rounded-full self-start">
                              Signalée
                            </span>
                          )}
                          {offer.status === 'pending' && (
                            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full self-start">
                              En attente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                            <Eye size={14} />
                          </button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                            <Pencil size={13} />
                          </button>
                          {offer.status === 'pending' && (
                            <button onClick={() => verify(offer._id)}
                              className="px-2.5 h-7 rounded-lg bg-[#4d9538] text-white text-[11px] font-semibold hover:bg-[#038543] transition-colors">
                              Valider
                            </button>
                          )}
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c41539] hover:bg-red-50 transition-colors">
                            <Ban size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40 hover:border-[#4d9538] transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? 'bg-[#4d9538] text-white' : 'border border-gray-200 text-gray-600 hover:border-[#4d9538]'}`}>
                {n}
              </button>
            ))}
            {totalPages > 4 && <span className="w-8 text-center text-gray-400 text-sm">...</span>}
            {totalPages > 3 && (
              <button onClick={() => setPage(totalPages)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === totalPages ? 'bg-[#4d9538] text-white' : 'border border-gray-200 text-gray-600 hover:border-[#4d9538]'}`}>
                {totalPages}
              </button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40 hover:border-[#4d9538] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <AddOfferModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}
