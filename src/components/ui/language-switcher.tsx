import { useUIStore } from '@/store/ui.store'

type LangCode = 'fr' | 'ar' | 'wo'

// Active indicator inset per language (top right bottom left of 181×44px container)
const ACTIVE_POS: Record<LangCode, React.CSSProperties> = {
  fr: { top: '11.54%', right: '68.10%', bottom: '11.54%', left: '3.87%'  },
  ar: { top: '11.54%', right: '36.54%', bottom: '11.54%', left: '35.44%' },
  wo: { top: '11.54%', right: '3.95%',  bottom: '11.54%', left: '68.04%' },
}

function TunisiaFlag() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-[12px]">
      <img src="/images/flag-tn.svg" alt="" className="absolute inset-0 w-full h-full" />
      <div className="absolute" style={{ top: '25%', left: '33.33%', right: '33.33%', bottom: '25%' }}>
        <img src="/images/flag-tn-v1.svg" alt="" className="absolute inset-0 w-full h-full" />
      </div>
      <div className="absolute" style={{ top: '31.25%', left: '37.5%', right: '37.5%', bottom: '31.25%' }}>
        <img src="/images/flag-tn-v2.svg" alt="" className="absolute inset-0 w-full h-full" />
      </div>
      <div className="absolute" style={{ top: '35%', left: '43.33%', right: '36.67%', bottom: '35%' }}>
        <img src="/images/flag-tn-v3.svg" alt="" className="absolute inset-0 w-full h-full" />
      </div>
      <div className="absolute" style={{ top: '39.3%', left: '45.83%', right: '40.6%', bottom: '39.3%' }}>
        <img src="/images/flag-tn-v4.svg" alt="" className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  )
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useUIStore()
  const lang: LangCode = (language as LangCode) in ACTIVE_POS ? (language as LangCode) : 'fr'

  return (
    <div className="relative bg-white rounded-[12px]" style={{ width: '181px', height: '44px' }}>
      {/* Active indicator — green gradient pill, slides to active language */}
      <div
        className="absolute bg-gradient-to-b from-[#e0f4d3] to-[#c9e7b6] rounded-[14px] transition-all duration-200"
        style={ACTIVE_POS[lang]}
      />

      {/* French flag */}
      <button
        onClick={() => setLanguage('fr')}
        className="absolute cursor-pointer"
        style={{ top: '22.73%', left: '7.73%', right: '71.84%', bottom: '20.45%' }}
        aria-label="Français"
      >
        <img src="/images/flag-fr.svg" alt="" className="block w-full h-full" />
      </button>

      {/* Tunisia flag — composite base + crescent + star layers */}
      <button
        onClick={() => setLanguage('ar')}
        className="absolute cursor-pointer"
        style={{ top: '10px', left: '39.21%', right: '40.36%', bottom: '9px' }}
        aria-label="العربية"
      >
        <TunisiaFlag />
      </button>

      {/* Senegal flag */}
      <button
        onClick={() => setLanguage('wo')}
        className="absolute cursor-pointer"
        style={{ top: '20.45%', left: '71.79%', right: '7.77%', bottom: '22.73%' }}
        aria-label="Wolof"
      >
        <img src="/images/flag-wo.svg" alt="" className="block w-full h-full" />
      </button>
    </div>
  )
}
