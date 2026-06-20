import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  return (
    <div className="flex flex-col min-h-dvh bg-white max-w-[402px] mx-auto">
      <PageHeader title="Mot de passe oublié" onBack={() => navigate('/login')} />
      <div className="flex-1 px-6 py-8 flex flex-col gap-6">
        <p className="text-sm text-gray-500">Entrez votre adresse email pour recevoir un code de réinitialisation.</p>
        <Input label="Adresse e-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@email.com" />
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
          Envoyer le code
        </Button>
      </div>
    </div>
  )
}
