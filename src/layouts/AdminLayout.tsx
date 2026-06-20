import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Recycle, Package, BookOpen, Award, Settings, Bell, Search, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { clsx } from 'clsx'

const NAV = [
  { to: '/admin/overview', icon: LayoutDashboard, label: 'Tableau de bord' },
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
      <header className="h-[68px] bg-[#4d9538] flex items-center gap-3 sticky top-0 z-40 shadow-md flex-shrink-0">
        {/* Logo block — same width as sidebar */}
        <div className="w-[168px] flex-shrink-0 flex items-center gap-2.5 px-5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-[#4d9538] font-black text-[11px] tracking-tight">RL</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-none tracking-wide">RecapLink</p>
          </div>
        </div>

        {/* Title */}
        <div className="flex-shrink-0 pl-1">
          <p className="text-white font-bold text-base leading-none">Tableau de bord</p>
          <p className="text-white/65 text-[11px] mt-0.5 capitalize">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Search — expands */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4d9538]" />
            <input
              placeholder="Rechercher ..."
              className="w-full h-9 pl-9 pr-4 bg-white rounded-lg text-sm text-[#231F20] placeholder-gray-400 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Bell + User */}
        <div className="flex items-center gap-3 pr-6 flex-shrink-0">
          <div className="relative">
            <button className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition-colors">
              <Bell size={17} className="text-white" />
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c41539] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              3
            </span>
          </div>

          <NavLink to="/admin/profile" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/40 overflow-hidden bg-[#c41539] flex-shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-white font-bold text-xs">{user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}</span>
              )}
            </div>
            <span className="text-white font-semibold text-sm hidden xl:block max-w-[120px] truncate">
              {user?.fullName}
            </span>
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hidden xl:flex">
              <ChevronRight size={11} className="text-white" />
            </div>
          </NavLink>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-[168px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto">
          {/* Navigation */}
          <nav className="flex-1 py-4 px-2.5 space-y-0.5">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-[11.5px] font-medium transition-colors group',
                    isActive
                      ? 'text-[#4d9538] font-semibold'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={15}
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
          <div className="mx-2.5 mb-2.5">
            <div className="bg-[#4d9538] rounded-2xl px-3 py-3 relative overflow-hidden">
              <div className="absolute -top-5 -right-5 w-16 h-16 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-white/10 rounded-full" />
              <div className="relative z-10 text-center">
                <p className="text-white/90 text-[10px] leading-snug">Assistance</p>
                <p className="text-white/80 text-[10px] leading-snug">disponible du 9h à 17h</p>
                <p className="text-white font-bold text-[12px] mt-0.5">52.056.778</p>
              </div>
            </div>
          </div>

          {/* User card */}
          <div className="border-t border-gray-100">
            <NavLink
              to="/admin/profile"
              className="flex items-center gap-2 px-3 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-[#c41539] rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">
                  {user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#231F20] truncate flex-1 min-w-0">
                {user?.fullName}
              </p>
              <div className="w-5 h-5 bg-[#4d9538] rounded-full flex items-center justify-center flex-shrink-0">
                <ChevronRight size={10} className="text-white" />
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
