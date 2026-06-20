import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

const SLIDES = [
  {
    title: 'Bienvenue chez RecapLink',
    subtitle: "RecapLink s'inscrit dans un projet de coopération entre la Tunisie et le Sénégal visant à promouvoir une économie circulaire durable.",
    emoji: '♻️',
  },
  {
    title: 'Connecter & Recycler',
    subtitle: "Mettez en relation collecteurs, recycleurs et vendeurs de plastique pour une chaîne de valeur efficace.",
    emoji: '🤝',
  },
  {
    title: 'Créer de la valeur durable',
    subtitle: "Transformez les déchets plastiques en ressources économiques et contribuez à un avenir plus propre.",
    emoji: '🌿',
  },
]

export default function OnboardingPage() {
  const [slide, setSlide] = useState(0)
  const navigate = useNavigate()

  const isLast = slide === SLIDES.length - 1
  const { title, subtitle, emoji } = SLIDES[slide]

  const handleNext = () => {
    if (isLast) navigate('/login')
    else setSlide(s => s + 1)
  }

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-12 pb-8 bg-white max-w-[402px] mx-auto">
      {/* Language switcher */}
      <div className="flex justify-center mb-8">
        <LanguageSwitcher />
      </div>

      {/* Illustration placeholder */}
      <div className="flex flex-col items-center flex-1 justify-center">
        <div className="w-48 h-48 bg-[#ebf5ea] rounded-full flex items-center justify-center mb-8">
          <span className="text-8xl">{emoji}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#231F20] text-center mb-3">{title}</h1>
        <p className="text-sm text-[#231F20] text-center leading-relaxed max-w-[300px]">{subtitle}</p>

        {/* BBW credit */}
        <p className="text-[8px] text-gray-400 text-center mt-4">Développé avec le soutien du Bildungswerk der Bayerischen Wirtschaft</p>
      </div>

      {/* Dot slider */}
      <div className="flex justify-center gap-2 mb-6">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} className={`h-[6px] rounded-full transition-all ${i === slide ? 'w-6 bg-[#038543]' : 'w-6 bg-gray-200'}`} />
        ))}
      </div>

      {/* CTA */}
      <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
        {isLast ? 'Commencer' : 'Suivant'}
      </Button>

      {/* Footer */}
      <p className="text-[8px] text-gray-400 text-center mt-4">RecapLink © 2026 — Développé par UFUK CONNECT</p>
    </div>
  )
}
