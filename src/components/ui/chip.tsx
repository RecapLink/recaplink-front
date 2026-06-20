import { clsx } from 'clsx'
import type { PlasticType } from '@/types/user.types'

const plasticColors: Record<PlasticType, string> = {
  PET: 'bg-green-100 text-green-800',
  HDPE: 'bg-blue-100 text-blue-800',
  PP: 'bg-orange-100 text-orange-800',
  PVC: 'bg-purple-100 text-purple-800',
  Autres: 'bg-gray-100 text-gray-700',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-700',
  verified: 'bg-emerald-100 text-emerald-800',
  reported: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-600',
}

export function PlasticChip({ type }: { type: PlasticType }) {
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', plasticColors[type])}>
      {type}
    </span>
  )
}

export function StatusChip({ status }: { status: string }) {
  const labels: Record<string, string> = {
    active: 'Actif', pending: 'En attente', suspended: 'Suspendu',
    verified: 'Vérifié', reported: 'Signalé', closed: 'Fermé',
  }
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', statusColors[status] || 'bg-gray-100 text-gray-600')}>
      {labels[status] || status}
    </span>
  )
}

export function Chip({ label, color = 'green' }: { label: string; color?: 'green' | 'red' | 'gray' | 'blue' }) {
  const colorMap = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-800',
  }
  return (
    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', colorMap[color])}>
      {label}
    </span>
  )
}
