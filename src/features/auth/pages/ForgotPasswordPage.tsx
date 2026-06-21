import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth.api'
import { AuthPageShell } from '../components/AuthPageShell'

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => authApi.forgotPassword(data.email),
    onSuccess: (_, variables) => {
      navigate(`/forgot-password/sent?email=${encodeURIComponent(variables.email)}`)
    },
  })

  return (
    <AuthPageShell>
      <div className="w-full max-w-[520px]">

        <h1
          className="text-[40px] font-bold text-black text-center leading-none mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Mot de passe oublié ?
        </h1>

        <p
          className="text-[16px] text-black text-center leading-snug mb-8"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-4">

          <div>
            <input
              type="email"
              placeholder="E-mail"
              {...register('email')}
              className="w-full h-[56px] px-5 border-2 border-[#4d9538] rounded-[10px] text-[16px] text-[#231F20] outline-none focus:border-[#038543] transition-colors placeholder:text-[rgba(35,31,32,0.5)] placeholder:font-bold"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
            {errors.email && (
              <p className="text-xs text-[#c41539] mt-1">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-[#c41539] text-center">
              Une erreur est survenue. Veuillez réessayer.
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-[64px] bg-[#4d9538] text-white font-bold rounded-[30px] hover:bg-[#038543] disabled:opacity-60 transition-colors text-[24px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isPending ? 'Envoi…' : 'Envoyer le lien'}
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
