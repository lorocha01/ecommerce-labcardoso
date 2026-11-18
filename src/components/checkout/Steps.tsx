import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const CHECKOUT_STEPS = ['Carrinho', 'Dados do paciente', 'Revisão', 'Pagamento', 'Confirmação']

export function Steps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Etapas da compra">
      {CHECKOUT_STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className={cn('flex items-center gap-1.5 sm:gap-3', i < CHECKOUT_STEPS.length - 1 && 'flex-1')}>
            <span className="flex items-center gap-2">
              <span className={cn('relative grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-300', done ? 'bg-brand-600 text-white' : active ? 'bg-ink-900 text-white' : 'bg-white text-ink-400 ring-1 ring-inset ring-ink-200')} aria-current={active ? 'step' : undefined}>
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                {active && <motion.span layoutId="step-ring" className="absolute -inset-1 rounded-full ring-2 ring-ink-900/15" />}
              </span>
              <span className={cn('hidden whitespace-nowrap text-[13px] font-semibold', active ? 'md:inline' : 'xl:inline', active ? 'text-ink-900' : done ? 'text-ink-700' : 'text-ink-400')}>{label}</span>
            </span>
            {i < CHECKOUT_STEPS.length - 1 && (
              <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-ink-200">
                <motion.span className="absolute inset-y-0 left-0 bg-brand-600" initial={false} animate={{ width: done ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
