import { cn } from '@/lib/utils'

/**
 * Motivo gráfico derivado do logotipo oficial: os "pixels" que se desprendem
 * do símbolo. Usado como assinatura visual em banners, cards e fundos.
 */
export function PixelSquares({ className, tone = 'brand' }: { className?: string; tone?: 'brand' | 'white' | 'peach' }) {
  const fill = tone === 'white' ? '#ffffff' : tone === 'peach' ? '#FFD5BF' : '#BB2026'
  return (
    <svg viewBox="0 0 120 120" className={cn('pointer-events-none', className)} aria-hidden>
      <rect x="0" y="0" width="30" height="30" rx="6" fill={fill} />
      <rect x="40" y="12" width="20" height="20" rx="4.5" fill={fill} opacity=".85" />
      <rect x="24" y="46" width="22" height="22" rx="5" fill={fill} opacity=".7" />
      <rect x="70" y="50" width="14" height="14" rx="3.5" fill={fill} opacity=".55" />
      <rect x="56" y="82" width="10" height="10" rx="2.5" fill={fill} opacity=".4" />
      <rect x="96" y="80" width="8" height="8" rx="2" fill={fill} opacity=".3" />
    </svg>
  )
}
