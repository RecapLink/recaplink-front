import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'
import { BookOpen, Plus, Search, Eye, Heart, Pencil, Recycle, Settings, BarChart2, ShieldAlert, Leaf, Truck } from 'lucide-react'

const STATUS_OPTS = [
  { key: 'all', label: 'Tous' },
  { key: 'published', label: 'Publiées' },
  { key: 'draft', label: 'Brouillons' },
  { key: 'video', label: 'Vidéos' },
  { key: 'article', label: 'Articles' },
]

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  published: { label: 'Publié', cls: 'bg-[#4d9538] text-white' },
  draft: { label: 'Brouillon', cls: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Archivé', cls: 'bg-gray-100 text-gray-500' },
}

const CARD_THEMES = [
  { bg: '#4d9538', icon: Recycle },
  { bg: '#c41539', icon: Settings },
  { bg: '#231F20', icon: BarChart2 },
  { bg: '#c41539', icon: ShieldAlert },
  { bg: '#4d9538', icon: Leaf },
  { bg: '#f5c518', icon: Truck },
]

interface KnowledgeItem {
  _id: string
  title: string | { fr?: string }
  description?: string | { fr?: string }
  category?: string
  type?: string
  status: string
  viewCount?: number
  likeCount?: number
}
interface ListResponse { data: KnowledgeItem[]; total: number; totalPages: number }

function getStr(v: string | { fr?: string } | undefined): string {
  if (!v) return '—'
  if (typeof v === 'string') return v
  return v.fr || '—'
}

export default function AdminKnowledgePage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'knowledge', statusFilter],
    queryFn: () =>
      adminApi
        .listKnowledge({ status: statusFilter !== 'all' && !['video', 'article'].includes(statusFilter) ? statusFilter : undefined })
        .then(r => r.data.data as ListResponse),
  })

  const { mutate: publish } = useMutation({
    mutationFn: (id: string) => adminApi.publishKnowledge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'knowledge'] }),
  })

  const items = (data?.data || []).filter(item => {
    if (search && !getStr(item.title).toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter === 'video') return item.type === 'video'
    if (statusFilter === 'article') return item.type === 'article'
    return true
  })

  const total = data?.total || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Savoir-faire</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} fiches publiées · Bibliothèque de contenus</p>
        </div>
        <button className="flex items-center gap-2 bg-[#4d9538] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#038543] transition-colors">
          <Plus size={15} />
          Nouvelle fiche
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_OPTS.map(o => (
          <button
            key={o.key}
            onClick={() => setStatusFilter(o.key)}
            className={`px-3 h-9 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === o.key ? 'bg-[#4d9538] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#4d9538]'
            }`}
          >
            {o.label}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une fiche ..."
            className="w-52 h-9 pl-8 pr-4 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-[#4d9538]"
          />
        </div>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-32 bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 bg-gray-50 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Aucun contenu trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item, i) => {
            const theme = CARD_THEMES[i % CARD_THEMES.length]
            const Icon = theme.icon
            const badge = STATUS_BADGE[item.status] || { label: item.status, cls: 'bg-gray-100 text-gray-500' }
            return (
              <div key={item._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Colored header */}
                <div className="h-28 flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
                  <Icon size={36} className="text-white/90" />
                </div>
                <div className="p-4 space-y-2">
                  {/* Tags */}
                  <div className="flex gap-1 flex-wrap">
                    {item.category && (
                      <span className="text-[10px] font-semibold text-[#4d9538]">{item.category}</span>
                    )}
                    {item.type && (
                      <span className="text-[10px] text-gray-400">· {item.type}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#231F20] leading-snug line-clamp-2">
                    {getStr(item.title)}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-2">{getStr(item.description)}</p>
                  {/* Footer */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Eye size={11} /> {item.viewCount || 0}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Heart size={11} /> {item.likeCount || 0}
                    </div>
                    <button className="ml-auto text-gray-400 hover:text-[#4d9538] transition-colors">
                      <Pencil size={13} />
                    </button>
                    {item.status === 'draft' ? (
                      <button
                        onClick={() => publish(item._id)}
                        className="text-[11px] font-bold bg-[#4d9538] text-white px-3 py-1 rounded-lg hover:bg-[#038543] transition-colors"
                      >
                        Publier
                      </button>
                    ) : (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${badge.cls}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
