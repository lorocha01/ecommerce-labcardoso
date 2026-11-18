import { motion } from 'framer-motion'

/** Indicador de carregamento com o motivo de "pixels" da marca. */
export function PageLoader({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.span key={i} className="h-3.5 w-3.5 rounded-[4px] bg-brand-600" animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }} transition={{ duration: 1, repeat: Infinity, delay: [0, 0.25, 0.75, 0.5][i] }} />
          ))}
        </div>
        <span className="text-sm font-medium text-ink-500">{label}</span>
      </div>
    </div>
  )
}
