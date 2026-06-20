import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Globe, Bell, Shield, Info, ChevronRight } from 'lucide-react'
import i18n from '@/i18n'

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
  { code: 'wo', label: 'Wolof', flag: '🇸🇳' },
]

interface NotifPrefs {
  new_offers: boolean
  messages: boolean
  system: boolean
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
        checked ? 'bg-[#4d9538]' : 'bg-gray-200'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
          checked ? 'right-0.5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [lang, setLang] = useState(i18n.language)
  const [notifs, setNotifs] = useState<NotifPrefs>({
    new_offers: true,
    messages: true,
    system: true,
  })

  const changeLang = (code: string) => {
    setLang(code)
    i18n.changeLanguage(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
  }

  const toggleNotif = (key: keyof NotifPrefs) => {
    setNotifs(n => ({ ...n, [key]: !n[key] }))
  }

  const notifItems: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: 'new_offers', label: 'Nouvelles offres', desc: 'Alertes pour les offres proches de vous' },
    { key: 'messages', label: 'Messages', desc: 'Nouveaux messages reçus' },
    { key: 'system', label: 'Système', desc: 'Mises à jour importantes de la plateforme' },
  ]

  const accountItems = [
    { label: 'Modifier le profil', path: '/profile/edit' },
    { label: 'Changer le mot de passe', path: '/forgot-password' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#231F20]">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez vos préférences et votre compte</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left column */}
        <div className="col-span-2 space-y-4">
          {/* Language */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-[#ebf5ea] rounded-lg flex items-center justify-center">
                <Globe size={16} className="text-[#4d9538]" />
              </div>
              <h2 className="font-bold text-[#231F20]">Langue</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className={`py-4 rounded-xl text-sm font-medium transition-colors flex flex-col items-center gap-2 ${
                    lang === l.code
                      ? 'bg-[#4d9538] text-white shadow-sm'
                      : 'bg-gray-50 text-[#231F20] hover:bg-[#ebf5ea]'
                  }`}
                >
                  <span className="text-2xl">{l.flag}</span>
                  <span className="text-xs font-semibold">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-[#ebf5ea] rounded-lg flex items-center justify-center">
                <Bell size={16} className="text-[#4d9538]" />
              </div>
              <h2 className="font-bold text-[#231F20]">Notifications</h2>
            </div>
            <div className="space-y-3">
              {notifItems.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#231F20]">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-[#ebf5ea] rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-[#4d9538]" />
              </div>
              <h2 className="font-bold text-[#231F20]">Compte</h2>
            </div>
            <div className="space-y-1">
              {accountItems.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="flex-1 text-sm text-[#231F20]">{label}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* User card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-16 h-16 bg-[#4d9538] rounded-2xl flex items-center justify-center mx-auto mb-3">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
              ) : (
                <span className="text-white font-black text-xl">
                  {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-[#231F20]">{user?.fullName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 text-[11px] font-bold bg-[#ebf5ea] text-[#4d9538] px-2.5 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#ebf5ea] rounded-lg flex items-center justify-center">
                <Info size={14} className="text-[#4d9538]" />
              </div>
              <h2 className="font-bold text-sm text-[#231F20]">À propos</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Version', value: '1.0.0' },
                { label: 'Plateforme', value: 'RecapLink' },
                { label: 'Année', value: '© 2025' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-500">{row.label}</span>
                  <span className="text-xs font-semibold text-[#231F20]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="bg-[#f0f9f0] rounded-2xl border border-[#4d9538]/20 p-5 text-center">
            <p className="font-bold text-sm text-[#4d9538] mb-1">Besoin d'aide ?</p>
            <p className="text-xs text-gray-500 mb-3">Notre équipe est disponible pour vous assister</p>
            <button
              onClick={() => navigate('/chatbot')}
              className="w-full text-xs font-semibold bg-[#4d9538] text-white py-2.5 rounded-xl hover:bg-[#038543] transition-colors"
            >
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
