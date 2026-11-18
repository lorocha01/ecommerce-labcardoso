import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

export function SectionHeading({ eyebrow, title, description, action, align = 'left', className }: { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <Reveal className={cn('mb-8 flex flex-col gap-4 md:mb-10', align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between', className)}>
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <span className="eyebrow mb-3">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-brand-600" />
            {eyebrow}
          </span>
        )}
        <h2 className="display text-balance text-[1.85rem] font-medium leading-[1.1] text-ink-900 sm:text-4xl lg:text-[2.6rem]">{title}</h2>
        {description && <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink-500 sm:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  )
}
