import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'
import { Avatar } from '@/components/ui/avatar'
import { Search, Users, CheckCircle, Clock, Ban, Star, Eye, Pencil, Trash2, Plus, Download } from 'lucide-react'

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'active', label: 'Actifs', icon: CheckCircle },
  { key: 'pending', label: 'En attente', icon: Clock },
  { key: 'suspended', label: 'Suspendus', icon: Ban },
]

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-[#ebf5ea] text-[#4d9538]',
  pending: 'bg-amber-50 text-amber-600',
  suspended: 'bg-red-50 text-[#c41539]',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Actif', pending: 'En attente', suspended: 'Suspendu',
}

interface UserRow {
  _id: string
  fullName: string
  username: string
  avatarUrl?: string
  zone?: string
  city?: string
  plasticTypes?: string[]
  kgCollected?: number
  rating?: number
  status: string
  createdAt?: string
}
interface ListResponse { data: UserRow[]; total: number; totalPages: number }

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

export default function AdminCollectorsPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'collectors', statusFilter, search, page],
    queryFn: () =>
      adminApi
        .listUsers({ role: 'collecteur', status: statusFilter !== 'all' ? statusFilter : undefined, search: search || undefined, page, limit: 10 })
        .then(r => r.data.data as ListResponse),
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'collectors'] }),
  })

  const users = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Gestion des Collecteurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} collecteurs enregistrés sur la plateforme</p>
        </div>
        <button className="flex items-center gap-2 bg-[#4d9538] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#038543] transition-colors">
          <Plus size={15} />
          Ajouter collecteur
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} iconBg="#ebf5ea" value={total || 84} label="Total collecteurs" change="▲ 5 ce mois" changeColor="#4d9538" />
        <StatCard icon={CheckCircle} iconBg="#ebf5ea" value={71} label="Actifs" change="▲ 84%" changeColor="#4d9538" />
        <StatCard icon={Clock} iconBg="#ebf5ea" value={8} label="En attente vérif." change="→ 3 nouvelles" changeColor="#f59e0b" />
        <StatCard icon={Ban} iconBg="#fef2f2" value={5} label="Suspendus" change="▼ signalés" changeColor="#c41539" />
      </div>

      {/* Filters + Search */}
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
            placeholder="Rechercher un collecteur ..."
            className="w-full h-9 pl-8 pr-4 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-[#4d9538]"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 h-9 border border-gray-200 bg-white rounded-lg text-sm text-gray-600 hover:border-gray-300 transition-colors">
          <Download size={13} />
          Exporter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Collecteur</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Zone</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Matériaux</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Kg collectés</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Note</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4d9538]">Inscrit le</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-[#4d9538]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Users size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucun collecteur trouvé</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                        <div>
                          <p className="font-semibold text-sm text-[#231F20]">{user.fullName}</p>
                          <p className="text-[11px] text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.city || user.zone || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(user.plasticTypes || ['PET']).slice(0, 2).map(pt => (
                          <span key={pt} className="text-[10px] font-bold bg-[#ebf5ea] text-[#4d9538] px-1.5 py-0.5 rounded">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm text-[#231F20]">{(user.kgCollected || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.rating ? (
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-[#f5c518] fill-[#f5c518]" />
                          <span className="text-sm font-semibold text-[#231F20]">{user.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[user.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABEL[user.status] || user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors" title="Voir">
                          <Eye size={14} />
                        </button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors" title="Modifier">
                          <Pencil size={13} />
                        </button>
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus({ id: user._id, status: 'active' })}
                              className="px-2.5 h-7 rounded-lg bg-[#4d9538] text-white text-[11px] font-semibold hover:bg-[#038543] transition-colors"
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => updateStatus({ id: user._id, status: 'suspended' })}
                              className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-[#c41539] hover:bg-red-100 transition-colors"
                            >
                              <span className="font-bold text-sm leading-none">×</span>
                            </button>
                          </>
                        )}
                        {user.status === 'active' && (
                          <button
                            onClick={() => updateStatus({ id: user._id, status: 'suspended' })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c41539] hover:bg-red-50 transition-colors"
                            title="Suspendre"
                          >
                            <Ban size={13} />
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <>
                            <button
                              onClick={() => updateStatus({ id: user._id, status: 'active' })}
                              className="px-2.5 h-7 rounded-lg bg-[#4d9538] text-white text-[11px] font-semibold hover:bg-[#038543] transition-colors"
                            >
                              Réactiver
                            </button>
                            <button className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-[#c41539] hover:bg-red-100 transition-colors" title="Supprimer">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-[#4d9538] hover:text-[#4d9538] text-sm transition-colors">
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? 'bg-[#4d9538] text-white' : 'border border-gray-200 text-gray-600 hover:border-[#4d9538]'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-[#4d9538] hover:text-[#4d9538] text-sm transition-colors">
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
