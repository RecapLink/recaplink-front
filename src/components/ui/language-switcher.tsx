import { useUIStore } from '@/store/ui.store'

const LANGS = [
  { code: 'fr', label: '🇫🇷' },
  { code: 'ar', label: '🇹🇳' },
  { code: 'wo', label: '🇸🇳' },
] as const

export function LanguageSwitcher() {
  const { language, setLanguage } = useUIStore()
  return (
    <div className="flex bg-white rounded-[12px] p-1 gap-1 shadow-sm">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={`w-10 h-8 rounded-[8px] text-lg transition-all ${language === l.code ? 'bg-gradient-to-b from-[#e0f4d3] to-[#c9e7b6] shadow-sm' : 'hover:bg-gray-100'}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
