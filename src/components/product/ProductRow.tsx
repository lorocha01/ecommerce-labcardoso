import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Droplets, FlaskConical } from 'lucide-react'
import type { Product } from '@/types'
import { useCategoryMap } from '@/store/hooks'
import { formatCurrency } from '@/lib/format'
import { DemoTag } from '@/components/ui/Badge'
import { ProductArt } from './ProductArt'
import { AddToCartButton } from './AddToCartButton'
import { FavoriteButton } from './FavoriteButton'

export function ProductRow({ product }: { product: Product }) {
  const category = useCategoryMap()[product.categoryId]
  const url = `/exames/${product.slug}`
  return (
    <motion.article layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="group relative flex flex-col gap-4 rounded-[26px] border border-ink-100 bg-white p-3 shadow-soft transition hover:shadow-card sm:flex-row sm:items-center">
      <Link to={url} className="block shrink-0 overflow-hidden rounded-[20px] sm:w-44" tabIndex={-1} aria-hidden>
        <ProductArt icon={product.icon} tone={product.tone} imageUrl={product.imageUrl} alt="" size="sm" className="aspect-[16/9] w-full transition-transform duration-500 group-hover:scale-105 sm:aspect-square" />
      </Link>
      <div className="min-w-0 flex-1 px-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">{category?.name}</span>
        <h3 className="mt-1 text-lg font-bold text-ink-900">
          <Link to={url} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[14px] text-ink-500">{product.shortDescription}</p>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-600">
          <span className="inline-flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5 text-ink-400" />{product.preparationSummary}</span>
          <span className="inline-flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-ink-400" />{product.material}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-ink-400" />{product.resultTime}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-1 pt-3 sm:w-52 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <div className="sm:text-right">
          {product.compareAtPrice ? <span className="tabular block text-xs text-ink-400 line-through">{formatCurrency(product.compareAtPrice)}</span> : null}
          <span className="tabular text-xl font-extrabold text-ink-900">{formatCurrency(product.price)}</span>
          <DemoTag className="flex" />
        </div>
        <div className="flex gap-2">
          <FavoriteButton productId={product.id} name={product.name} variant="outline" className="h-10 w-10" />
          <AddToCartButton product={product} size="sm" className="h-10" />
        </div>
      </div>
    </motion.article>
  )
}
