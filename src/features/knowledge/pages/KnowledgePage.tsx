import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { knowledgeApi } from '@/lib/api/knowledge.api'
import { Eye, Heart, BookOpen, Search, Plus } from 'lucide-react'

const TYPES = ['Tous', 'article', 'video', 'tutorial'] as const
const TYPE_LABELS: Record<string, string> = {
  Tous: 'Tous', article: 'Articles', video: 'Vidéos', tutorial: 'Tutoriels',
}

const CARD_COLORS = ['#4d9538', '#c41539', '#1a1a1a', '#f5c518', '#4d9538', '#038543']
const CARD_ICONS: Record<number, string> = { 0: '♻️', 1: '⚙️', 2: '📊', 3: '⚠️', 4: '🌱', 5: '🚚' }

interface KnowledgeItem {
  _id: string
  slug: string
  title: { fr?: string } | string
  content?: { fr?: string } | string
  category?: string
  type?: string
  viewCount?: number
  likeCount?: number
  status?: string
}

const STATIC_ITEMS: KnowledgeItem[] = [
  { _id: '1', slug: 'trier-pet', title: { fr: 'Trier et préparer les bouteilles PET pour le recyclage' }, category: 'PET · Collecte', viewCount: 1240, likeCount: 88, status: 'published' },
  { _id: '2', slug: 'granulation-hdpe', title: { fr: 'Processus de granulation du HDPE recyclé' }, category: 'HDPE · Traitement', viewCount: 897, likeCount: 84, status: 'published' },
  { _id: '3', slug: 'prix-plastiques', title: { fr: 'Fixer le bon prix pour vos matières plastiques' }, category: 'Marché · Prix', viewCount: 2100, likeCount: 140, status: 'published' },
  { _id: '4', slug: 'securite-collecte', title: { fr: 'Sécurité lors de la collecte : EPI et bonnes pratiques' }, category: 'Sécurité', viewCount: 1240, likeCount: 88, status: 'published' },
  { _id: '5', slug: 'impact-environnemental', title: { fr: 'Impact environnemental du recyclage plastique en Tunisie' }, category: 'Environnement', viewCount: 1240, likeCount: 88, status: 'published' },
  { _id: '6', slug: 'optimiser-tournees', title: { fr: 'Optimiser ses tournées de collecte' }, category: 'Logistique', viewCount: 0, likeCount: 0, status: 'published' },
]

function KnowledgeCard({ item, index }: { item: KnowledgeItem; index: number }) {
  const navigate = useNavigate()
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const icon = CARD_ICONS[index % Object.keys(CARD_ICONS).length]
  const title = typeof item.title === 'string' ? item.title : item.title?.fr || ''
  const content = typeof item.content === 'object'
    ? (item.content as { fr?: string })?.fr?.substring(0, 120)
    : (item.content as string | undefined)?.substring(0, 120)

  return (
    <button
      onClick={() => navigate(`/knowledge/${item.slug}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all text-left flex flex-col group"
    >
      {/* Colored header */}
      <div className="h-20 flex flex-col items-center justify-center gap-1 relative overflow-hidden" style={{ backgroundColor: color }}>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-black/10 rounded-full" />
        <span className="text-3xl relative z-10">{icon}</span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {item.category && (
          <p className="text-[10px] font-bold text-[#4d9538] mb-1.5 uppercase tracking-wide">{item.category}</p>
        )}
        <h3 className="font-bold text-sm text-[#231F20] leading-snug line-clamp-2 flex-1">{title}</h3>
        {content && (
          <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">{content}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center gap-3">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Eye size={11} /> {item.viewCount ?? 0}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Heart size={11} /> {item.likeCount ?? 0}
        </span>
        <span className="ml-auto text-[10px] font-semibold bg-[#ebf5ea] text-[#4d9538] px-2 py-0.5 rounded-full">
          Publié
        </span>
      </div>
    </button>
  )
}

export default function KnowledgePage() {
  const [type, setType] = useState<string>('Tous')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', type],
    queryFn: () =>
      knowledgeApi.list({ type: type !== 'Tous' ? type : undefined }).then(r => r.data.data),
  })

  const raw: KnowledgeItem[] = data?.data || []
  const items = raw.length > 0 ? raw : STATIC_ITEMS

  const filtered = items.filter(item => {
    const title = typeof item.title === 'string' ? item.title : item.title?.fr || ''
    return !search || title.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Savoir-faire</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} fiches publiées · Bibliothèque des contenus</p>
        </div>
        <button className="flex items-center gap-2 bg-[#4d9538] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#038543] transition-colors">
          <Plus size={15} /> Nouvelle fiche
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 h-9 rounded-xl text-xs font-semibold transition-colors border ${
                type === t
                  ? 'bg-[#4d9538] text-white border-[#4d9538]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#4d9538]'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une fiche..."
            className="w-full h-9 pl-8 pr-4 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-[#4d9538]"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
              <div className="h-20 bg-gray-100 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-full" />
                <div className="h-3 bg-gray-50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-[#ebf5ea] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-[#4d9538]" />
          </div>
          <p className="font-bold text-[#231F20]">Aucun contenu trouvé</p>
          <p className="text-sm text-gray-400 mt-1">Essayez d'autres critères de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <KnowledgeCard key={item._id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
