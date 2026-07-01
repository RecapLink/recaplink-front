import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Users, Recycle, Package,
  BookOpen, Award, Settings, Bell, Search, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { SidebarSupport } from '@/components/ui/SidebarSupport'
import { clsx } from 'clsx'

const SIDEBAR_W = 301

const NAV = [
  { to: '/admin/overview',   icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/collectors', icon: Users,           label: 'Collecteurs' },
  { to: '/admin/recyclers',  icon: Recycle,         label: 'Recycleurs' },
  { to: '/admin/offers',     icon: Package,         label: 'Offres' },
  { to: '/admin/knowledge',  icon: BookOpen,        label: 'Savoir-faire' },
  { to: '/admin/badges',     icon: Award,           label: 'Gestion des Badges' },
  { to: '/admin/settings',   icon: Settings,        label: 'Paramètres' },
]

export default function AdminLayout() {
  const { user } = useAuthStore()
  const initials = user?.fullName?.slice(0, 2).toUpperCase() || 'AD'

  return (
    <div className="min-h-screen bg-[#f0f9f0] flex flex-col">

      {/* ── Full-width header ── */}
      <header
        className="h-[96px] bg-[#4d9538] flex items-center sticky top-0 z-40 shadow-md flex-shrink-0"
      >
        {/* Logo block — white, same width as sidebar */}
        <div
          className="flex-shrink-0 flex items-center justify-center h-full bg-white"
          style={{ width: SIDEBAR_W }}
        >
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

        {/* Page title */}
        <div className="flex-shrink-0 pl-6">
          <p className="text-white font-bold text-lg leading-none">Tableau de bord</p>
          <p className="text-white/60 text-[11px] mt-1 capitalize">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* Search */}
        <div className="flex-1 mx-6" style={{ maxWidth: 640 }}>
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d9538]" />
            <input
              placeholder="Rechercher ..."
              className="w-full h-10 pl-11 pr-4 bg-white rounded-xl text-sm text-[#231F20] placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Bell + User */}
        <div className="flex items-center gap-4 pr-8 flex-shrink-0">
          <div className="relative">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
              <Bell size={22} className="text-white" strokeWidth={1.5} />
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c41539] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              3
            </span>
          </div>
          <NavLink to="/admin/profile" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/40 overflow-hidden bg-[#c41539] flex-shrink-0">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                : <span className="text-white font-bold text-xs">{initials}</span>}
            </div>
            <span className="text-white font-semibold text-sm hidden xl:block max-w-[140px] truncate">
              {user?.fullName}
            </span>
          </NavLink>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Sidebar ── */}
        <aside
          className="flex-shrink-0 bg-white flex flex-col sticky overflow-y-auto rounded-br-[40px]"
          style={{ width: SIDEBAR_W, top: 96, height: 'calc(100vh - 96px)' }}
        >
          {/* Navigation */}
          <nav className="flex-1 pt-6 pb-2">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-4 py-[17px] pl-10 pr-6 transition-colors',
                    isActive
                      ? 'text-[#4d9538]'
                      : 'text-[#9CA3AF] hover:text-[#6B7280]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      className={clsx(
                        'flex-shrink-0 transition-colors',
                        isActive ? 'text-[#4d9538]' : 'text-[#BEBEBE]',
                      )}
                    />
                    <span
                      className={clsx(
                        'flex-1 text-sm leading-tight',
                        isActive ? 'font-semibold text-[#4d9538]' : 'font-normal text-[#9CA3AF]',
                      )}
                    >
                      {label}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#4d9538] flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Support illustration + floating bubble */}
          <SidebarSupport />

          {/* Bottom user card */}
          <div
            className="flex-shrink-0 flex items-center gap-3 px-4 py-[14px] rounded-tl-[24px]"
            style={{ backgroundColor: '#1B3A27' }}
          >
            <div className="w-[50px] h-[50px] rounded-full flex-shrink-0 overflow-hidden border-2 border-white/20 bg-[#c41539] flex items-center justify-center">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                : <span className="text-white font-bold text-sm">{initials}</span>}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[13px] leading-tight truncate">
                {user?.fullName || 'Administrateur'}
              </p>
            </div>

            <NavLink
              to="/admin/profile"
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <ChevronRight size={14} className="text-white" strokeWidth={2.5} />
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
