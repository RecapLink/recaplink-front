import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/lib/api/auth.api'
import { AuthPageShell } from '../components/AuthPageShell'
import { Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordSentPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const { t } = useTranslation('auth')

  const { mutate: resend, isPending, isSuccess } = useMutation({
    mutationFn: () => authApi.resendResetEmail(email),
  })

  return (
    <AuthPageShell>
      <div className="w-full max-w-[520px] flex flex-col items-center text-center">

        <div className="w-20 h-20 rounded-full bg-[#EBF5EA] flex items-center justify-center mb-6">
          <Mail size={40} className="text-[#4d9538]" strokeWidth={1.5} />
        </div>

        <h1
          className="text-[40px] font-bold text-black leading-none mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {t('forgot_sent.title')}
        </h1>

        <p
          className="text-[16px] text-black leading-snug mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {t('forgot_sent.sent_to')}
        </p>

        {email && (
          <p
            className="text-[16px] font-bold text-[#4d9538] mb-8 break-all"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {email}
          </p>
        )}

        <p
          className="text-[14px] text-[rgba(35,31,32,0.6)] mb-8 leading-relaxed"
          style={{ fontFamily: 'Inter, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: t('forgot_sent.check_inbox', { minutes: 30 }) }}
        />

        {isSuccess ? (
          <div className="flex items-center gap-2 text-[#4d9538] mb-6">
            <CheckCircle size={18} />
            <span className="text-[16px] font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {t('forgot_sent.resent')}
            </span>
          </div>
        ) : (
          <button
            onClick={() => resend()}
            disabled={isPending}
            className="w-full h-[64px] bg-white border-2 border-[#4d9538] text-[#4d9538] font-bold rounded-[30px] hover:bg-[#EBF5EA] disabled:opacity-60 transition-colors text-[20px] mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isPending ? t('forgot_sent.resending') : t('forgot_sent.resend')}
          </button>
        )}

        <Link
          to="/login"
          className="text-[16px] font-bold text-black hover:text-[#4d9538] transition-colors"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {t('forgot_sent.back_to_login')}
        </Link>

      </div>
    </AuthPageShell>
  )
}
