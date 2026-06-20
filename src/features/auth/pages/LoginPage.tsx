import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
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
      navigate(user.role === 'admin' ? '/admin/overview' : '/home')
    },
  })

  return (
    <div className="min-h-dvh flex">
      {/* ── LEFT panel — desktop only ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-[#4d9538] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#038543]/60 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/3 -right-16 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-[#4d9538] font-black text-xl">RL</span>
            </div>
            <span className="text-white font-extrabold text-3xl tracking-tight">RecapLink</span>
          </div>

          <h2 className="text-white font-bold text-2xl leading-snug mb-4">
            La plateforme de l'économie circulaire plastique
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-10">
            Connectez collecteurs, recycleurs et acheteurs de plastique en Tunisie et au Sénégal pour un avenir durable.
          </p>

          {/* Stats pills */}
          <div className="flex gap-4 justify-center">
            {[
              { val: '12 480', label: 'kg recyclés' },
              { val: '247', label: 'offres actives' },
              { val: '84', label: 'collecteurs' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
                <p className="text-white font-extrabold text-xl">{s.val}</p>
                <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT panel — form ── */}
      <div className="flex-1 flex flex-col min-h-dvh bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          {/* Mobile logo only */}
          <div className="flex items-center gap-2 lg:invisible">
            <div className="w-8 h-8 bg-[#4d9538] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">RL</span>
            </div>
            <span className="font-bold text-[#231F20]">RecapLink</span>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-[440px]">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-[#231F20]">Se connecter à RecapLink</h1>
              <p className="text-gray-500 text-sm mt-1.5">Bienvenue ! Entrez vos identifiants pour continuer.</p>
            </div>

            <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#231F20]">E-mail ou téléphone</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Entrez votre email"
                    {...register('email')}
                    className="w-full h-[50px] pl-10 pr-4 border-2 border-gray-200 rounded-xl text-[#231F20] text-sm outline-none focus:border-[#4d9538] transition-colors"
                  />
                </div>
                {errors.email && <p className="text-xs text-[#c41539]">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#231F20]">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    {...register('password')}
                    className="w-full h-[50px] pl-10 pr-11 border-2 border-gray-200 rounded-xl text-[#231F20] text-sm outline-none focus:border-[#4d9538] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[#c41539]">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-[#4d9538] font-medium hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-[#c41539] text-center">
                  Email ou mot de passe incorrect
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-[52px] bg-[#4d9538] text-white font-bold rounded-xl hover:bg-[#038543] disabled:opacity-60 transition-colors text-base mt-2"
              >
                {isPending ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-sm text-gray-400">Ou</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Pas de compte ?{' '}
              <Link to="/signup" className="text-[#4d9538] font-semibold hover:underline">Inscrivez-vous</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-gray-400">RecapLink © 2026 · Développé par <span className="font-semibold">UFUK CONNECT</span></p>
        </div>
      </div>
    </div>
  )
}
