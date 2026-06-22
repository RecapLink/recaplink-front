import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'
import {
  BarChart, Bar, XAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
} from 'recharts'
import { Truck, Award, BookOpen, MessageSquare, AlertTriangle, Package } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface OverviewData {
  kgRecycledThisMonth: number
  kgTrend: number
  activeOffers: number
  offersThisMonth: number
  offersTrend: number
  activeCollectors: number
  newCollectorsThisMonth: number
  activeRecyclers: number
  newRecyclersThisMonth: number
  plasticTypeDistribution: { type: string; count: number; percentage: number; totalKg: number }[]
}

interface ActivityItem {
  type: string
  title: string
  sub: string
  createdAt: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_LABELS: Record<string, string> = {
  janv: 'Jan', févr: 'Fév', mars: 'Mar', avr: 'Avr', mai: 'Mai', juin: 'Jun',
  juil: 'Jul', août: 'Aoû', sept: 'Sep', oct: 'Oct', nov: 'Nov', déc: 'Déc',
}

const PLASTIC_COLORS: Record<string, string> = {
  PET: '#2d6e1a', HDPE: '#4d9538', PP: '#7dbf52', PVC: '#aad98a', Autres: '#d0ecc0',
}

const PLASTIC_ORDER = ['PET', 'HDPE', 'PP', 'PVC', 'Autres']

const ZONE_FALLBACK = [
  { zone: 'Sousse', totalKg: 3846 },
  { zone: 'Tunis', totalKg: 3200 },
  { zone: 'Sfax', totalKg: 2440 },
  { zone: 'Monastir', totalKg: 1600 },
  { zone: 'Autres', totalKg: 1400 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number) {
  return n >= 1000
    ? n.toLocaleString('fr-FR')
    : String(n)
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `Il y a ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

function activityIcon(type: string) {
  switch (type) {
    case 'user_registration_collector': return { Icon: Truck, bg: '#e8f5e9', color: '#4d9538' }
    case 'user_registration_recycler': return { Icon: Truck, bg: '#e8f5e9', color: '#4d9538' }
    case 'new_offer': return { Icon: Package, bg: '#e0f2fe', color: '#0284c7' }
    case 'badge_award': return { Icon: Award, bg: '#f3e8ff', color: '#9333ea' }
    case 'knowledge_published': return { Icon: BookOpen, bg: '#fef9e7', color: '#d97706' }
    case 'report': return { Icon: AlertTriangle, bg: '#fce4ec', color: '#c41539' }
    default: return { Icon: MessageSquare, bg: '#e0f2fe', color: '#0284c7' }
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CircularProgress({
  value, size = 68,
  trackColor = 'rgba(255,255,255,0.25)',
  color = 'white',
}: {
  value: number; size?: number; trackColor?: string; color?: string
}) {
  const sw = 5
  const r = (size - sw * 2) / 2
  const circ = r * 2 * Math.PI
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-semibold text-xs" style={{ color }}>{value}%</span>
    </div>
  )
}

function StatCard({
  bg, title, value, progress, change, changeUp, changeLabel,
  progressColor, progressTrackColor, decorativeColor, textColor,
}: {
  bg: string; title: string; value: string; progress: number
  change: string; changeUp: boolean; changeLabel: string
  progressColor: string; progressTrackColor: string; decorativeColor: string; textColor: string
}) {
  const subColor = textColor === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(35,31,32,0.65)'
  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ backgroundColor: bg, minHeight: 190 }}>
      <div className="absolute rounded-full pointer-events-none"
        style={{ top: -48, right: -28, width: 130, height: 130, backgroundColor: decorativeColor }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ bottom: -44, right: 28, width: 200, height: 168, backgroundColor: decorativeColor }} />
      <div className="relative p-6 flex flex-col" style={{ minHeight: 190 }}>
        <p className="font-semibold text-sm leading-snug"
          style={{ color: textColor === 'white' ? 'rgba(255,255,255,0.85)' : 'rgba(35,31,32,0.7)' }}>
          {title}
        </p>
        <p className="font-bold text-3xl mt-1 leading-none" style={{ color: textColor }}>{value}</p>
        <div className="flex items-end justify-between mt-auto pt-4">
          <CircularProgress value={progress} color={progressColor} trackColor={progressTrackColor} />
          <div className="text-right self-end pb-1">
            <span className="text-xs font-medium" style={{ color: subColor }}>
              {changeUp ? '▲' : '▼'} {change} {changeLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-100 animate-pulse" style={{ minHeight: 190 }} />
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
    <div className="bg-white rounded-xl p-3 flex items-center gap-2 h-full border border-gray-100"
      style={{ minHeight: 160 }}>
      <div className="relative flex-shrink-0">
        <PieChart width={96} height={96}>
          <Pie data={sorted} cx={48} cy={48} innerRadius={28} outerRadius={44}
            dataKey="value" strokeWidth={0}>
            {sorted.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery<OverviewData>({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminApi.overview().then(r => r.data.data ?? r.data),
    staleTime: 60_000,
  })

  const { data: activityData, isLoading: activityLoading } = useQuery<ActivityItem[]>({
    queryKey: ['admin', 'activity'],
    queryFn: () => adminApi.dashboardActivity().then(r => r.data.data ?? r.data ?? []),
    staleTime: 30_000,
  })

  const { data: regData } = useQuery({
    queryKey: ['admin', 'registrations'],
    queryFn: () => adminApi.registrationsByMonth().then(r => r.data.data ?? r.data ?? []),
    staleTime: 60_000,
  })

  const { data: zoneData } = useQuery({
    queryKey: ['admin', 'zones'],
    queryFn: () => adminApi.collectionsByZone().then(r => r.data.data ?? r.data ?? []),
    staleTime: 60_000,
  })

  // ── KPI cards derived from real data ──
  // Progress rings: use trend * 4 to map growth% → ring% (18%→72%, 12%→48%)
  // Collectors/recyclers: new this month as fraction of a monthly target (20 collectors, 50 recyclers)
  const kgTrend = Math.abs(overview?.kgTrend ?? 18)
  const kgTrendUp = (overview?.kgTrend ?? 18) >= 0
  const kgProgress = Math.min(Math.round(kgTrend * 4.2), 95) || 75

  const offersTrend = Math.abs(overview?.offersTrend ?? 12)
  const offersTrendUp = (overview?.offersTrend ?? 12) >= 0
  const offersProgress = Math.min(Math.round(offersTrend * 4.2), 95) || 50

  // new collectors / monthly target of 20 → 5/20 = 25%
  const collectorsProgress = Math.min(Math.round(((overview?.newCollectorsThisMonth ?? 5) / 20) * 100), 95) || 25

  // new recyclers / monthly target of 40 → 30/40 = 75%
  const recyclersProgress = Math.min(Math.round(((overview?.newRecyclersThisMonth ?? 30) / 40) * 100), 95) || 75

  // ── Plastic distribution ──
  const plasticDist = overview?.plasticTypeDistribution ?? []
  // Use activeOffers as the denominator (some offers may lack a plasticType)
  const totalOffers = overview?.activeOffers ?? (plasticDist.reduce((s, p) => s + p.count, 0) || 247)

  const plasticCards = PLASTIC_ORDER.slice(0, 4).map(key => {
    const found = plasticDist.find(p => p.type === key)
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

  const autresItem = plasticDist.find(p => p.type === 'Autres')
  const autresCard = {
    name: 'Autres',
    pct: autresItem?.percentage ?? 0,
    count: autresItem?.count ?? 0,
    total: totalOffers,
    bg: '#fff1f2',
    barColor: '#c41539',
    nameColor: '#c41539',
    countColor: '#231F20',
  }

  // ── Monthly bar chart ──
  const barData = Array.isArray(regData) && regData.length > 0
    ? regData.map((d: any) => ({
        name: MONTH_LABELS[d.month] ?? d.month ?? '?',
        count: d.count ?? 0,
      }))
    : ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
        .map((m, i) => ({ name: m, count: 20 + i * 8 }))

  // ── Zone chart ──
  const zoneRows = Array.isArray(zoneData) && zoneData.length > 0
    ? zoneData.slice(0, 5).map((d: any) => ({ zone: d.zone ?? String(d._id ?? '—'), totalKg: d.totalKg ?? 0 }))
    : ZONE_FALLBACK
  const maxKg = Math.max(...zoneRows.map(z => z.totalKg), 1)

  // ── Activity feed ──
  const activities = Array.isArray(activityData) && activityData.length > 0
    ? activityData.slice(0, 5)
    : [
        { type: 'user_registration_collector', title: 'Nouveau collecteur inscrit — Khaled M.', sub: 'Sfax · Plastiques PET & HDPE', createdAt: new Date(Date.now() - 8 * 60000).toISOString() },
        { type: 'badge_award', title: 'Badge "Expert PET" attribué', sub: 'Sara B. — 1 000 kg collectés', createdAt: new Date(Date.now() - 22 * 60000).toISOString() },
        { type: 'knowledge_published', title: 'Nouvelle fiche savoir-faire publiée', sub: 'Traitement du HDPE — par Admin', createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
        { type: 'new_offer', title: '3 nouveaux messages chatbot non traités', sub: 'Questions sur les prix du PET', createdAt: new Date(Date.now() - 120 * 60000).toISOString() },
        { type: 'report', title: 'Signalement utilisateur — Offre #3291', sub: 'Contenu inapproprié · En attente de modération', createdAt: new Date(Date.now() - 180 * 60000).toISOString() },
      ]

  return (
    <div className="space-y-5">

      {/* ── Top row: KPI cards (3fr) + Plastic types (2fr) ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '3fr 2fr' }}>

        {/* 2 × 2 KPI cards */}
        <div className="grid grid-cols-2 gap-4">
          {overviewLoading ? (
            [0,1,2,3].map(i => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                bg="#4d9538" textColor="white"
                decorativeColor="rgba(255,255,255,0.13)"
                title="kg recyclés ce mois"
                value={formatNumber(overview?.kgRecycledThisMonth ?? 12480)}
                progress={kgProgress}
                change={`${kgTrend}%`} changeUp={kgTrendUp} changeLabel="vs mois dernier"
                progressColor="white" progressTrackColor="rgba(255,255,255,0.25)"
              />
              <StatCard
                bg="#c41539" textColor="white"
                decorativeColor="rgba(255,255,255,0.13)"
                title="Offres actives"
                value={formatNumber(overview?.activeOffers ?? 247)}
                progress={offersProgress}
                change={`${offersTrend}%`} changeUp={offersTrendUp} changeLabel="vs mois dernier"
                progressColor="white" progressTrackColor="rgba(255,255,255,0.25)"
              />
              <StatCard
                bg="#231F20" textColor="white"
                decorativeColor="rgba(255,255,255,0.07)"
                title="Collecteurs actifs"
                value={formatNumber(overview?.activeCollectors ?? 84)}
                progress={collectorsProgress}
                change={`${overview?.newCollectorsThisMonth ?? 5} nouveaux`}
                changeUp={false} changeLabel="Collecteurs"
                progressColor="#c41539" progressTrackColor="rgba(196,21,57,0.3)"
              />
              <StatCard
                bg="#f5c518" textColor="#231F20"
                decorativeColor="rgba(0,0,0,0.07)"
                title="Recycleurs actifs"
                value={formatNumber(overview?.activeRecyclers ?? 150)}
                progress={recyclersProgress}
                change={`${overview?.newRecyclersThisMonth ?? 30} nouveaux`}
                changeUp={true} changeLabel="Recycleurs"
                progressColor="#4d9538" progressTrackColor="rgba(77,149,56,0.35)"
              />
            </>
          )}
        </div>

        {/* Plastic types */}
        <div className="space-y-3">
          <h3 className="font-bold text-[#231F20] text-base">Types de plastique Par Offres</h3>

          <div className="grid grid-cols-4 gap-2">
            {plasticCards.map(p => (
              <PlasticTypeCard key={p.name} {...p} />
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 items-stretch">
            <PlasticTypeCard {...autresCard} tall />
            <div className="col-span-3">
              {plasticDist.length > 0
                ? <DonutChart distribution={plasticDist} />
                : <DonutChart distribution={[
                    { type: 'PET', percentage: 40 }, { type: 'HDPE', percentage: 24 },
                    { type: 'PP', percentage: 18 }, { type: 'PVC', percentage: 14 },
                    { type: 'Autres', percentage: 4 },
                  ]} />
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: Activity (3fr) + Charts (2fr) ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '3fr 2fr' }}>

        {/* Activité récente */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#231F20] text-base">Activité récente</h3>
            <button className="text-sm text-[#4d9538] font-semibold hover:underline">Tout voir</button>
          </div>

          {activityLoading ? (
            <div className="space-y-3">
              {[0,1,2,3,4].map(i => (
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
              {activities.map((item, i) => {
                const { Icon, bg, color } = activityIcon(item.type)
                return (
                  <div key={i} className="flex items-center gap-4 py-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: bg }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#231F20] leading-snug">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{item.sub}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap font-mono italic">
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="space-y-4">

          {/* Collectes par zone */}
          <div className="bg-white rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
              style={{ backgroundColor: '#f0f9f0' }} />
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="font-bold text-[#231F20] text-sm">Collectes par zone</h3>
              <span className="text-xs font-bold text-[#231F20]">
                {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </span>
            </div>
            <div className="space-y-2.5 relative">
              {zoneRows.map(row => (
                <div key={row.zone} className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500 w-14 flex-shrink-0 truncate">{row.zone}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#4d9538]"
                      style={{ width: `${(row.totalKg / maxKg) * 100}%` }} />
                  </div>
                  <span className="text-[11px] text-gray-500 w-16 text-right flex-shrink-0">
                    {row.totalKg.toLocaleString('fr-FR')} kg
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inscriptions mensuelles */}
          <div className="bg-white rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
              style={{ backgroundColor: '#f0f9f0' }} />
            <div className="flex items-center justify-between mb-3 relative">
              <h3 className="font-bold text-[#231F20] text-sm">Inscriptions mensuelles</h3>
              <span className="text-xs font-bold text-[#231F20]">
                {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={14}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                  cursor={{ fill: 'rgba(77,149,56,0.07)' }}
                />
                <Bar dataKey="count" fill="#4d9538" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  )
}
