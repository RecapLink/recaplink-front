import { useState, useEffect, type FormEvent } from 'react'
import { X, Package, MapPin, Camera, Mic2, Info, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api/admin.api'
import { ImageUploader, type UploadedImage } from './ImageUploader'
import { VoiceUploader, type VoiceData } from './VoiceUploader'

// ── Types ─────────────────────────────────────────────────────────────────────

type PlasticType = 'PET' | 'HDPE' | 'PP' | 'PVC' | 'Autres'

interface FormState {
  title: string
  description: string
  plasticType: PlasticType | ''
  category: string
  quantityKg: string
  quantityPiece: string
  unit: string
  pricePerKg: string
  isFree: boolean
  availability: string
  country: string
  zone: string
  city: string
  address: string
  postalCode: string
  recyclingCondition: string
  collectionMethod: string
  packaging: string
  notes: string
}

const INITIAL_FORM: FormState = {
  title: '', description: '', plasticType: '', category: '',
  quantityKg: '', quantityPiece: '', unit: 'kg', pricePerKg: '',
  isFree: false, availability: '',
  country: 'Tunisie', zone: '', city: '', address: '', postalCode: '',
  recyclingCondition: '', collectionMethod: '', packaging: '', notes: '',
}

const PLASTIC_TYPES: { value: PlasticType; label: string; color: string }[] = [
  { value: 'PET', label: 'PET', color: '#4d9538' },
  { value: 'HDPE', label: 'HDPE', color: '#038543' },
  { value: 'PP', label: 'PP', color: '#3b82f6' },
  { value: 'PVC', label: 'PVC', color: '#c41539' },
  { value: 'Autres', label: 'Autres', color: '#9ca3af' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#ebf5ea] flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-[#4d9538]" />
      </div>
      <h3 className="text-sm font-bold text-[#231F20]">{label}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
  half,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  half?: boolean
}) {
  return (
    <div className={half ? '' : 'col-span-2'}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {required && <span className="text-[#c41539] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#c41539] mt-1">{error}</p>}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-9 px-3 rounded-lg border text-sm outline-none transition-colors ${
        error
          ? 'border-[#c41539] bg-red-50 focus:border-[#c41539]'
          : 'border-gray-200 bg-white focus:border-[#4d9538]'
      }`}
    />
  )
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  error?: boolean
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full h-9 px-3 rounded-lg border text-sm outline-none transition-colors appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-right-3 bg-[center_right_0.75rem] pr-8 ${
        error
          ? 'border-[#c41539] bg-red-50'
          : 'border-gray-200 bg-white focus:border-[#4d9538]'
      }`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ── Main modal ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
}

export function AddOfferModal({ open, onClose }: Props) {
  const qc = useQueryClient()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [voice, setVoice] = useState<VoiceData | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM)
      setImages([])
      setVoice(null)
      setErrors({})
    }
  }, [open])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  const set = (key: keyof FormState) => (value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!form.title.trim()) errs.title = 'Le titre est requis'
    if (!form.plasticType) errs.plasticType = 'Sélectionnez un type de plastique'
    if (!form.zone.trim()) errs.zone = 'Le gouvernorat est requis'
    if (!form.city.trim()) errs.city = 'La ville est requise'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const pendingUploads = images.some(img => !img.uploadedUrl && !img.error)

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async (status: 'active' | 'pending') => {
      if (!validate()) throw new Error('validation')
      if (pendingUploads) { toast.error('Attendez la fin du téléversement des photos'); throw new Error('uploads') }

      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        plasticType: form.plasticType,
        category: form.category.trim() || undefined,
        quantityKg: form.quantityKg !== '' ? Number(form.quantityKg) : undefined,
        quantityPiece: form.quantityPiece !== '' ? Number(form.quantityPiece) : undefined,
        unit: form.unit || 'kg',
        pricePerKg: !form.isFree && form.pricePerKg !== '' ? Number(form.pricePerKg) : undefined,
        isFree: form.isFree,
        availability: form.availability.trim() || undefined,
        location: {
          city: form.city.trim(),
          zone: form.zone.trim(),
          country: form.country.trim() || undefined,
          address: form.address.trim() || undefined,
          postalCode: form.postalCode.trim() || undefined,
        },
        images: images.filter(i => i.uploadedUrl).map(i => i.uploadedUrl!),
        voiceUrl: voice?.url,
        voiceDuration: voice?.duration,
        recyclingCondition: form.recyclingCondition.trim() || undefined,
        collectionMethod: form.collectionMethod.trim() || undefined,
        packaging: form.packaging.trim() || undefined,
        notes: form.notes.trim() || undefined,
        status,
      }

      return adminApi.createOffer(payload)
    },
    onSuccess: (_, status) => {
      toast.success(status === 'active' ? 'Offre publiée avec succès !' : 'Brouillon enregistré')
      qc.invalidateQueries({ queryKey: ['admin', 'offers'] })
      onClose()
    },
    onError: (err: Error) => {
      if (err.message !== 'validation' && err.message !== 'uploads') {
        toast.error("Une erreur est survenue lors de la création de l'offre")
      }
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit('active')
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: '100%', maxWidth: 740, maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ebf5ea] flex items-center justify-center">
              <Package size={18} className="text-[#4d9538]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#231F20]">Ajouter une offre</h2>
              <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations de l'offre</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <form id="add-offer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* ── Section 1: Informations ──────────────────────────────────── */}
          <section>
            <SectionHeader icon={Package} label="Informations de l'offre" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">

              <Field label="Titre de l'offre" required error={errors.title}>
                <Input
                  value={form.title}
                  onChange={set('title')}
                  placeholder="Ex. : Bouteilles PET transparentes triées"
                  error={!!errors.title}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={e => set('description')(e.target.value)}
                  placeholder="Décrivez la qualité, l'état et les conditions de l'offre…"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#4d9538] resize-none"
                />
              </Field>

              <Field label="Type de plastique" required half error={errors.plasticType}>
                <div className="flex gap-2 flex-wrap">
                  {PLASTIC_TYPES.map(pt => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => { set('plasticType')(pt.value); setErrors(e => ({ ...e, plasticType: undefined })) }}
                      className={`px-3 h-8 rounded-lg text-xs font-bold transition-all border ${
                        form.plasticType === pt.value
                          ? 'text-white border-transparent'
                          : 'text-gray-600 border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      style={form.plasticType === pt.value ? { backgroundColor: pt.color, borderColor: pt.color } : {}}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
                {errors.plasticType && <p className="text-xs text-[#c41539] mt-1">{errors.plasticType}</p>}
              </Field>

              <Field label="Catégorie" half>
                <Input value={form.category} onChange={set('category')} placeholder="Ex. : Emballage alimentaire" />
              </Field>

              <Field label="Quantité (kg)" half>
                <Input value={form.quantityKg} onChange={set('quantityKg')} type="number" placeholder="0" />
              </Field>

              <Field label="Quantité (pièces)" half>
                <Input value={form.quantityPiece} onChange={set('quantityPiece')} type="number" placeholder="0" />
              </Field>

              <Field label="Unité" half>
                <Select
                  value={form.unit}
                  onChange={set('unit')}
                  options={[
                    { value: 'kg', label: 'Kilogrammes (kg)' },
                    { value: 'tonne', label: 'Tonnes' },
                    { value: 'pièce', label: 'Pièces' },
                    { value: 'lot', label: 'Lots' },
                  ]}
                />
              </Field>

              <Field label="Prix (DT/kg)" half>
                <div className="relative">
                  <Input
                    value={form.pricePerKg}
                    onChange={set('pricePerKg')}
                    type="number"
                    placeholder="0.000"
                    error={form.isFree}
                  />
                  {form.isFree && (
                    <div className="absolute inset-0 rounded-lg bg-gray-100/80 cursor-not-allowed" />
                  )}
                </div>
              </Field>

              <Field label="Offre gratuite" half>
                <div className="flex items-center gap-2 h-9">
                  <button
                    type="button"
                    onClick={() => set('isFree')(!form.isFree)}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                      form.isFree ? 'bg-[#4d9538]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        form.isFree ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-600">{form.isFree ? 'Oui' : 'Non'}</span>
                </div>
              </Field>

              <Field label="Disponibilité" half>
                <Input value={form.availability} onChange={set('availability')} placeholder="Ex. : Lundi–Vendredi, 8h–18h" />
              </Field>

            </div>
          </section>

          {/* ── Section 2: Localisation ──────────────────────────────────── */}
          <section>
            <SectionHeader icon={MapPin} label="Localisation" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">

              <Field label="Pays" half>
                <Input value={form.country} onChange={set('country')} placeholder="Tunisie" />
              </Field>

              <div /> {/* spacer */}

              <Field label="Gouvernorat" required half error={errors.zone}>
                <Input value={form.zone} onChange={v => { set('zone')(v); setErrors(e => ({ ...e, zone: undefined })) }} placeholder="Ex. : Sfax" error={!!errors.zone} />
              </Field>

              <Field label="Ville" required half error={errors.city}>
                <Input value={form.city} onChange={v => { set('city')(v); setErrors(e => ({ ...e, city: undefined })) }} placeholder="Ex. : Sfax Ville" error={!!errors.city} />
              </Field>

              <Field label="Adresse">
                <Input value={form.address} onChange={set('address')} placeholder="Ex. : Rue de la Liberté, Imm. 3" />
              </Field>

              <Field label="Code postal" half>
                <Input value={form.postalCode} onChange={set('postalCode')} placeholder="Ex. : 3000" />
              </Field>

              <div /> {/* spacer */}

            </div>
          </section>

          {/* ── Section 3: Photos ────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={Camera} label="Photos du plastique" />
            <p className="text-xs text-gray-400 mb-3">Jusqu'à 5 photos · JPG, PNG, WebP · max 5 Mo chacune</p>
            <ImageUploader images={images} onChange={setImages} maxCount={5} />
          </section>

          {/* ── Section 4: Enregistrement vocal ─────────────────────────── */}
          <section>
            <SectionHeader icon={Mic2} label="Enregistrement vocal" />
            <p className="text-xs text-gray-400 mb-3">Ajoutez une description vocale — MP3, WAV, M4A ou WebM</p>
            <VoiceUploader value={voice} onChange={setVoice} />
          </section>

          {/* ── Section 5: Informations complémentaires ──────────────────── */}
          <section>
            <SectionHeader icon={Info} label="Informations complémentaires" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">

              <Field label="Condition de recyclage" half>
                <Input value={form.recyclingCondition} onChange={set('recyclingCondition')} placeholder="Ex. : Propre et trié" />
              </Field>

              <Field label="Mode de collecte" half>
                <Select
                  value={form.collectionMethod}
                  onChange={set('collectionMethod')}
                  placeholder="Sélectionner…"
                  options={[
                    { value: 'livraison', label: 'Livraison' },
                    { value: 'enlèvement', label: 'Enlèvement sur place' },
                    { value: 'les_deux', label: 'Les deux' },
                  ]}
                />
              </Field>

              <Field label="Emballage" half>
                <Input value={form.packaging} onChange={set('packaging')} placeholder="Ex. : Sacs de 25 kg" />
              </Field>

              <div /> {/* spacer */}

              <Field label="Notes internes">
                <textarea
                  value={form.notes}
                  onChange={e => set('notes')(e.target.value)}
                  placeholder="Informations supplémentaires pour l'équipe…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#4d9538] resize-none"
                />
              </Field>

            </div>
          </section>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => submit('pending')}
              className="px-4 h-9 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
              Enregistrer
            </button>

            <button
              type="submit"
              form="add-offer-form"
              disabled={isPending || pendingUploads}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-[#4d9538] text-white text-sm font-semibold hover:bg-[#038543] transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
              Publier l'offre
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
