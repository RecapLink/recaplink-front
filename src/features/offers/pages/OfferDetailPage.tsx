import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { offersApi } from '@/lib/api/offers.api'
import { messagingApi } from '@/lib/api/messaging.api'
import { useAuthStore } from '@/store/auth.store'
import { Avatar } from '@/components/ui/avatar'
import { MapPin, Package, Clock, Eye, Star, MessageCircle, Pencil, Share2, ChevronLeft } from 'lucide-react'

const PLASTIC_COLORS: Record<string, string> = {
  PET: '#4d9538', HDPE: '#c41539', PP: '#231F20', PVC: '#c41539', Autres: '#9ca3af',
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-[#ebf5ea] text-[#4d9538]' },
  pending: { label: 'En attente', className: 'bg-amber-50 text-amber-600' },
  completed: { label: 'Complétée', className: 'bg-gray-100 text-gray-600' },
  rejected: { label: 'Refusée', className: 'bg-red-50 text-[#c41539]' },
}

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['offers', id],
    queryFn: () => offersApi.detail(id!).then(r => r.data.data),
    enabled: !!id,
  })

  const { mutate: contact, isPending: contacting } = useMutation({
    mutationFn: () =>
      messagingApi.create({ recipientId: data?.owner?._id, offerId: id }).then(r => r.data.data),
    onSuccess: conv => navigate(`/messaging/${conv._id}`),
  })

  const offer = data
  const isOwner = user?._id === offer?.owner?._id
  const statusBadge = STATUS_BADGE[offer?.status || 'active']

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-1/3" />
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 bg-white rounded-2xl h-96 border border-gray-100" />
          <div className="bg-white rounded-2xl h-64 border border-gray-100" />
        </div>
      </div>
    )
  }

  if (!offer) return null

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/offers')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4d9538] transition-colors"
        >
          <ChevronLeft size={16} /> Offres
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-[#231F20] truncate max-w-[300px]">{offer.title}</span>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main content */}
        <div className="col-span-2 space-y-4">
          {/* Image gallery */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-64 bg-[#f0f9f0] relative flex items-center justify-center">
              {offer.images?.[0] ? (
                <img src={offer.images[0]} alt={offer.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-20 h-20 bg-[#ebf5ea] rounded-full flex items-center justify-center">
                  <Package size={36} className="text-[#4d9538]" />
                </div>
              )}
              {/* Type badge */}
              <div className="absolute top-4 left-4">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: PLASTIC_COLORS[offer.plasticType] || '#4d9538' }}
                >
                  {offer.plasticType}
                </span>
              </div>
              {/* Status badge */}
              {statusBadge && (
                <div className="absolute top-4 right-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-xl font-bold text-[#231F20]">{offer.title}</h1>
              <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#4d9538] hover:text-[#4d9538] transition-colors">
                <Share2 size={15} />
              </button>
            </div>

            {offer.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{offer.description}</p>
            )}

            {/* Key info grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Quantité', value: offer.quantity ? `${offer.quantity} kg` : offer.quantityKg ? `${offer.quantityKg} kg` : '—', color: '#4d9538' },
                { label: 'Prix', value: offer.isFree ? 'Gratuit' : offer.pricePerKg ? `${offer.pricePerKg} DT/kg` : '—', color: '#4d9538' },
                { label: 'Vues', value: offer.viewCount ? `${offer.viewCount} vues` : '0 vue', color: '#6b7280' },
              ].map(info => (
                <div key={info.label} className="bg-[#f0f9f0] rounded-xl p-3.5 text-center">
                  <p className="font-extrabold text-lg leading-none" style={{ color: info.color }}>{info.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{info.label}</p>
                </div>
              ))}
            </div>

            {/* Location + time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-[#4d9538] flex-shrink-0" />
                <span>{offer.location?.zone}, {offer.location?.city}</span>
              </div>
              {offer.availability && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-[#4d9538] flex-shrink-0" />
                  <span>{offer.availability}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={14} className="flex-shrink-0" />
                <span>Publiée le {new Date(offer.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  className="flex items-center gap-2 border border-[#4d9538] text-[#4d9538] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#ebf5ea] transition-colors"
                >
                  <Pencil size={14} /> Modifier
                </button>
                <button
                  onClick={() => offersApi.close(id!).then(() => qc.invalidateQueries({ queryKey: ['offers', id] }))}
                  className="flex items-center gap-2 border border-[#c41539] text-[#c41539] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Fermer l'offre
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Owner card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-sm text-[#231F20] mb-4">Publié par</h3>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={offer.owner?.avatarUrl} name={offer.owner?.fullName || '?'} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#231F20] truncate">{offer.owner?.fullName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} className="text-[#f5c518] fill-[#f5c518]" />
                  <span className="text-xs text-gray-500">{offer.owner?.rating?.toFixed(1) || '—'}</span>
                </div>
              </div>
            </div>

            {offer.owner?.city && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <MapPin size={12} className="text-[#4d9538]" />
                <span>{offer.owner.city}</span>
              </div>
            )}

            {!isOwner && (
              <button
                onClick={() => contact()}
                disabled={contacting}
                className="w-full flex items-center justify-center gap-2 bg-[#4d9538] text-white font-semibold py-3 rounded-xl hover:bg-[#038543] disabled:opacity-60 transition-colors text-sm"
              >
                <MessageCircle size={16} />
                {contacting ? 'Connexion...' : 'Contacter le vendeur'}
              </button>
            )}

            {isOwner && (
              <div className="bg-[#ebf5ea] rounded-xl p-3 text-center">
                <p className="text-xs text-[#4d9538] font-semibold">Votre offre</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Gérez-la depuis "Mes offres"</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-sm text-[#231F20] mb-3">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye size={14} /> Vues
                </div>
                <span className="font-bold text-[#231F20] text-sm">{offer.viewCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Safety tip */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">Conseil de sécurité</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              Effectuez toujours les transactions en personne dans un lieu sûr. Ne partagez jamais vos informations bancaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
