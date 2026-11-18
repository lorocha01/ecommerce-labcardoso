import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, CalendarRange, Info, Minus, type LucideIcon } from 'lucide-react'
import { useAdminPrefs } from '@/store/adminPrefs'
import type { PeriodKey } from '@/lib/analytics'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

export function AdminPageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, description, actions, children, className, bodyClassName }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn('rounded-2xl border border-ink-100 bg-white shadow-[0_1px_2px_rgba(28,21,20,.04)]', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div>
            {title && <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[12.5px] text-ink-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function StatCard({ label, value, icon: Icon, delta, hint, tone = 'default', index = 0 }: { label: string; value: ReactNode; icon: LucideIcon; delta?: number; hint?: string; tone?: 'default' | 'brand' | 'warning' | 'success' | 'danger'; index?: number }) {
  const tones = {
    default: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-50 text-brand-700',
    warning: 'bg-amber-50 text-amber-700',
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-brand-50 text-brand-700',
  }
  const DeltaIcon = delta === undefined ? null : delta > 0.001 ? ArrowUpRight : delta < -0.001 ? ArrowDownRight : Minus
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03, duration: 0.35 }} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-[0_1px_2px_rgba(28,21,20,.04)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-medium text-ink-500">{label}</span>
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', tones[tone])}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      </div>
      <div className="tabular mt-2 text-[26px] font-bold leading-none tracking-tight text-ink-900">{value}</div>
      <div className="mt-2.5 flex min-h-5 items-center gap-2 text-xs">
        {DeltaIcon && delta !== undefined && (
          <span className={cn('inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold', delta > 0.001 ? 'bg-emerald-50 text-emerald-700' : delta < -0.001 ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-600')}>
            <DeltaIcon className="h-3.5 w-3.5" />
            {formatPercent(delta)}
          </span>
        )}
        {hint && <span className="text-ink-400">{hint}</span>}
      </div>
    </motion.div>
  )
}

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: 'custom', label: 'Personalizado' },
]

export function PeriodFilter() {
  const { period, custom, setPeriod, setCustom } = useAdminPrefs()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-inset ring-ink-200 scrollbar-none" role="tablist" aria-label="Período">
        {PERIODS.map((p) => (
          <button key={p.key} type="button" role="tab" aria-selected={period === p.key} onClick={() => setPeriod(p.key)} className={cn('relative shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition', period === p.key ? 'text-white' : 'text-ink-600 hover:text-ink-900')}>
            {period === p.key && <motion.span layoutId="period-pill" className="absolute inset-0 rounded-lg bg-ink-900" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            <span className="relative">{p.label}</span>
          </button>
        ))}
      </div>
      {period === 'custom' && (
        <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 rounded-xl bg-white px-2 py-1 ring-1 ring-inset ring-ink-200">
          <CalendarRange className="h-4 w-4 text-ink-400" />
          <input type="date" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} className="h-8 rounded-md bg-transparent px-1 text-[13px] focus:outline-none" aria-label="Data inicial" />
          <span className="text-ink-300">–</span>
          <input type="date" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} className="h-8 rounded-md bg-transparent px-1 text-[13px] focus:outline-none" aria-label="Data final" />
        </motion.div>
      )}
    </div>
  )
}

export function DemoNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-900 ring-1 ring-inset ring-amber-200', className)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options, size = 'sm' }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; size?: 'sm' | 'xs' }) {
  return (
    <div className="flex rounded-lg bg-ink-100 p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value} className={cn('rounded-md font-semibold transition', size === 'xs' ? 'px-2 py-1 text-[11.5px]' : 'px-2.5 py-1 text-xs', value === o.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ChartTooltip({ active, payload, label, format }: { active?: boolean; payload?: { name: string; value: number; color: string; dataKey: string }[]; label?: string; format?: (v: number, key: string) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-[160px] rounded-xl border border-ink-100 bg-white/95 px-3 py-2.5 text-xs shadow-lift backdrop-blur">
      {label && <p className="mb-1.5 font-semibold text-ink-900">{label}</p>}
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-500">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="tabular font-semibold text-ink-900">{format ? format(p.value, p.dataKey) : p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Legend({ items }: { items: { label: string; color: string; muted?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-[3px]', i.muted && 'opacity-80')} style={{ background: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  )
}
