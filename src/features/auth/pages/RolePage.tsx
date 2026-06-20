import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'

const ROLES = [
  { id: 'collecteur', title: 'Collecteur', desc: 'Je collecte du plastique auprès des particuliers et entreprises', emoji: '♻️' },
  { id: 'recycleur', title: 'Recycleur', desc: 'Je traite et recycle les matières plastiques collectées', emoji: '🏭' },
  { id: 'vendeur_plastique', title: 'Vendeur Plastique', desc: 'Je vends du plastique brut ou transformé', emoji: '🛒' },
] as const

export default function RolePage() {
  const [selected, setSelected] = useState<string | null>(null)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-dvh bg-white max-w-[402px] mx-auto">
      <PageHeader title="Choisissez votre rôle" onBack={() => navigate('/signup')} />
      <div className="flex-1 px-6 py-6 flex flex-col">
        <p className="text-sm text-gray-500 mb-6">Sélectionnez le rôle qui correspond le mieux à votre activité</p>
        <div className="flex flex-col gap-4 flex-1">
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`flex items-start gap-4 p-4 rounded-[14px] border-2 text-left transition-all ${selected === role.id ? 'border-[#4d9538] bg-[#ebf5ea]' : 'border-gray-200 bg-white hover:border-[#4d9538]/50'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${selected === role.id ? 'bg-[#4d9538]' : 'bg-gray-100'}`}>
                {role.emoji}
              </div>
              <div>
                <p className={`font-bold text-base ${selected === role.id ? 'text-[#4d9538]' : 'text-[#231F20]'}`}>{role.title}</p>
                <p className="text-sm text-gray-500 mt-1">{role.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <Button
          variant="primary" size="lg" fullWidth
          disabled={!selected}
          onClick={() => navigate('/welcome')}
          className="mt-6"
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
