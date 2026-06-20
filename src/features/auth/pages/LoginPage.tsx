import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

const schema = z.object({
  email: z.string().min(1, 'Email requis'),
  password: z.string().min(1, 'Mot de passe requis'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => authApi.login(data).then(r => r.data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data
      setAuth(user, accessToken)
      navigate(user.role === 'super_admin' ? '/admin/overview' : '/home')
    },
  })

  return (
    <div className="min-h-dvh flex">

      {/* ── LEFT PANEL — photo + green overlay (desktop only) ── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden flex-shrink-0">
        {/* Background photo */}
        <img
          src="/images/login-bg.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Green hard-light blend */}
        <div className="absolute inset-0 bg-[#4d9538] mix-blend-hard-light pointer-events-none" />

        {/* Decorative ellipses — positions converted from Figma full-canvas % to left-panel % */}
        {/* Large circle — top-left (partially off-screen) */}
        <div
          className="absolute rounded-full bg-white/25"
          style={{ top: '-9.58%', left: '-1.49%', width: '40.6%', aspectRatio: '1' }}
        />
        {/* Small circle — bottom, near right edge of panel */}
        <div
          className="absolute rounded-full bg-white/25"
          style={{ top: '91.85%', left: '89%', width: '14%', aspectRatio: '1' }}
        />
        {/* Tiny circle — bottom-left */}
        <div
          className="absolute rounded-full bg-white/25"
          style={{ top: '86.39%', left: '1.49%', width: '7%', aspectRatio: '1' }}
        />
        {/* Small circle — top-left */}
        <div
          className="absolute rounded-full bg-white/25"
          style={{ top: '1.43%', left: '4.92%', width: '14%', aspectRatio: '1' }}
        />
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col min-h-dvh bg-white">

        {/* ── Branding header ── */}
        <div className="flex flex-col items-center px-8 pt-[11%] gap-3">
          {/* RecapLink logo: icon mark + wordmark side by side */}
          <div className="flex items-center">
            <img
              src="/images/recaplink-icon.svg"
              alt=""
              style={{ height: '88px', width: '92px' }}
            />
            <img
              src="/images/recaplink-logo-text.svg"
              alt="RecapLink"
              style={{ height: '56px', width: '265px', marginLeft: '-16px' }}
            />
          </div>

          {/* H4 — Bienvenue */}
          <h2
            className="font-bold text-2xl text-black text-center leading-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Bienvenue chez RecapLink
          </h2>

          {/* BBW sponsor line */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <p
              className="text-[14px] text-black text-center leading-tight"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Développée avec le soutien du Bildungswerk der Bayerischen Wirtschaft
            </p>
            <img
              src="/images/bbw_international.svg"
              alt="BBW International"
              className="h-7 w-auto flex-shrink-0"
            />
          </div>

          {/* Language switcher */}
          <LanguageSwitcher />
        </div>

        {/* ── Form section (vertically centered in remaining space) ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-[520px]">

            {/* HeadLine — Se connecter */}
            <h1
              className="text-[40px] font-bold text-black text-center leading-none mb-8"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Se connecter à RecapLink
            </h1>

            <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-4">

              {/* Email input */}
              <div>
                <input
                  type="email"
                  placeholder="E-mail ou numéro de téléphone"
                  {...register('email')}
                  className="w-full h-[56px] px-5 border-2 border-[#4d9538] rounded-[10px] text-[16px] text-[#231F20] outline-none focus:border-[#038543] transition-colors placeholder:text-[rgba(35,31,32,0.5)] placeholder:font-bold"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
                {errors.email && (
                  <p className="text-xs text-[#c41539] mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password input */}
              <div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    {...register('password')}
                    className="w-full h-[56px] px-5 pr-11 text-center border-2 border-[#4d9538] rounded-[10px] text-[16px] text-[#231F20] outline-none focus:border-[#038543] transition-colors placeholder:text-[rgba(35,31,32,0.5)] placeholder:font-bold placeholder:text-center"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#c41539] mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Mot de passe oublié — Button-1 style, left-aligned, black */}
              <Link
                to="/forgot-password"
                className="text-[16px] font-bold text-black hover:text-[#4d9538] transition-colors w-fit"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Mot de passe oublié ?
              </Link>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-[#c41539] text-center">
                  Email ou mot de passe incorrect
                </div>
              )}

              {/* Submit — pill button, 24px Inter Bold */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-[64px] bg-[#4d9538] text-white font-bold rounded-[30px] hover:bg-[#038543] disabled:opacity-60 transition-colors text-[24px]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isPending ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="py-5 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
          <p className="text-[16px] text-black">RecapLink © 2026</p>
          <p className="text-[16px] text-black">
            Développé par{' '}
            <a
              href="https://ufuk.tn/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-solid"
            >
              UFUK CONNECT
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
