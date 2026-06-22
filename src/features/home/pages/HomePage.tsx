import { useQuery } from '@tanstack/react-query'
import { Package, Recycle, Award, Truck, MessageSquare, AlertTriangle, BookOpen } from 'lucide-react'
import { PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '@/store/auth.store'
import { offersApi } from '@/lib/api/offers.api'
import { adminApi } from '@/lib/api/admin.api'
import AdminOverviewPage from '@/features/admin/pages/AdminOverviewPage'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLASTIC_ORDER = ['PET', 'HDPE', 'PP', 'PVC', 'Autres'] as const

const PLASTIC_COLORS: Record<string, string> = {
  PET: '#2d6e1a', HDPE: '#4d9538', PP: '#7dbf52', PVC: '#aad98a', Autres: '#d0ecc0',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 2) return 'À l\'instant'
  if (min < 60) return `Il y a ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatKpiCard({
  bg, decorativeColor, textColor, title, value, icon: Icon, iconBg, change, changeUp,
}: {
  bg: string; decorativeColor: string; textColor: string
  title: string; value: string; icon: React.ElementType
  iconBg: string; change: string; changeUp: boolean
}) {
  const subColor = textColor === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(35,31,32,0.65)'
  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ backgroundColor: bg, minHeight: 140 }}>
      <div className="absolute rounded-full pointer-events-none"
        style={{ top: -40, right: -20, width: 110, height: 110, backgroundColor: decorativeColor }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ bottom: -36, right: 24, width: 170, height: 140, backgroundColor: decorativeColor }} />
      <div className="relative p-5 flex flex-col h-full" style={{ minHeight: 140 }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-xs leading-snug"
              style={{ color: textColor === 'white' ? 'rgba(255,255,255,0.85)' : 'rgba(35,31,32,0.65)' }}>
              {title}
            </p>
            <p className="font-bold text-2xl mt-1 leading-none" style={{ color: textColor }}>{value}</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}>
            <Icon size={18} style={{ color: textColor === 'white' ? 'white' : '#4d9538' }} />
          </div>
        </div>
        <div className="mt-auto pt-3">
          <span className="text-xs font-medium" style={{ color: subColor }}>
            {changeUp ? '▲' : '▼'} {change}
          </span>
        </div>
      </div>
    </div>
  )
}

function PlasticTypeCard({
  name, pct, count, total, bg, barColor, nameColor, countColor, tall,
}: {
  name: string; pct: number; count: number; total: number; bg: string
  barColor: string; nameColor: string; countColor: string; tall?: boolean
}) {
  return (
    <div className="rounded-xl p-3 flex flex-col justify-between border border-gray-100"
      style={{ backgroundColor: bg, minHeight: tall ? 160 : 110 }}>
      <p className="text-[11px] font-bold leading-tight" style={{ color: nameColor }}>
        {name} — {pct}%
      </p>
      <div className="mt-2 h-1 rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: barColor }} />
        <span className="text-[10px]" style={{ color: countColor }}>
          <span className="font-bold">{count}</span>
          <span className="opacity-50 ml-0.5">sur {total} Offres</span>
        </span>
      </div>
    </div>
  )
}

function DonutChart({ distribution }: { distribution: { type: string; percentage: number }[] }) {
  const sorted = PLASTIC_ORDER.map(key => {
    const found = distribution.find(d => d.type === key)
    return { name: key, value: found?.percentage ?? 0, color: PLASTIC_COLORS[key] ?? '#ccc' }
  }).filter(d => d.value > 0)
  const top = sorted[0]
  return (
    <div className="bg-white rounded-xl p-3 flex items-center gap-2 h-full border border-gray-100" style={{ minHeight: 160 }}>
      <div className="relative flex-shrink-0">
        <PieChart width={96} height={96}>
          <Pie data={sorted} cx={48} cy={48} innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={0}>
            {sorted.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-[13px] text-[#231F20] leading-none">{top?.value ?? 0}%</span>
          <span className="text-[9px] text-gray-500 font-medium mt-0.5">{top?.name ?? '—'}</span>
        </div>
      </div>
      <div className="space-y-1 flex-1 min-w-0">
        {sorted.map(item => (
          <div key={item.name} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md"
            style={item.name === 'Autres' ? { backgroundColor: '#fff1f2' } : {}}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-gray-600 truncate">{item.name} — {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function activityIcon(type: string) {
  switch (type) {
    case 'offer_active':   return { Icon: Package,      bg: '#e8f5e9', color: '#4d9538' }
    case 'offer_closed':   return { Icon: Package,      bg: '#f5f5f5', color: '#9ca3af' }
    case 'offer_pending':  return { Icon: Package,      bg: '#fef9e7', color: '#d97706' }
    case 'badge_award':    return { Icon: Award,        bg: '#f3e8ff', color: '#9333ea' }
    case 'message':        return { Icon: MessageSquare, bg: '#e0f2fe', color: '#0284c7' }
    case 'knowledge':      return { Icon: BookOpen,     bg: '#fef9e7', color: '#d97706' }
    case 'report':         return { Icon: AlertTriangle, bg: '#fce4ec', color: '#c41539' }
    default:               return { Icon: Truck,        bg: '#e8f5e9', color: '#4d9538' }
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuthStore()

  // Super admin sees the monitoring dashboard, not the user page
  if (user?.role === 'super_admin') return <AdminOverviewPage />

  const { data: myOffersData, isLoading: myOffersLoading } = useQuery({
    queryKey: ['offers', 'mine'],
    queryFn: () => offersApi.mine().then(r => r.data.data ?? r.data ?? []),
    staleTime: 120_000,
  })

  const { data: plasticRaw } = useQuery({
    queryKey: ['dashboard', 'plastic-distribution'],
    queryFn: () => adminApi.plasticDistribution().then(r => r.data.data ?? r.data ?? []),
    staleTime: 120_000,
  })

  const myOffers = Array.isArray(myOffersData) ? myOffersData : []
  const myActiveOffers = myOffers.filter((o: any) => o.status === 'active').length
  const myTotalKg = myOffers.reduce((s: number, o: any) => s + (o.quantityKg ?? 0), 0)

  // Build activity feed from user's own offers
  const activities = myOffers
    .slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((offer: any) => ({
      type: offer.status === 'active' ? 'offer_active' : offer.status === 'closed' ? 'offer_closed' : 'offer_pending',
      title: offer.status === 'active'
        ? `Offre active — ${offer.title}`
        : offer.status === 'closed'
        ? `Offre clôturée — ${offer.title}`
        : `Offre en attente — ${offer.title}`,
      sub: `${offer.plasticType}${(offer.quantityKg ?? 0) > 0 ? ` · ${(offer.quantityKg ?? 0).toLocaleString('fr-FR')} kg` : ''}`,
      createdAt: offer.createdAt,
    }))

  const FALLBACK_ACTIVITIES = [
    { type: 'offer_active',  title: 'Aucune offre publiée pour le moment', sub: 'Publiez votre première offre',     createdAt: new Date().toISOString() },
  ]

  // Plastic distribution
  const plasticDist = Array.isArray(plasticRaw) ? plasticRaw : []
  const totalOffers = plasticDist.reduce((s: number, p: any) => s + (p.count ?? 0), 0) || 247

  const plasticCards = PLASTIC_ORDER.slice(0, 4).map(key => {
    const found = plasticDist.find((p: any) => p.type === key)
    return {
      name: key,
      pct: found?.percentage ?? 0,
      count: found?.count ?? 0,
      total: totalOffers,
      bg: '#ffffff',
      barColor: '#c41539',
      nameColor: '#4d9538',
      countColor: '#231F20',
    }
  })
  const autresItem = plasticDist.find((p: any) => p.type === 'Autres')
  const autresCard = {
    name: 'Autres', pct: autresItem?.percentage ?? 0, count: autresItem?.count ?? 0,
    total: totalOffers, bg: '#fff1f2', barColor: '#c41539', nameColor: '#c41539', countColor: '#231F20',
  }

  const donutData = plasticDist.length > 0
    ? plasticDist
    : [
        { type: 'PET', percentage: 40 }, { type: 'HDPE', percentage: 24 },
        { type: 'PP', percentage: 18 }, { type: 'PVC', percentage: 14 },
        { type: 'Autres', percentage: 4 },
      ]

  const roleLabel: Record<string, string> = {
    collecteur: 'Collecteur', recycleur: 'Recycleur',
    vendeur_plastique: 'Vendeur de plastique',
  }

  const feedItems = activities.length > 0 ? activities : FALLBACK_ACTIVITIES

  return (
    <div className="space-y-5">

      {/* ── Welcome banner ── */}
      <div className="bg-[#4d9538] rounded-2xl overflow-hidden relative" style={{ minHeight: 96 }}>
        <div className="absolute rounded-full pointer-events-none"
          style={{ top: -40, right: -30, width: 160, height: 160, backgroundColor: 'rgba(255,255,255,0.10)' }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ bottom: -50, right: 120, width: 200, height: 200, backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <div className="relative p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-white font-bold text-lg">
                {user?.fullName?.slice(0, 2).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-xl leading-snug">
              Bonjour, {user?.fullName?.split(' ')[0]} 👋
            </p>
            <p className="text-white/70 text-sm mt-0.5">
              {roleLabel[user?.role || ''] || 'Bienvenue'} · RecapLink
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            {[
              { label: 'Offres actives', value: '247+' },
              { label: 'Collecteurs', value: '80+' },
              { label: 'kg recyclés', value: '12 000+' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-xl px-4 py-2.5 text-center">
                <p className="font-bold text-white text-lg leading-none">{s.value}</p>
                <p className="text-white/70 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main row: KPI cards + types de plastique (3fr) | Activité récente (2fr) ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '3fr 2fr' }}>

        {/* Left: KPI cards + plastic types */}
        <div className="space-y-5">

          {/* Personal KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatKpiCard
              bg="#4d9538" decorativeColor="rgba(255,255,255,0.13)" textColor="white"
              icon={Package} iconBg="rgba(255,255,255,0.2)"
              title="Mes offres actives" value={myActiveOffers.toString()}
              change={`${myOffers.length} au total`} changeUp={true}
            />
            <StatKpiCard
              bg="#231F20" decorativeColor="rgba(255,255,255,0.07)" textColor="white"
              icon={Recycle} iconBg="rgba(255,255,255,0.12)"
              title="Kg de plastique" value={myTotalKg > 0 ? myTotalKg.toLocaleString('fr-FR') : '—'}
              change={myTotalKg > 0 ? 'dans mes offres' : 'Aucune donnée'} changeUp={true}
            />
            <StatKpiCard
              bg="#f5c518" decorativeColor="rgba(0,0,0,0.07)" textColor="#231F20"
              icon={Award} iconBg="rgba(0,0,0,0.1)"
              title="Mes badges" value={(user as any)?.badges?.length?.toString() ?? '0'}
              change="badges obtenus" changeUp={true}
            />
          </div>

          {/* Types de plastique Par Offres */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#231F20] text-base">Types de plastique Par Offres</h3>

            {/* 4 type cards */}
            <div className="grid grid-cols-4 gap-2">
              {plasticCards.map(p => <PlasticTypeCard key={p.name} {...p} />)}
            </div>

            {/* Autres + Donut */}
            <div className="grid grid-cols-4 gap-2 items-stretch">
              <PlasticTypeCard {...autresCard} tall />
              <div className="col-span-3">
                <DonutChart distribution={donutData} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Activité récente */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#231F20] text-base">Activité récente</h3>
          </div>

          {myOffersLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {feedItems.map((item, i) => {
                const { Icon, bg, color } = activityIcon(item.type)
                return (
                  <div key={i} className="flex items-center gap-3 py-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: bg }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#231F20] leading-snug truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug truncate">{item.sub}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 flex-shrink-0 font-mono italic whitespace-nowrap">
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
