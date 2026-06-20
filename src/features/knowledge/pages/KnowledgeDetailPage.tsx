import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { knowledgeApi } from '@/lib/api/knowledge.api'
import { useAuthStore } from '@/store/auth.store'
import { Eye, Heart, ChevronLeft, Share2, BookOpen, Clock } from 'lucide-react'

export default function KnowledgeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', slug],
    queryFn: () => knowledgeApi.detail(slug!).then(r => r.data.data),
    enabled: !!slug,
  })

  const { mutate: like } = useMutation({
    mutationFn: () => knowledgeApi.like(slug!).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledge', slug] }),
  })

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/4" />
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 bg-white rounded-2xl h-96 border border-gray-100" />
          <div className="bg-white rounded-2xl h-48 border border-gray-100" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const title = typeof data.title === 'string' ? data.title : data.title?.fr || 'Article'
  const content = typeof data.content === 'object'
    ? data.content?.fr || 'Contenu non disponible'
    : data.content || 'Contenu non disponible'

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/knowledge')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4d9538] transition-colors"
        >
          <ChevronLeft size={16} /> Savoir-faire
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-[#231F20] truncate max-w-[300px]">{title}</span>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Article content */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header banner */}
            <div className="h-24 bg-[#4d9538] flex items-center px-6 gap-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-black/10 rounded-full" />
              <div className="relative z-10">
                {data.category && (
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{data.category}</span>
                )}
                <h1 className="text-xl font-extrabold text-white mt-1 leading-snug">{title}</h1>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Eye size={13} /> {data.viewCount || 0} vues
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Heart size={13} /> {data.likeCount || 0} j'aime
              </span>
              {data.createdAt && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={13} />
                  {new Date(data.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              {data.status && (
                <span className="ml-auto text-[11px] font-semibold bg-[#ebf5ea] text-[#4d9538] px-2.5 py-0.5 rounded-full">
                  Publié
                </span>
              )}
            </div>

            {/* Content body */}
            <div className="p-6">
              <div className="text-sm text-[#231F20] leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-sm text-[#231F20]">Actions</h3>
            {isAuthenticated && (
              <button
                onClick={() => like()}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:border-[#c41539] hover:text-[#c41539] transition-colors"
              >
                <Heart size={15} /> J'aime ({data.likeCount || 0})
              </button>
            )}
            <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:border-[#4d9538] hover:text-[#4d9538] transition-colors">
              <Share2 size={15} /> Partager
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-sm text-[#231F20] mb-3">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500"><Eye size={14} /> Vues</span>
                <span className="font-bold text-[#231F20] text-sm">{data.viewCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500"><Heart size={14} /> J'aime</span>
                <span className="font-bold text-[#231F20] text-sm">{data.likeCount || 0}</span>
              </div>
            </div>
          </div>

          {/* More articles */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-sm text-[#231F20] mb-3">Plus de contenu</h3>
            <button
              onClick={() => navigate('/knowledge')}
              className="w-full flex items-center gap-3 p-3 bg-[#f0f9f0] rounded-xl hover:bg-[#ebf5ea] transition-colors text-left"
            >
              <div className="w-8 h-8 bg-[#4d9538] rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen size={15} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#231F20]">Bibliothèque complète</p>
                <p className="text-[10px] text-gray-400">Tous les articles et tutoriels</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
