import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'

export default function VerifyPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col min-h-dvh bg-white max-w-[402px] mx-auto">
      <PageHeader title="Vérification" onBack={() => navigate('/signup')} />
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-20 h-20 bg-[#ebf5ea] rounded-full flex items-center justify-center text-4xl">📧</div>
        <h2 className="text-xl font-bold text-center">Vérifiez votre email</h2>
        <p className="text-sm text-gray-500 text-center">Un code de vérification a été envoyé à votre adresse email.</p>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/role')}>
          Continuer
        </Button>
      </div>
    </div>
  )
}
