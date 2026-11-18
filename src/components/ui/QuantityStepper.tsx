import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuantityStepper({ value, onChange, min = 1, max = 10, size = 'md', className }: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: 'sm' | 'md'; className?: string }) {
  const btn = cn('grid place-items-center text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent', size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-11 w-11 rounded-xl')
  return (
    <div className={cn('inline-flex items-center rounded-xl bg-white ring-1 ring-inset ring-ink-200', size === 'sm' ? 'p-0.5' : 'p-0.5', className)}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Diminuir quantidade">
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn('tabular text-center font-bold text-ink-900', size === 'sm' ? 'w-7 text-sm' : 'w-9')} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Aumentar quantidade">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
