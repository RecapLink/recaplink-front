import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/lib/api/auth.api'
import { usersApi } from '@/lib/api/users.api'
import { Pencil } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2, 'Minimum 2 caractères'),
  bio: z.string().max(300).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const PROFILE_BADGES = [
  { label: 'Administrateur', color: '#c41539', textColor: 'white' },
  { label: 'Expert', color: '#7b1a2a', textColor: 'white' },
  { label: 'Pionnier', color: '#4d9538', textColor: 'white' },
]

const PROFILE_STATS = [
  { value: 396, label: 'Utilisateurs gérés' },
  { value: 46, label: 'Fiches créés' },
  { value: 1247, label: 'Badges attribués' },
  { value: 365, label: 'Jours actifs' },
]

export default function AdminProfilePage() {
  const { user, setAuth, accessToken, logout } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      city: user?.city || '',
    },
  })

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: FormData) => usersApi.updateMe(data),
    onSuccess: async () => {
      try {
        const me = await authApi.me().then(r => r.data.data)
        if (accessToken) setAuth(me, accessToken)
      } catch {
        // silently ignore
      }
    },
  })

  const initials = user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#231F20]">Mon profil</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user?.fullName} · Super administrateur</p>
        </div>
        <button className="flex items-center gap-2 border border-[#4d9538] text-[#4d9538] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#ebf5ea] transition-colors">
          <Pencil size={14} />
          Modifier le profil
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left — Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center gap-4">
          {/* Initials avatar */}
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7b1a2a' }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} className="w-full h-full rounded-2xl object-cover" alt="" />
            ) : (
              <span className="text-white font-black text-3xl">{initials}</span>
            )}
          </div>

          <div>
            <p className="font-bold text-base text-[#231F20]">{user?.fullName}</p>
            <p className="text-xs text-gray-500 mt-0.5">Super Administrateur · RecapLink</p>
            <p className="text-xs text-gray-400">{user?.city || 'Tunis'}, Tunisie</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {PROFILE_BADGES.map(b => (
              <span
                key={b.label}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: b.color, color: b.textColor }}
              >
                {b.label}
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="w-full grid grid-cols-2 gap-2">
            {PROFILE_STATS.map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="font-bold text-[#231F20] text-base">{s.value.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="w-full space-y-2 pt-1">
            <button className="w-full text-sm font-medium text-[#231F20] py-2 hover:text-[#4d9538] transition-colors">
              Changer mot de passe
            </button>
            <button
              onClick={() => logout()}
              className="w-full text-sm font-semibold text-[#c41539] py-2 hover:bg-red-50 rounded-xl transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Right — Edit form */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-[#231F20]">Informations personnelles</h2>
          </div>
          <div className="p-5">
            {isSuccess && (
              <div className="bg-[#ebf5ea] border border-[#4d9538]/20 rounded-xl p-3 mb-4 text-sm text-[#4d9538]">
                Profil mis à jour avec succès !
              </div>
            )}
            <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Nom complet</label>
                  <input
                    {...register('fullName')}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-[#231F20] bg-gray-50 outline-none focus:border-[#4d9538]"
                  />
                  {errors.fullName && <p className="text-xs text-[#c41539]">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Nom d'utilisateur</label>
                  <input
                    value={user?.username || ''}
                    readOnly
                    className="w-full h-11 px-4 border border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <input
                    value={user?.email || ''}
                    readOnly
                    className="w-full h-11 px-4 border border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Numéro de téléphone</label>
                  <input
                    {...register('phone')}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-[#231F20] bg-gray-50 outline-none focus:border-[#4d9538]"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Ville</label>
                  <input
                    {...register('city')}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-[#231F20] bg-gray-50 outline-none focus:border-[#4d9538]"
                    placeholder="Tunis, Tunisie"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Role</label>
                  <input
                    value="Super administrateur"
                    readOnly
                    className="w-full h-11 px-4 border border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#231F20] bg-gray-50 outline-none resize-none focus:border-[#4d9538]"
                  placeholder="Décrivez votre rôle..."
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="bg-[#4d9538] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#038543] disabled:opacity-60 transition-colors"
              >
                {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
