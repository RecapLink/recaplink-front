import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { usersApi } from '@/lib/api/users.api'
import { authApi } from '@/lib/api/auth.api'
import { ChevronLeft, Save, User, Phone, MapPin, FileText } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2, 'Requis'),
  username: z.string().min(3, 'Requis').regex(/^[a-zA-Z0-9_]+$/, 'Lettres, chiffres, _ seulement'),
  phone: z.string().optional(),
  bio: z.string().max(200).optional(),
  city: z.string().optional(),
  zone: z.string().optional(),
})
type FormData = z.infer<typeof schema>

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-[#231F20]">{label}</label>
      {children}
      {error && <p className="text-xs text-[#c41539]">{error}</p>}
    </div>
  )
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={`w-full h-11 bg-gray-50 border rounded-xl px-4 text-sm text-[#231F20] outline-none transition-colors placeholder:text-gray-400 ${
        error ? 'border-[#c41539]' : 'border-gray-200 focus:border-[#4d9538]'
      }`}
    />
  )
}

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user, setAuth, accessToken } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      username: user?.username ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? '',
      city: user?.city ?? '',
      zone: user?.zone ?? '',
    },
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => usersApi.updateMe(data).then(r => r.data),
    onSuccess: async () => {
      const me = await authApi.me().then(r => r.data.data)
      setAuth(me, accessToken!)
      navigate('/profile')
    },
  })

  const apiError = (error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4d9538] transition-colors"
          >
            <ChevronLeft size={16} /> Profil
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-[#231F20]">Modifier le profil</h1>
        </div>
        <button
          onClick={handleSubmit(d => mutate(d))}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#4d9538] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#038543] disabled:opacity-60 transition-colors"
        >
          <Save size={15} />
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <form onSubmit={handleSubmit(d => mutate(d))}>
        <div className="grid grid-cols-3 gap-5">
          {/* Left — avatar + quick info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4 self-start">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#4d9538] flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-white font-black text-3xl">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-[#231F20]">{user?.fullName}</p>
              <p className="text-xs text-gray-400">@{user?.username}</p>
            </div>
            <div className="w-full border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <User size={14} className="text-[#4d9538]" />
                <span>{user?.role}</span>
              </div>
              {user?.city && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={14} className="text-[#4d9538]" />
                  <span>{user.city}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone size={14} className="text-[#4d9538]" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right — form */}
          <div className="col-span-2 space-y-4">
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {apiError}
              </div>
            )}

            {/* Informations personnelles */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-[#231F20] flex items-center gap-2">
                <User size={16} className="text-[#4d9538]" />
                Informations personnelles
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nom complet" error={errors.fullName?.message}>
                  <TextInput
                    placeholder="Votre nom complet"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                </Field>
                <Field label="Nom d'utilisateur" error={errors.username?.message}>
                  <TextInput
                    placeholder="ex: salem99"
                    error={errors.username?.message}
                    {...register('username')}
                  />
                </Field>
              </div>
              <Field label="Téléphone">
                <TextInput type="tel" placeholder="+216 XX XXX XXX" {...register('phone')} />
              </Field>
              <Field label="Bio" error={errors.bio?.message}>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea
                    {...register('bio')}
                    rows={3}
                    placeholder="Décrivez votre activité..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#4d9538] rounded-xl pl-9 pr-4 pt-3 pb-3 text-sm text-[#231F20] outline-none resize-none placeholder:text-gray-400 transition-colors"
                  />
                </div>
                {errors.bio && <p className="text-xs text-[#c41539]">{errors.bio.message}</p>}
              </Field>
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-[#231F20] flex items-center gap-2">
                <MapPin size={16} className="text-[#4d9538]" />
                Localisation
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ville">
                  <TextInput placeholder="Ex: Sousse" {...register('city')} />
                </Field>
                <Field label="Zone / Quartier">
                  <TextInput placeholder="Ex: Beb Bhar" {...register('zone')} />
                </Field>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
