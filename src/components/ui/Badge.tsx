import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import type { OrderStatus } from '@/types'
import { STATUS_META } from '@/lib/status'
import { cn } from '@/lib/utils'

export function Badge({ children, className, tone = 'neutral' }: { children: ReactNode; className?: string; tone?: 'neutral' | 'brand' | 'peach' | 'success' | 'dark' | 'outline' }) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-600 text-white',
    peach: 'bg-peach-100 text-brand-800',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    dark: 'bg-ink-900 text-white',
    outline: 'bg-white/80 text-ink-700 ring-1 ring-inset ring-ink-200 backdrop-blur',
  }
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none', tones[tone], className)}>{children}</span>
}

export function StatusBadge({ status, className, size = 'md' }: { status: OrderStatus; className?: string; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        meta.className,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

/** Selo que identifica claramente dados ilustrativos. */
export function DemoTag({ className, label = 'Valor demonstrativo' }: { className?: string; label?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium text-ink-500', className)} title="Informação ilustrativa — substitua pelos dados oficiais do laboratório.">
      <Info className="h-3 w-3" />
      {label}
    </span>
  )
}
