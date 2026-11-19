import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, FlaskConical } from 'lucide-react'
import type { Product } from '@/types'
import { useCategoryMap } from '@/store/hooks'
import { formatCurrency } from '@/lib/format'
import { DemoTag } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { shopCategoryName } from '@/lib/routes'
import { ProductArt } from './ProductArt'
import { AddToCartButton } from './AddToCartButton'
import { FavoriteButton } from './FavoriteButton'

export function ProductCard({ product, className, compact }: { product: Product; className?: string; compact?: boolean }) {
  const categories = useCategoryMap()
  const category = categories[product.categoryId]
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0
  const url = `/exames/${product.slug}`

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn('group relative flex h-full flex-col rounded-[26px] border border-ink-100 bg-white p-2.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-ink-200 hover:shadow-card', className)}
    >
      <Link to={url} className="relative block overflow-hidden rounded-[20px]" tabIndex={-1} aria-hidden>
        <ProductArt icon={product.icon} tone={product.tone} imageUrl={product.imageUrl} alt={product.name} className={cn('w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]', compact ? 'aspect-[16/10]' : 'aspect-[4/3]')} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.includes?.length ? <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink-800 backdrop-blur">{product.includes.length} exames</span> : null}
          {discount > 0 && <span className="rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-bold text-white">-{discount}%</span>}
        </div>
      </Link>
      <FavoriteButton productId={product.id} name={product.name} className="absolute right-5 top-5 z-10" />

      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">{category ? shopCategoryName(category) : 'Exame'}</span>
        <h3 className="mt-1.5 text-[17px] font-bold leading-snug text-ink-900">
          <Link to={url} className="after:absolute after:inset-0 after:rounded-[26px] focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        {!compact && <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-500">{product.shortDescription}</p>}

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[12px] text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <FlaskConical className="h-3.5 w-3.5 text-ink-400" />
            {product.preparationSummary}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-ink-400" />
            {product.resultTime}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              {product.compareAtPrice ? <span className="tabular block text-xs text-ink-400 line-through">{formatCurrency(product.compareAtPrice)}</span> : null}
              <span className="tabular text-[22px] font-extrabold tracking-tight text-ink-900">{formatCurrency(product.price)}</span>
              <DemoTag className="mt-0.5 block" />
            </div>
          </div>
          <div className="relative z-10 mt-3.5 flex gap-2">
            <AddToCartButton product={product} size="sm" className="h-10 flex-1" label="Adicionar" />
            <Link to={url} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-700 ring-1 ring-inset ring-ink-200 transition hover:bg-ink-50 hover:text-brand-700" aria-label={`Ver detalhes de ${product.name}`} title="Ver detalhes">
              <ArrowUpRight className="h-[18px] w-[18px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
