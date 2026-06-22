import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Recycle, Package, BookOpen, Award, Settings, Bell, Search, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { clsx } from 'clsx'

const NAV = [
  { to: '/home', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/collectors', icon: Users, label: 'Collecteurs' },
  { to: '/admin/recyclers', icon: Recycle, label: 'Recycleurs' },
  { to: '/admin/offers', icon: Package, label: 'Offres' },
  { to: '/admin/knowledge', icon: BookOpen, label: 'Savoir-faire' },
  { to: '/admin/badges', icon: Award, label: 'Gestion des Badges' },
  { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
]

export default function AdminLayout() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#f0f9f0] flex flex-col">
      {/* ── Full-width header ── */}
      <header className="h-[96px] bg-[#4d9538] flex items-center sticky top-0 z-40 shadow-md flex-shrink-0">
        {/* Logo block — white background, same width as sidebar */}
        <div
          className="flex-shrink-0 flex items-center justify-center h-full bg-white px-4"
          style={{ width: 240 }}
        >
          {/* Composite logo: icon + text side by side, mirroring the login page asset split */}
          <div className="relative flex items-center" style={{ height: 44, width: 180 }}>
            <img src="/images/recaplink-icon.svg" alt="" aria-hidden className="absolute"
              style={{ left: 0, top: '10.4%', width: '24.2%', height: '89.6%' }} />
            <img src="/images/recaplink-arc-main.svg" alt="" aria-hidden className="absolute"
              style={{ left: '24.7%', top: '0%', width: '54.8%', height: '49%' }} />
            <img src="/images/recaplink-arc-right.svg" alt="" aria-hidden className="absolute"
              style={{ left: '68.9%', top: '10.1%', width: '31.1%', height: '40.2%' }} />
            <img src="/images/recaplink-logo-text.svg" alt="RecapLink" className="absolute"
              style={{ left: '17.5%', top: '38.2%', width: '76.7%', height: '62.5%' }} />
          </div>
        </div>

        {/* Page title + date */}
        <div className="flex-shrink-0 pl-6">
          <p className="text-white font-bold text-lg leading-none">Tableau de bord</p>
          <p className="text-white/60 text-[11px] mt-1 capitalize">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Search bar */}
        <div className="flex-1 mx-6" style={{ maxWidth: 640 }}>
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d9538]" />
            <input
              placeholder="Rechercher ..."
              className="w-full h-10 pl-11 pr-4 bg-white rounded-xl text-sm text-[#231F20] placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bell + User */}
        <div className="flex items-center gap-4 pr-8 flex-shrink-0">
          {/* Notification bell */}
          <div className="relative">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
              <Bell size={22} className="text-white" strokeWidth={1.5} />
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c41539] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              3
            </span>
          </div>

          {/* User profile */}
          <NavLink to="/admin/profile" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/40 overflow-hidden bg-[#c41539] flex-shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-white font-bold text-xs">{user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}</span>
              )}
            </div>
            <span className="text-white font-semibold text-sm hidden xl:block max-w-[140px] truncate">
              {user?.fullName}
            </span>
            <div className="w-6 h-6 bg-[#3a7a2a] rounded-full flex items-center justify-center hidden xl:flex flex-shrink-0">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </NavLink>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className="flex-shrink-0 bg-white border-r border-gray-100 flex flex-col sticky overflow-y-auto"
          style={{ width: 240, top: 96, height: 'calc(100vh - 96px)' }}
        >
          {/* Navigation */}
          <nav className="flex-1 py-5 px-3 space-y-0.5">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-colors group',
                    isActive
                      ? 'text-[#4d9538] font-semibold'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      className={clsx(
                        'flex-shrink-0 transition-colors',
                        isActive ? 'text-[#4d9538]' : 'text-gray-400 group-hover:text-gray-500',
                      )}
                    />
                    <span className="flex-1 leading-tight">{label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4d9538] flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Support widget */}
          <div className="mx-3 mb-3">
            <div className="bg-[#4d9538] rounded-2xl px-4 pt-3 pb-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
              <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white/10 rounded-full pointer-events-none" />
              {/* SVG support illustration — woman with laptop */}
              <div className="relative z-10 flex justify-center mb-2">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Chair / seat */}
                  <ellipse cx="36" cy="62" rx="22" ry="7" fill="rgba(255,255,255,0.15)" />
                  <rect x="22" y="44" width="28" height="18" rx="6" fill="#e07b39" />
                  {/* Body */}
                  <rect x="26" y="28" width="20" height="18" rx="5" fill="#4ade80" />
                  {/* Head */}
                  <circle cx="36" cy="22" r="9" fill="#fcd5a0" />
                  {/* Hair */}
                  <path d="M27 18 Q36 10 45 18 Q44 12 36 11 Q28 12 27 18Z" fill="#231F20" />
                  {/* Laptop */}
                  <rect x="20" y="38" width="32" height="18" rx="3" fill="#231F20" />
                  <rect x="22" y="40" width="28" height="13" rx="2" fill="#6ee7b7" />
                  <rect x="16" y="55" width="40" height="3" rx="1.5" fill="#231F20" />
                  {/* Headset dot */}
                  <circle cx="27" cy="22" r="3" fill="#231F20" />
                  <circle cx="45" cy="22" r="3" fill="#231F20" />
                  <path d="M27 19 Q36 13 45 19" stroke="#231F20" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div className="relative z-10 text-center">
                <p className="text-white/90 text-[10px] leading-snug font-medium">Assistance</p>
                <p className="text-white/70 text-[10px] leading-snug">disponible du 9h à 17h</p>
                <p className="text-white font-bold text-[13px] mt-1">52.056.778</p>
              </div>
            </div>
          </div>

          {/* User card */}
          <div className="border-t border-gray-100">
            <NavLink
              to="/admin/profile"
              className="flex items-center gap-2.5 px-3 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden bg-[#c41539]">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-white font-bold text-[10px]">
                    {user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
                  </span>
                )}
              </div>
              <p className="text-[12px] font-semibold text-[#231F20] truncate flex-1 min-w-0">
                {user?.fullName}
              </p>
              <div className="w-6 h-6 bg-[#4d9538] rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} className="text-white" />
              </div>
            </NavLink>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
