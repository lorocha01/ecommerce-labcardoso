import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export function Logo({ variant = 'color', className, to = '/' }: { variant?: 'color' | 'white'; className?: string; to?: string | null }) {
  const settings = useStore((s) => s.settings)
  const src = variant === 'white' ? settings.logoWhiteUrl || settings.logoUrl : settings.logoUrl
  const img = <img src={src} alt={settings.storeName} className={cn('h-10 w-auto select-none', className)} draggable={false} />
  if (to === null) return img
  return (
    <Link to={to} aria-label={`${settings.storeName} — página inicial`} className="inline-flex shrink-0 items-center rounded-lg">
      {img}
    </Link>
  )
}
