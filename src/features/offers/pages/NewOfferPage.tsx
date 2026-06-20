import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { offersApi } from '@/lib/api/offers.api'
import { Input } from '@/components/ui/input'
import { ChevronRight, Package, MapPin, Image, CheckCircle } from 'lucide-react'
import type { PlasticType } from '@/types/user.types'

const PLASTICS: PlasticType[] = ['PET', 'HDPE', 'PP', 'PVC', 'Autres']

const PLASTIC_DESC: Record<string, string> = {
  PET: 'Bouteilles, emballages transparents',
  HDPE: 'Bidons, tuyaux, bouchons',
  PP: 'Pots, boîtes, emballages alimentaires',
  PVC: 'Tubes, profilés, câbles',
  Autres: 'Autres types de plastique',
}

const schema = z.object({
  title: z.string().min(3, 'Titre requis (min. 3 caractères)'),
  description: z.string().optional(),
  plasticType: z.enum(['PET', 'HDPE', 'PP', 'PVC', 'Autres'] as const),
  quantityKg: z.number().min(0).optional(),
  pricePerKg: z.number().min(0).optional(),
  isFree: z.boolean(),
  city: z.string().min(1, 'Ville requise'),
  zone: z.string().min(1, 'Zone requise'),
  availability: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const STEPS = [
  { num: 1, label: 'Plastique', icon: Package },
  { num: 2, label: 'Localisation', icon: MapPin },
  { num: 3, label: 'Photos & Recap', icon: Image },
]

export default function NewOfferPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState(1)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isFree: true, plasticType: 'PET' },
  })

  const isFree = watch('isFree')
  const plasticType = watch('plasticType')

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const fd = new FormData()
      fd.append('title', data.title)
      if (data.description) fd.append('description', data.description)
      fd.append('plasticType', data.plasticType)
      if (data.quantityKg !== undefined) fd.append('quantityKg', String(data.quantityKg))
      if (data.pricePerKg !== undefined) fd.append('pricePerKg', String(data.pricePerKg))
      fd.append('isFree', String(data.isFree))
      fd.append('location[city]', data.city)
      fd.append('location[zone]', data.zone)
      if (data.availability) fd.append('availability', data.availability)
      return offersApi.create(fd).then(r => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] })
      navigate('/offers/mine')
    },
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#231F20]">Publier une offre</h1>
        <p className="text-sm text-gray-500 mt-0.5">Proposez votre plastique à collecter ou recycler</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Step indicator sidebar */}
        <div className="space-y-3">
          {STEPS.map(s => (
            <div
              key={s.num}
              className={`bg-white rounded-2xl border p-4 flex items-center gap-3 transition-colors ${
                step === s.num ? 'border-[#4d9538] shadow-sm' : step > s.num ? 'border-gray-100 opacity-70' : 'border-gray-100 opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                step > s.num ? 'bg-[#4d9538]' : step === s.num ? 'bg-[#4d9538]' : 'bg-gray-100'
              }`}>
                {step > s.num
                  ? <CheckCircle size={18} className="text-white" />
                  : <s.icon size={18} className={step === s.num ? 'text-white' : 'text-gray-400'} />
                }
              </div>
              <div>
                <p className={`text-xs font-semibold ${step >= s.num ? 'text-[#4d9538]' : 'text-gray-400'}`}>
                  Étape {s.num}
                </p>
                <p className="font-bold text-sm text-[#231F20]">{s.label}</p>
              </div>
            </div>
          ))}

          {/* Progress bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Progression</span>
              <span className="text-xs font-bold text-[#4d9538]">{Math.round(((step - 1) / 3) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4d9538] rounded-full transition-all"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="col-span-2">
          <form onSubmit={handleSubmit(d => mutate(d as FormData))}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-[#231F20]">
                  {step === 1 && 'Informations sur le plastique'}
                  {step === 2 && 'Localisation de l\'offre'}
                  {step === 3 && 'Photos et récapitulatif'}
                </h2>
              </div>

              <div className="p-5 space-y-5">
                {step === 1 && (
                  <>
                    {/* Plastic type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#231F20]">Type de plastique</label>
                      <div className="grid grid-cols-5 gap-2">
                        {PLASTICS.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setValue('plasticType', p)}
                            className={`py-3 rounded-xl text-xs font-bold transition-colors border ${
                              plasticType === p
                                ? 'bg-[#4d9538] text-white border-[#4d9538]'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#4d9538]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      {plasticType && (
                        <p className="text-xs text-gray-400 ml-1">{PLASTIC_DESC[plasticType]}</p>
                      )}
                    </div>

                    <Input
                      label="Titre de l'offre"
                      placeholder="Ex: Bouteilles PET 500 kg — Sfax"
                      {...register('title')}
                      error={errors.title?.message}
                    />

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#231F20]">Description (optionnel)</label>
                      <textarea
                        placeholder="Détails sur l'état, le conditionnement, les exigences..."
                        {...register('description')}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#231F20] outline-none resize-none focus:border-[#4d9538] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Quantité (kg)"
                        type="number"
                        placeholder="500"
                        {...register('quantityKg', { valueAsNumber: true })}
                      />

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#231F20]">Prix</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setValue('isFree', !isFree)}
                            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${isFree ? 'bg-[#4d9538]' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isFree ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                          <span className="text-sm text-gray-600">{isFree ? 'Gratuit' : 'Payant'}</span>
                        </div>
                        {!isFree && (
                          <input
                            type="number"
                            placeholder="Prix DT/kg"
                            {...register('pricePerKg', { valueAsNumber: true })}
                            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-[#231F20] outline-none focus:border-[#4d9538] transition-colors mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Ville"
                        placeholder="Ex: Sousse"
                        {...register('city')}
                        error={errors.city?.message}
                      />
                      <Input
                        label="Zone / Quartier"
                        placeholder="Ex: Bab Bhar"
                        {...register('zone')}
                        error={errors.zone?.message}
                      />
                    </div>
                    <Input
                      label="Disponibilité (optionnel)"
                      placeholder="Ex: Lundi au vendredi, 8h-17h"
                      {...register('availability')}
                    />
                    <div className="bg-[#ebf5ea] rounded-xl p-4 flex items-start gap-3">
                      <MapPin size={16} className="text-[#4d9538] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#231F20]">Utiliser ma position actuelle</p>
                        <p className="text-xs text-gray-500 mt-0.5">Activez la géolocalisation pour une précision maximale</p>
                        <button type="button" className="mt-2 text-xs text-[#4d9538] font-semibold hover:underline">
                          Activer la géolocalisation
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    {/* Photo upload */}
                    <div>
                      <label className="text-sm font-medium text-[#231F20] mb-2 block">Photos (optionnel)</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#4d9538] transition-colors cursor-pointer">
                        <div className="w-14 h-14 bg-[#ebf5ea] rounded-2xl flex items-center justify-center mb-3">
                          <Image size={24} className="text-[#4d9538]" />
                        </div>
                        <p className="font-semibold text-sm text-[#231F20]">Glissez vos photos ici</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10 MB · Max 5 photos</p>
                        <button type="button" className="mt-3 px-4 py-2 border border-[#4d9538] text-[#4d9538] text-xs font-semibold rounded-xl hover:bg-[#ebf5ea] transition-colors">
                          Choisir des fichiers
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#ebf5ea] rounded-xl p-4">
                      <h3 className="font-bold text-sm text-[#231F20] mb-3">Récapitulatif de l'offre</h3>
                      <div className="space-y-2 text-sm">
                        {[
                          { label: 'Titre', value: watch('title') || '—' },
                          { label: 'Type', value: watch('plasticType') },
                          { label: 'Quantité', value: watch('quantityKg') ? `${watch('quantityKg')} kg` : '—' },
                          { label: 'Prix', value: watch('isFree') ? 'Gratuit' : watch('pricePerKg') ? `${watch('pricePerKg')} DT/kg` : '—' },
                          { label: 'Localisation', value: watch('city') && watch('zone') ? `${watch('zone')}, ${watch('city')}` : '—' },
                          { label: 'Disponibilité', value: watch('availability') || 'Non précisée' },
                        ].map(r => (
                          <div key={r.label} className="flex items-center gap-2">
                            <span className="text-gray-500 w-28 flex-shrink-0">{r.label} :</span>
                            <span className="font-semibold text-[#231F20]">{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
                  >
                    Retour
                  </button>
                )}
                <div className="flex-1" />
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-2 bg-[#4d9538] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#038543] transition-colors text-sm"
                  >
                    Suivant <ChevronRight size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 bg-[#4d9538] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#038543] disabled:opacity-60 transition-colors text-sm"
                  >
                    {isPending ? 'Publication...' : '✓ Publier l\'offre'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
