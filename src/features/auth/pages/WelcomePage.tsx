import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  useEffect(() => { const t = setTimeout(() => navigate('/home'), 2000); return () => clearTimeout(t) }, [navigate])
  return (
    <div className="flex flex-col min-h-dvh bg-white items-center justify-center px-6 gap-6 max-w-[402px] mx-auto">
      <div className="w-24 h-24 bg-[#ebf5ea] rounded-full flex items-center justify-center text-5xl">🎉</div>
      <h1 className="text-2xl font-bold text-[#231F20] text-center">Bienvenue, {user?.fullName?.split(' ')[0] || 'utilisateur'} !</h1>
      <p className="text-gray-500 text-center">Votre compte a été créé avec succès.</p>
    </div>
  )
}
