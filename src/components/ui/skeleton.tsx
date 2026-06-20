import { clsx } from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('bg-gray-200 animate-pulse rounded', className)} />
}

export function OfferCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] overflow-hidden shadow-[var(--shadow-card)]">
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-7 w-full rounded-[5px] mt-2" />
      </div>
    </div>
  )
}

export function UserRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}
