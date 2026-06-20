import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { clsx } from 'clsx'

interface PageHeaderProps {
  title: string
  onBack?: () => void
  right?: ReactNode
  transparent?: boolean
}

export function PageHeader({ title, onBack, right, transparent }: PageHeaderProps) {
  const navigate = useNavigate()
  const handleBack = onBack || (() => navigate(-1))
  return (
    <header className={clsx(
      'h-[61px] flex items-center px-4 relative',
      !transparent && 'bg-[#4d9538]',
    )}>
      <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
        <ChevronLeft size={20} className="text-white" />
      </button>
      <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-white whitespace-nowrap">{title}</h1>
      {right && <div className="ml-auto">{right}</div>}
    </header>
  )
}
