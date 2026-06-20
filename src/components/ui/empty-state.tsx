import { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#ebf5ea] flex items-center justify-center mb-4">
        <Icon size={32} className="text-[#4d9538]" />
      </div>
      <h3 className="text-lg font-bold text-[#231F20] mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-[240px]">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
