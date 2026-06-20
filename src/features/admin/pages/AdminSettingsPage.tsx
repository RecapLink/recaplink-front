import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '@/lib/api/admin.api'
import { useAuthStore } from '@/store/auth.store'
import { User, Bell, Globe, Shield, MessageSquare, Award, BarChart2, LogOut } from 'lucide-react'
import i18n from '@/i18n'

const SUB_NAV = [
  { key: 'profile', icon: User, label: 'Profil administrateur', color: '#4d9538' },
  { key: 'notifications', icon: Bell, label: 'Notifications', color: '#4d9538' },
  { key: 'language', icon: Globe, label: 'Langue & Région', color: '#4d9538' },
  { key: 'security', icon: Shield, label: 'Sécurité', color: '#4d9538' },
  { key: 'chatbot', icon: MessageSquare, label: 'Chatbot Ai', color: '#4d9538' },
  { key: 'autobadge', icon: Award, label: 'Badges auto', color: '#4d9538' },
  { key: 'reports', icon: BarChart2, label: 'Rapports', color: '#4d9538' },
  { key: 'logout', icon: LogOut, label: 'Déconnexion', color: '#c41539' },
]

const NOTIF_ITEMS = [
  { key: 'newSignalement', label: 'Nouveau signalement', desc: 'Alerte immédiate pour tout signalement' },
  { key: 'newInscription', label: 'Nouvelles inscriptions', desc: 'collecteurs & recylceurs en attente' },
  { key: 'chatbotEscalade', label: 'Chatbot : escapade', desc: 'Conversations nécessitant une intervention humaine' },
  { key: 'rapportsHebdo', label: 'Rapports hemdomadaires', desc: 'Résumé automatique chaque lundi' },
  { key: 'alertePerformance', label: 'Alerte de performance', desc: 'Indicateurs en dehors des seuils normaux' },
]

type NotifPrefs = Record<string, boolean>

export default function AdminSettingsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [section, setSection] = useState('profile')
  const [lang, setLang] = useState(i18n.language)

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    newSignalement: true,
    newInscription: true,
    chatbotEscalade: true,
    rapportsHebdo: true,
    alertePerformance: false,
  })

  const { mutate: savePrefs } = useMutation({
    mutationFn: () => adminApi.updateNotifPrefs(notifPrefs),
  })

  const handleNavClick = (key: string) => {
    if (key === 'logout') {
      logout()
      navigate('/login')
      return
    }
    setSection(key)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#231F20]">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configuration de la plateforme et du compte</p>
      </div>

      <div className="flex gap-5">
        {/* Sub-navigation card */}
        <div className="w-48 flex-shrink-0 bg-white rounded-2xl p-2 border border-gray-100 shadow-sm self-start">
          <nav className="space-y-0.5">
            {SUB_NAV.map(({ key, icon: Icon, label, color }) => (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                  section === key && key !== 'logout'
                    ? 'bg-[#ebf5ea] text-[#4d9538] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={key === 'logout' ? { color } : undefined}
              >
                <Icon size={14} style={{ color: section === key && key !== 'logout' ? '#4d9538' : key === 'logout' ? color : '#9ca3af' }} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1 space-y-4">
          {/* Profile section */}
          {section === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-[#231F20]">Profil administrateur</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Nom complet</label>
                    <input
                      value={form.fullName}
                      onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-[#231F20] bg-gray-50 outline-none focus:border-[#4d9538]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Nom d'utilisateur</label>
                    <input
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-[#231F20] bg-gray-50 outline-none focus:border-[#4d9538]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <input
                      value={form.email}
                      readOnly
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Numéro de téléphone</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-[#231F20] bg-gray-50 outline-none focus:border-[#4d9538]"
                    />
                  </div>
                </div>
                <button className="mt-4 bg-[#4d9538] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#038543] transition-colors">
                  Enregistrer les modifications
                </button>
              </div>

              {/* Notifications block below profile */}
              <div className="p-5 border-t border-gray-100">
                <h2 className="font-bold text-[#231F20] mb-4">Notification administrateur</h2>
                <div className="space-y-0 divide-y divide-gray-100">
                  {NOTIF_ITEMS.map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-[#231F20]">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${notifPrefs[key] ? 'bg-[#4d9538]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${notifPrefs[key] ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-[#231F20]">Préférences de notifications</h2>
              </div>
              <div className="p-5 divide-y divide-gray-100">
                {NOTIF_ITEMS.map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-[#231F20]">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${notifPrefs[key] ? 'bg-[#4d9538]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${notifPrefs[key] ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => savePrefs()} className="bg-[#4d9538] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#038543] transition-colors">
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {section === 'language' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-[#231F20] mb-4">Langue & Région</h2>
              <div className="grid grid-cols-3 gap-3 max-w-sm">
                {[
                  { code: 'fr', label: 'Français', flag: '🇫🇷' },
                  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
                  { code: 'wo', label: 'Wolof', flag: '🇸🇳' },
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); i18n.changeLanguage(l.code) }}
                    className={`py-3 rounded-xl text-sm font-medium flex flex-col items-center gap-1 transition-colors border ${
                      lang === l.code ? 'bg-[#4d9538] text-white border-[#4d9538]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#4d9538]'
                    }`}
                  >
                    <span className="text-xl">{l.flag}</span>
                    <span className="text-xs">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {section === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-[#231F20]">Sécurité du compte</h2>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-[#231F20]">{user?.email}</p>
              </div>
              <button className="border border-gray-200 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-[#4d9538] hover:text-[#4d9538] transition-colors">
                Changer le mot de passe
              </button>
            </div>
          )}

          {(section === 'chatbot' || section === 'autobadge' || section === 'reports') && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-14 h-14 bg-[#ebf5ea] rounded-2xl flex items-center justify-center mx-auto mb-3">
                {section === 'chatbot' && <MessageSquare size={24} className="text-[#4d9538]" />}
                {section === 'autobadge' && <Award size={24} className="text-[#4d9538]" />}
                {section === 'reports' && <BarChart2 size={24} className="text-[#4d9538]" />}
              </div>
              <p className="font-bold text-[#231F20]">
                {section === 'chatbot' ? 'Chatbot IA' : section === 'autobadge' ? 'Badges automatiques' : 'Rapports'}
              </p>
              <p className="text-sm text-gray-400 mt-1">Section en cours de développement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
