import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Users, Package, Recycle, Leaf, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const ACTIVITY_MOCK = [
  { icon: Users, color: '#4d9538', title: 'Nouveau collecteur inscrit — Khaled M.', sub: 'Sfax · Plastiques PET & HDPE', time: 'Il y a 8min' },
  { icon: Package, color: '#f59e0b', title: 'Badge "Expert PET" attribué', sub: 'Sara B. — 1 000 kg collectés', time: 'Il y a 22min' },
  { icon: Leaf, color: '#038543', title: 'Nouvelle fiche savoir-faire publiée', sub: 'Traitement du HDPE — par Admin', time: 'Il y a 1h' },
  { icon: Recycle, color: '#3b82f6', title: '3 nouveaux messages chatbot non traités', sub: 'Questions sur les prix du PET', time: 'Il y a 2h' },
  { icon: Users, color: '#c41539', title: 'Signalement utilisateur — Offre #3291', sub: 'Contenu inapproprié · En attente de modération', time: 'Il y a 3h' },
]

function CircularProgress({ value, size = 56, trackColor = 'rgba(255,255,255,0.2)', color = 'white' }: {
  value: number; size?: number; trackColor?: string; color?: string
}) {
  const sw = 5
  const r = (size - sw * 2) / 2
  const circ = r * 2 * Math.PI
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
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
      <span className="absolute font-bold text-xs" style={{ color }}>{value}%</span>
    </div>
  )
}

function StatCard({ bg, title, value, progress, change, changeUp, changeLabel }: {
  bg: string; title: string; value: string | number; progress: number
  change: string; changeUp?: boolean | null; changeLabel: string
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ backgroundColor: bg }}>
      <p className="text-white font-bold text-sm leading-tight">{title}</p>
      <p className="text-white font-extrabold text-3xl leading-none">{value}</p>
      <div className="flex items-end justify-between mt-auto">
        <div className="flex items-center gap-1.5">
          {changeUp === true && <ArrowUpRight size={13} className="text-white/80" />}
          {changeUp === false && <ArrowDownRight size={13} className="text-white/80" />}
          {changeUp === null && <Minus size={13} className="text-white/80" />}
          <span className="text-white/80 text-xs">{change} {changeLabel}</span>
        </div>
        <CircularProgress value={progress} />
      </div>
    </div>
  )
}

const STAT_CARDS = [
  { bg: '#4d9538', title: 'kg recyclés ce mois', value: '12 480', progress: 75, change: '18%', changeUp: true, changeLabel: 'vs mois dernier' },
  { bg: '#c41539', title: 'Offres actives', value: '247', progress: 50, change: '12%', changeUp: true, changeLabel: 'vs mois dernier' },
  { bg: '#231F20', title: 'Collecteurs actifs', value: '84', progress: 25, change: '5 nouveaux', changeUp: false, changeLabel: 'Collecteurs' },
  { bg: '#f5c518', title: 'Recycleurs actifs', value: '150', progress: 75, change: '30 nouveaux', changeUp: true, changeLabel: 'Collecteurs' },
]

const PLASTIC_TYPES = [
  { name: 'PET', pct: 40, bar: '#4d9538', count: 112 },
  { name: 'HDPE', pct: 24, bar: '#c41539', count: 60 },
  { name: 'PP', pct: 18, bar: '#231F20', count: 29 },
  { name: 'PVC', pct: 14, bar: '#c41539', count: 16 },
  { name: 'Autres', pct: 4, bar: '#9ca3af', count: 9 },
]

