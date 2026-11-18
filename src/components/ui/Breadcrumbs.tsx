import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Navegação estrutural" className="scrollbar-none -mx-1 overflow-x-auto px-1">
      <ol className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-ink-500">
        {items.map((it, i) => (
          <Fragment key={it.label + i}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-300" />}
            <li>
              {it.to ? (
                <Link to={it.to} className="transition hover:text-brand-700">
                  {it.label}
                </Link>
              ) : (
                <span className="font-medium text-ink-800">{it.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
