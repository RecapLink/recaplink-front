import { clsx } from 'clsx'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-2xl',
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function getColor(name: string) {
  const colors = ['bg-[#4d9538]', 'bg-[#038543]', 'bg-[#c41539]', 'bg-[#1a1a1a]', 'bg-blue-600', 'bg-purple-600']
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

interface AvatarProps {
  src?: string
  name?: string
  size?: AvatarSize
  className?: string
}

export function Avatar({ src, name = '?', size = 'md', className }: AvatarProps) {
  return (
    <div className={clsx('rounded-full overflow-hidden flex items-center justify-center flex-shrink-0', sizes[size], !src && getColor(name), className)}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold leading-none">{getInitials(name)}</span>
      )}
    </div>
  )
}
