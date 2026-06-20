import { NavLink, useLocation } from 'react-router-dom'
import { Home, Package, MessageCircle, Settings, User } from 'lucide-react'
import { clsx } from 'clsx'

const TABS = [
  { to: '/home', icon: Home, label: 'Accueil' },
  { to: '/offers', icon: Package, label: 'Offres' },
  { to: '/messaging', icon: MessageCircle, label: 'Messagerie' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
  { to: '/profile', icon: User, label: 'Compte' },
] as const

export function BottomNav() {
  const location = useLocation()
  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[361px] h-[77px] bg-[#4d9538] rounded-[20px] flex items-center px-2 shadow-[var(--shadow-nav)] z-40">
      {TABS.map(({ to, icon: Icon, label }) => {
        const active = location.pathname.startsWith(to)
        return (
          <NavLink key={to} to={to} className="flex-1 flex flex-col items-center justify-center gap-1 py-2">
            <Icon size={22} className={clsx('transition-opacity', active ? 'text-white opacity-100' : 'text-white opacity-50')} />
            <span className={clsx('text-[11px] text-white transition-all', active ? 'font-bold opacity-100' : 'font-normal opacity-50')}>
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
