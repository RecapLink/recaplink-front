import { ReactNode } from 'react'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

interface Props {
  children: ReactNode
}

export function AuthPageShell({ children }: Props) {
  return (
    <div className="min-h-dvh flex">

      {/* ── Left panel — identical to Login page ── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden flex-shrink-0">
        <img src="/images/login-bg.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#4d9538] mix-blend-hard-light pointer-events-none" />
        <div className="absolute rounded-full bg-white/25" style={{ top: '-9.58%', left: '-1.49%', width: '40.6%', aspectRatio: '1' }} />
        <div className="absolute rounded-full bg-white/25" style={{ top: '91.85%', left: '89%', width: '14%', aspectRatio: '1' }} />
        <div className="absolute rounded-full bg-white/25" style={{ top: '86.39%', left: '1.49%', width: '7%', aspectRatio: '1' }} />
        <div className="absolute rounded-full bg-white/25" style={{ top: '1.43%', left: '4.92%', width: '14%', aspectRatio: '1' }} />
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col min-h-dvh bg-white">

        {/* Branding — logo + language switcher */}
        <div className="flex flex-col items-center px-8 pt-[8%] gap-4">
          <div className="relative w-full max-w-[490px]" style={{ aspectRatio: '554 / 144' }}>
            <img src="/images/recaplink-arc-main.svg" alt="" aria-hidden className="absolute pointer-events-none" style={{ left: '24.7%', top: '0%', width: '54.8%', height: '49%' }} />
            <img src="/images/recaplink-arc-right.svg" alt="" aria-hidden className="absolute pointer-events-none" style={{ left: '68.9%', top: '10.1%', width: '31.1%', height: '40.2%' }} />
            <img src="/images/recaplink-icon.svg" alt="" className="absolute" style={{ left: '0%', top: '10.4%', width: '24.2%', height: '89.6%' }} />
            <img src="/images/recaplink-logo-text.svg" alt="RecapLink" className="absolute" style={{ left: '17.5%', top: '38.2%', width: '76.7%', height: '62.5%' }} />
          </div>
          <LanguageSwitcher />
        </div>

        {/* Page content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {children}
        </div>

        {/* Footer */}
        <div className="py-5 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
          <p className="text-[16px] text-black">RecapLink © 2026</p>
          <p className="text-[16px] text-black">
            Développé par{' '}
            <a href="https://ufuk.tn/" target="_blank" rel="noopener noreferrer" className="underline decoration-solid">UFUK CONNECT</a>
          </p>
        </div>

      </div>
    </div>
  )
}
