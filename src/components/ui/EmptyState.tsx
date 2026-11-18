import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { PixelSquares } from './PixelSquares'
import { cn } from '@/lib/utils'

export function EmptyState({ icon: Icon, title, description, action, className }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('relative mx-auto flex max-w-md flex-col items-center px-6 py-14 text-center', className)}>
      <div className="relative mb-6">
        <PixelSquares className="absolute -right-8 -top-6 h-12 w-12 opacity-70" />
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-peach-100 to-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
          <Icon className="h-9 w-9" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-xl font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-2 text-pretty text-[15px] leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