export default function AdminOverviewPage() {
  const { data: overview } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminApi.overview().then(r => r.data.data),
  })

  const { data: regData } = useQuery({
    queryKey: ['admin', 'registrations'],
    queryFn: () => adminApi.registrationsByMonth().then(r => r.data.data || []),
  })

  const { data: zoneData } = useQuery({
    queryKey: ['admin', 'zones'],
    queryFn: () => adminApi.collectionsByZone().then(r => r.data.data || []),
  })

  const monthlyData = (regData || []).map((d: Record<string, unknown>) => ({
    name: MONTH_LABELS[
      typeof d._id === 'object' && d._id !== null && 'month' in d._id
        ? (d._id as { month: number }).month - 1
        : 0
    ] || String(d._id),
    count: (d.count as number) || (d.collecteurs as number) || 0,
  }))

  const zoneRows = ((zoneData || []) as Record<string, unknown>[]).slice(0, 6).map(d => ({
    zone: String(d._id || '—'),
    kg: (d.totalKg as number) || 0,
  }))

  void overview // stats used in static fallback only

  return (
    <div className="space-y-5">
      {/* ── Top row: 4 stat cards (left 2/3) + plastic types (right 1/3) ── */}
      <div className="grid grid-cols-3 gap-5">
        {/* Stat cards: 2 rows × 2 cols */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {STAT_CARDS.map(card => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* Plastic types */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-[#231F20] text-sm">Types de plastique Par Offres</h3>
          <div className="grid grid-cols-2 gap-2">
            {PLASTIC_TYPES.slice(0, 4).map(p => (
              <div key={p.name} className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-xs font-bold text-[#231F20]">{p.name} — {p.pct}%</p>
                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.bar }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  <span className="font-semibold text-[#231F20]">{p.count}</span> sur 247 Offres
                </p>
              </div>
            ))}
          </div>
          {/* Autres chip */}
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gray-400" style={{ width: '4%' }} />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Autres — 4%</span>
          </div>
          {/* Mini legend */}
          <div className="space-y-1 pt-1">
            {PLASTIC_TYPES.map(p => (
              <div key={p.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.bar }} />
                <span className="text-[10px] text-gray-600">{p.name} — {p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Activity (left 1/2) + Charts (right 1/2) ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Activité récente */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#231F20] text-sm">Activité récente</h3>
            <button className="text-xs text-[#4d9538] font-semibold hover:underline">Tout voir</button>
          </div>
          <div className="space-y-3">
            {ACTIVITY_MOCK.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <Icon size={14} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#231F20] leading-snug">{item.title}</p>
                    <p className="text-[10px] text-gray-400 leading-snug">{item.sub}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap">{item.time}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          {/* Collectes par zone */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#231F20] text-sm">Collectes par zone</h3>
              <span className="text-[10px] text-gray-400 font-medium">Mai 2026</span>
            </div>
            {zoneRows.length > 0 ? (
              <div className="space-y-1.5">
                {zoneRows.map(row => (
                  <div key={row.zone} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-16 truncate">{row.zone}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4d9538]"
                        style={{ width: `${Math.min(100, (row.kg / Math.max(...zoneRows.map(z => z.kg), 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 w-16 text-right">{row.kg.toLocaleString()} kg</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Static fallback matching Figma */
              <div className="space-y-1.5">
                {[
                  { zone: 'Sousse', kg: 3846 },
                  { zone: 'Tunis', kg: 3200 },
                  { zone: 'Sfax', kg: 2440 },
                  { zone: 'Monastir', kg: 1600 },
                  { zone: 'Autres', kg: 1400 },
                ].map(row => (
                  <div key={row.zone} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-16 truncate">{row.zone}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4d9538]"
                        style={{ width: `${(row.kg / 3846) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 w-16 text-right">{row.kg.toLocaleString()} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inscriptions mensuelles */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#231F20] text-sm">Inscriptions mensuelles</h3>
              <span className="text-[10px] text-gray-400 font-medium">Mai 2026</span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart
                data={monthlyData.length > 0 ? monthlyData : MONTH_LABELS.map((m, i) => ({ name: m, count: 20 + i * 8 }))}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d9538" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4d9538" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="count" stroke="#4d9538" fill="url(#regGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
