import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth.api'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { AuthPageShell } from '../components/AuthPageShell'

const schema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const { token = '' } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { data: validity, isLoading } = useQuery({
    queryKey: ['validate-reset-token', token],
    queryFn: () => authApi.validateResetToken(token).then(r => r.data),
    enabled: !!token,
    retry: false,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => authApi.resetPassword({ token, password: data.password }),
    onSuccess: () => navigate('/reset-password/success'),
  })

  // Loading state while validating token
  if (isLoading) {
    return (
      <AuthPageShell>
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-[#4d9538] border-t-transparent rounded-full animate-spin" />
          <p className="text-[16px] text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
            Vérification du lien…
          </p>
        </div>
      </AuthPageShell>
    )
  }

  // Token invalid or expired
  if (!validity?.data?.valid) {
    return (
      <AuthPageShell>
        <div className="w-full max-w-[520px] flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <AlertCircle size={40} className="text-[#c41539]" strokeWidth={1.5} />
          </div>
          <h1
            className="text-[40px] font-bold text-black leading-none mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Lien expiré
          </h1>
          <p
            className="text-[16px] text-black leading-snug mb-8"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Ce lien de réinitialisation est invalide ou a expiré. Les liens sont valables 30 minutes.
          </p>
          <Link
            to="/forgot-password"
            className="w-full h-[64px] flex items-center justify-center bg-[#4d9538] text-white font-bold rounded-[30px] hover:bg-[#038543] transition-colors text-[24px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Demander un nouveau lien
          </Link>
          <Link
            to="/login"
            className="mt-4 text-[16px] font-bold text-black hover:text-[#4d9538] transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            ← Retour à la connexion
          </Link>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell>
      <div className="w-full max-w-[520px]">

        <h1
          className="text-[40px] font-bold text-black text-center leading-none mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Nouveau mot de passe
        </h1>

        <p
          className="text-[16px] text-black text-center leading-snug mb-8"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Choisissez un mot de passe sécurisé d'au moins 8 caractères.
        </p>

        <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-4">

          {/* New password */}
          <div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Nouveau mot de passe"
                {...register('password')}
                className="w-full h-[56px] px-5 pr-11 border-2 border-[#4d9538] rounded-[10px] text-[16px] text-[#231F20] outline-none focus:border-[#038543] transition-colors placeholder:text-[rgba(35,31,32,0.5)] placeholder:font-bold"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPw ? 'Masquer' : 'Afficher'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#c41539] mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirmer le mot de passe"
                {...register('confirmPassword')}
                className="w-full h-[56px] px-5 pr-11 border-2 border-[#4d9538] rounded-[10px] text-[16px] text-[#231F20] outline-none focus:border-[#038543] transition-colors placeholder:text-[rgba(35,31,32,0.5)] placeholder:font-bold"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirm ? 'Masquer' : 'Afficher'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-[#c41539] mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-[#c41539] text-center">
              Lien invalide ou expiré. Veuillez en demander un nouveau.
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-[64px] bg-[#4d9538] text-white font-bold rounded-[30px] hover:bg-[#038543] disabled:opacity-60 transition-colors text-[24px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isPending ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
          </button>

          <Link
            to="/login"
            className="text-[16px] font-bold text-black hover:text-[#4d9538] transition-colors text-center"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            ← Retour à la connexion
          </Link>

        </form>
      </div>
    </AuthPageShell>
  )
}
