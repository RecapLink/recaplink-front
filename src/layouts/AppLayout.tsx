import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, Package, MessageCircle, BookOpen, Bot, Bell, Settings, User, Search, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useSocketStore } from '@/store/socket.store'
import { useUIStore } from '@/store/ui.store'
import { clsx } from 'clsx'

const NAV_TOP = [
  { to: '/home', icon: Home, label: 'Accueil' },
  { to: '/offers', icon: Package, label: 'Offres' },
  { to: '/messaging', icon: MessageCircle, label: 'Messagerie' },
  { to: '/knowledge', icon: BookOpen, label: 'Savoir-faire' },
  { to: '/chatbot', icon: Bot, label: 'Chatbot' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

const NAV_BOTTOM = [
  { to: '/profile', icon: User, label: 'Profil' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

const PAGE_TITLES: Record<string, string> = {
  '/home': 'Tableau de bord',
  '/offers': 'Offres',
  '/offers/new': 'Nouvelle offre',
  '/offers/mine': 'Mes offres',
  '/messaging': 'Messagerie',
  '/knowledge': 'Savoir-faire',
  '/chatbot': 'Assistant IA',
  '/notifications': 'Notifications',
  '/profile': 'Mon profil',
  '/profile/edit': 'Modifier le profil',
  '/profile/badges': 'Mes badges',
  '/settings': 'Paramètres',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/offers/')) return 'Détail de l\'offre'
  if (pathname.startsWith('/messaging/')) return 'Conversation'
  if (pathname.startsWith('/knowledge/')) return 'Article'
  return 'RecapLink'
}

export default function AppLayout() {
  const { user } = useAuthStore()
  const { unreadCount } = useSocketStore()
  const { dir } = useUIStore()
  const location = useLocation()

  return (
    <div dir={dir} className="min-h-screen bg-[#f0f9f0] flex flex-col">
      {/* ── Full-width header ── */}
      <header className="h-[68px] bg-[#4d9538] flex items-center gap-3 sticky top-0 z-40 shadow-md flex-shrink-0">
        {/* Logo block — same width as sidebar */}
        <div className="w-[200px] flex-shrink-0 flex items-center gap-2.5 px-5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-[#4d9538] font-black text-[11px] tracking-tight">RL</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-none tracking-wide">RecapLink</p>
          </div>
        </div>

        {/* Page title */}
        <div className="flex-shrink-0 pl-1">
          <p className="text-white font-bold text-base leading-none">{getPageTitle(location.pathname)}</p>
          <p className="text-white/65 text-[11px] mt-0.5 capitalize">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4d9538]" />
            <input
              placeholder="Rechercher ..."
              className="w-full h-9 pl-9 pr-4 bg-white rounded-lg text-sm text-[#231F20] placeholder-gray-400 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Bell + user */}
        <div className="flex items-center gap-3 pr-6 flex-shrink-0">
          <NavLink to="/notifications" className="relative">
            <button className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition-colors">
              <Bell size={17} className="text-white" />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c41539] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/profile" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/40 overflow-hidden bg-[#c41539] flex-shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-white font-bold text-xs">{user?.fullName?.slice(0, 2).toUpperCase() || 'U'}</span>
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
        <aside className="w-[200px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto">
          {/* Top nav */}
          <nav className="flex-1 py-4 px-2.5 space-y-0.5">
            {NAV_TOP.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[12px] font-medium transition-colors group',
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
                    {label === 'Messagerie' && unreadCount > 0 && !location.pathname.startsWith('/messaging') && (
                      <span className="w-5 h-5 bg-[#c41539] text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {NAV_BOTTOM.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[12px] font-medium transition-colors group',
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
              to="/profile"
              className="flex items-center gap-2 px-3 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-[#4d9538] rounded-full flex-shrink-0 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover rounded-full" alt="" />
                ) : (
                  <span className="text-white font-bold text-[10px]">
                    {user?.fullName?.slice(0, 2).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#231F20] truncate">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 capitalize truncate">{user?.role}</p>
              </div>
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
