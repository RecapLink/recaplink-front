import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth.api'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

const ROLES = [
  { id: 'collecteur', label: 'Collecteur', desc: 'Je collecte du plastique', emoji: '♻️' },
  { id: 'recycleur', label: 'Recycleur', desc: 'Je recycle les matières', emoji: '🏭' },
  { id: 'vendeur_plastique', label: 'Vendeur Plastique', desc: 'Je vends du plastique', emoji: '🛒' },
] as const

type RoleId = typeof ROLES[number]['id']

const schema = z.object({
  fullName: z.string().min(2, 'Minimum 2 caractères'),
  username: z
    .string()
    .min(3, 'Minimum 3 caractères')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Lettres, chiffres, _ et . seulement'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro invalide'),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Une majuscule requise')
    .regex(/[0-9]/, 'Un chiffre requis'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

function FieldInput({ label, error, type = 'text', placeholder, showToggle, onToggle, showValue, ...rest }: {
  label: string; error?: string; type?: string; placeholder?: string
  showToggle?: boolean; onToggle?: () => void; showValue?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#231F20]">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (showValue ? 'text' : 'password') : type}
          placeholder={placeholder}
          {...rest}
          className="w-full h-[50px] px-4 border-2 border-gray-200 rounded-xl text-[#231F20] text-sm outline-none focus:border-[#4d9538] transition-colors pr-11"
        />
        {showToggle && (
          <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[#c41539]">{error}</p>}
    </div>
  )
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<RoleId | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending, error: apiError } = useMutation({
    mutationFn: ({ confirmPassword: _, ...data }: FormData) =>
      authApi.register({ ...data, role: role! }).then(r => r.data),
    onSuccess: () => navigate('/verify'),
  })

  const onSubmit = (data: FormData) => {
    if (!role) return
    mutate(data)
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/login')} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#4d9538] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">RL</span>
          </div>
          <span className="font-bold text-[#231F20]">RecapLink</span>
        </div>
        <h1 className="ml-2 font-bold text-[#231F20] text-lg">Créer un compte</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Role selection */}
            <div className="p-6 border-b border-gray-100">
              <p className="text-sm font-bold text-[#231F20] mb-3">
                Sélectionnez votre rôle <span className="text-[#c41539]">*</span>
              </p>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                      role === r.id
                        ? 'border-[#4d9538] bg-[#ebf5ea]'
                        : 'border-gray-200 hover:border-[#4d9538]/40'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${role === r.id ? 'bg-[#4d9538]' : 'bg-gray-100'}`}>
                      {r.emoji}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${role === r.id ? 'text-[#4d9538]' : 'text-[#231F20]'}`}>{r.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {!role && (
                <p className="text-xs text-gray-400 mt-2">Choisissez votre rôle pour continuer.</p>
              )}
            </div>

            {/* Form fields */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldInput
                  label="Nom complet"
                  placeholder="Ex: Ahmed Trabelsi"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <FieldInput
                  label="Nom d'utilisateur"
                  placeholder="Ex: ahmed_t"
                  error={errors.username?.message}
                  {...register('username')}
                />
                <FieldInput
                  label="Adresse e-mail"
                  type="email"
                  placeholder="exemple@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <FieldInput
                  label="Numéro de téléphone"
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <FieldInput
                  label="Mot de passe"
                  placeholder="Min. 8 caractères, 1 maj., 1 chiffre"
                  showToggle
                  showValue={showPw}
                  onToggle={() => setShowPw(v => !v)}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <FieldInput
                  label="Confirmer le mot de passe"
                  placeholder="Répétez le mot de passe"
                  showToggle
                  showValue={showConfirm}
                  onToggle={() => setShowConfirm(v => !v)}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              {apiError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-[#c41539] text-center">
                  Une erreur s'est produite. Vérifiez vos informations ou essayez un autre email.
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !role}
                className="w-full h-[52px] bg-[#4d9538] text-white font-bold rounded-xl hover:bg-[#038543] disabled:opacity-50 transition-colors text-base mt-2"
              >
                {isPending ? 'Inscription...' : "S'inscrire"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-[#4d9538] font-semibold hover:underline">Se connecter</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
