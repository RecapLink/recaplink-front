import { Link } from 'react-router-dom'
import { AuthPageShell } from '../components/AuthPageShell'
import { CheckCircle } from 'lucide-react'

export default function ResetPasswordSuccessPage() {
  return (
    <AuthPageShell>
      <div className="w-full max-w-[520px] flex flex-col items-center text-center">

        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-[#EBF5EA] flex items-center justify-center mb-6">
          <CheckCircle size={44} className="text-[#4d9538]" strokeWidth={1.5} />
        </div>

        <h1
          className="text-[40px] font-bold text-black leading-none mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Mot de passe réinitialisé !
        </h1>

        <p
          className="text-[16px] text-black leading-snug mb-10"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>

        <Link
          to="/login"
          className="w-full h-[64px] flex items-center justify-center bg-[#4d9538] text-white font-bold rounded-[30px] hover:bg-[#038543] transition-colors text-[24px]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Se connecter
        </Link>

      </div>
    </AuthPageShell>
  )
}
