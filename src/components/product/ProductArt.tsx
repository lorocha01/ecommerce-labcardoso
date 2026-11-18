import type { ArtTone } from '@/types'
import { DynamicIcon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

export const TONES: Record<ArtTone, { bg: string; icon: string; square: string; label: string }> = {
  red: { bg: 'from-brand-500 via-brand-600 to-brand-800', icon: 'text-white', square: 'bg-white', label: 'Vermelho' },
  wine: { bg: 'from-brand-800 via-brand-900 to-[#2a0a0c]', icon: 'text-peach-200', square: 'bg-peach-200', label: 'Vinho' },
  peach: { bg: 'from-peach-100 via-peach-200 to-peach-300', icon: 'text-brand-700', square: 'bg-brand-600', label: 'Pêssego' },
  rose: { bg: 'from-brand-50 via-brand-100 to-brand-200', icon: 'text-brand-700', square: 'bg-brand-600', label: 'Rosé' },
  sand: { bg: 'from-[#F7F1EA] via-[#EFE5D9] to-[#E3D4C2]', icon: 'text-brand-800', square: 'bg-brand-700', label: 'Areia' },
  ink: { bg: 'from-ink-700 via-ink-800 to-ink-900', icon: 'text-white', square: 'bg-brand-500', label: 'Grafite' },
}

/**
 * Arte ilustrativa dos exames. Quando o administrador define uma imagem
 * (URL ou upload), ela substitui a ilustração.
 */
export function ProductArt({ icon, tone, imageUrl, alt, className, size = 'md' }: { icon: string; tone: ArtTone; imageUrl?: string; alt: string; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const t = TONES[tone] ?? TONES.red
  if (imageUrl) {
    return (
      <div className={cn('relative overflow-hidden bg-ink-100', className)}>
        <img src={imageUrl} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      </div>
    )
  }
  const iconSize = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-14 w-14'
  return (
    <div className={cn('relative isolate overflow-hidden bg-gradient-to-br', t.bg, className)} role="img" aria-label={alt}>
      <div className="absolute inset-0 bg-noise opacity-60 mix-blend-overlay" />
      {/* motivo de pixels do logotipo */}
      <span className={cn('absolute left-[12%] top-[14%] h-[9%] w-[9%] min-h-2 min-w-2 rounded-[22%] opacity-90', t.square)} />
      <span className={cn('absolute left-[24%] top-[9%] h-[6%] w-[6%] min-h-1.5 min-w-1.5 rounded-[22%] opacity-60', t.square)} />
      <span className={cn('absolute left-[19%] top-[27%] h-[5%] w-[5%] min-h-1 min-w-1 rounded-[22%] opacity-40', t.square)} />
      <span className={cn('absolute bottom-[14%] right-[12%] h-[7%] w-[7%] min-h-1.5 min-w-1.5 rounded-[22%] opacity-30', t.square)} />
      <div className="absolute -bottom-1/4 -right-1/4 aspect-square w-3/4 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute inset-0 grid place-items-center">
        <div className={cn('grid place-items-center rounded-[28%] bg-white/10 p-[9%] ring-1 ring-inset ring-white/20 backdrop-blur-[2px]', tone === 'peach' || tone === 'rose' || tone === 'sand' ? 'bg-white/50 ring-white/60' : '')}>
          <DynamicIcon name={icon} className={cn(iconSize, t.icon)} strokeWidth={1.4} />
        </div>
      </div>
    </div>
  )
}
