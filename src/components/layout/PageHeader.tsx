import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { PixelSquares } from '@/components/ui/PixelSquares'

export function PageHeader({ title, description, crumbs, children, eyebrow }: { title: ReactNode; description?: ReactNode; crumbs: { label: string; to?: string }[]; children?: ReactNode; eyebrow?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-ink-100 bg-gradient-to-b from-white to-canvas">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_80%_0%,#000_10%,transparent_60%)]" />
      <PixelSquares className="absolute -right-2 top-6 hidden h-24 w-24 opacity-15 md:block" />
      <div className="container relative py-8 sm:py-12">
        <Breadcrumbs items={[{ label: 'Início', to: '/' }, ...crumbs]} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-5 max-w-3xl">
          {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
          <h1 className="display text-balance text-[2.2rem] font-medium leading-[1.05] text-ink-900 sm:text-5xl">{title}</h1>
          {description && <p className="mt-3 text-pretty text-[15.5px] leading-relaxed text-ink-500 sm:text-[17px]">{description}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  )
}
