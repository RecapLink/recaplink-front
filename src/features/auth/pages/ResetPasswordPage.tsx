import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col min-h-dvh bg-white max-w-[402px] mx-auto">
      <PageHeader title="Nouveau mot de passe" onBack={() => navigate('/forgot-password')} />
      <div className="flex-1 px-6 py-8 flex flex-col gap-4">
        <Input label="Nouveau mot de passe" type="password" placeholder="Min. 8 caractères" />
        <Input label="Confirmer" type="password" placeholder="Répétez" />
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
          Réinitialiser
        </Button>
      </div>
    </div>
  )
}
