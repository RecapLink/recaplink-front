import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

type FormData = { email: string; password: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const { t } = useTranslation('auth')

  const schema = z.object({
    email: z.string().min(1, t('login.email_required')),
    password: z.string().min(1, t('login.password_required')),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => authApi.login(data).then(r => r.data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data
      setAuth(user, accessToken)
      navigate('/home')
    },
  })

  return (
    <div className="min-h-dvh flex">

      {/* ── LEFT PANEL — photo + green overlay (desktop only) ── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden flex-shrink-0">
        <img src="/images/login-bg.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#4d9538] mix-blend-hard-light pointer-events-none" />
        <div className="absolute rounded-full bg-white/25" style={{ top: '-9.58%', left: '-1.49%', width: '40.6%', aspectRatio: '1' }} />
        <div className="absolute rounded-full bg-white/25" style={{ top: '91.85%', left: '89%', width: '14%', aspectRatio: '1' }} />
        <div className="absolute rounded-full bg-white/25" style={{ top: '86.39%', left: '1.49%', width: '7%', aspectRatio: '1' }} />
        <div className="absolute rounded-full bg-white/25" style={{ top: '1.43%', left: '4.92%', width: '14%', aspectRatio: '1' }} />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col min-h-dvh bg-white">

        {/* ── Branding header ── */}
        <div className="flex flex-col items-center px-8 pt-[11%] gap-3">
          <div className="relative w-full max-w-[490px]" style={{ aspectRatio: '554 / 144' }}>
            <img src="/images/recaplink-arc-main.svg" alt="" aria-hidden className="absolute pointer-events-none" style={{ left: '24.7%', top: '0%', width: '54.8%', height: '49%' }} />
            <img src="/images/recaplink-arc-right.svg" alt="" aria-hidden className="absolute pointer-events-none" style={{ left: '68.9%', top: '10.1%', width: '31.1%', height: '40.2%' }} />
            <img src="/images/recaplink-icon.svg" alt="" className="absolute" style={{ left: '0%', top: '10.4%', width: '24.2%', height: '89.6%' }} />
            <img src="/images/recaplink-logo-text.svg" alt="RecapLink" className="absolute" style={{ left: '17.5%', top: '38.2%', width: '76.7%', height: '62.5%' }} />
          </div>

          <h2 className="font-bold text-2xl text-black text-center leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
            {t('login.welcome')}
          </h2>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <p className="text-[14px] text-black text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t('login.bbw_line')}
            </p>
            <img src="/images/bbw_international.svg" alt="BBW International" className="h-7 w-auto flex-shrink-0" />
          </div>

          <LanguageSwitcher />
        </div>

        {/* ── Form ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-[520px]">

            <h1 className="text-[40px] font-bold text-black text-center leading-none mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t('login.title')}
            </h1>

            <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-4">

              <div>
                <input
                  type="email"
                  placeholder={t('login.email')}
                  {...register('email')}
                  className="w-full h-[56px] px-5 border-2 border-[#4d9538] rounded-[10px] text-[16px] text-[#231F20] outline-none focus:border-[#038543] transition-colors placeholder:text-[rgba(35,31,32,0.5)] placeholder:font-bold"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
                {errors.email && <p className="text-xs text-[#c41539] mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder={t('login.password')}
                    {...register('password')}
                    className="w-full h-[56px] px-5 ltr:pr-11 rtl:pl-11 border-2 border-[#4d9538] rounded-[10px] text-[16px] text-[#231F20] outline-none focus:border-[#038543] transition-colors placeholder:text-[rgba(35,31,32,0.5)] placeholder:font-bold"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPw ? t('login.hide_password') : t('login.show_password')}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[#c41539] mt-1">{errors.password.message}</p>}
              </div>

              <Link
                to="/forgot-password"
                className="text-[16px] font-bold text-black hover:text-[#4d9538] transition-colors w-fit ltr:self-start rtl:self-end"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {t('login.forgot')}
              </Link>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-[#c41539] text-center">
                  {t('login.error')}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-[64px] bg-[#4d9538] text-white font-bold rounded-[30px] hover:bg-[#038543] disabled:opacity-60 transition-colors text-[24px]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isPending ? t('login.submitting') : t('login.submit')}
              </button>
            </form>
          </div>
        </div>

        {/* ── Footer ── */}
        <Footer />
      </div>
    </div>
  )
}

function Footer() {
  const { t } = useTranslation('common')
  return (
    <div className="py-5 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <p className="text-[16px] text-black">{t('footer.copyright')}</p>
      <p className="text-[16px] text-black">
        {t('footer.dev_by')}{' '}
        <a href="https://ufuk.tn/" target="_blank" rel="noopener noreferrer" className="underline decoration-solid">
          UFUK CONNECT
        </a>
      </p>
    </div>
  )
}
