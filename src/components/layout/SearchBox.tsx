import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock, CornerDownLeft, Search, TrendingUp, X } from 'lucide-react'
import { useStore } from '@/store'
import { useCategoryMap, usePublicProducts } from '@/store/hooks'
import { highlightParts, searchProducts } from '@/lib/search'
import { formatCurrency } from '@/lib/format'
import { ProductArt } from '@/components/product/ProductArt'
import { cn } from '@/lib/utils'

const POPULAR = ['Hemograma', 'Vitamina D', 'Tireoide', 'Colesterol', 'Glicemia', 'Check-up']

export function SearchBox({ autoFocus, onNavigate, className, variant = 'header' }: { autoFocus?: boolean; onNavigate?: () => void; className?: string; variant?: 'header' | 'overlay' | 'hero' }) {
  const products = usePublicProducts()
  const categories = useCategoryMap()
  const recent = useStore((s) => s.recentSearches)
  const addRecent = useStore((s) => s.addRecentSearch)
  const clearRecent = useStore((s) => s.clearRecentSearches)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => (q.trim() ? searchProducts(products, categories, q).slice(0, 6) : []), [q, products, categories])
  const matchedCats = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (t.length < 2) return []
    return Object.values(categories).filter((c) => c.active && c.name.toLowerCase().includes(t)).slice(0, 3)
  }, [q, categories])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => setActive(-1), [q])

  const go = (path: string, term?: string) => {
    if (term) addRecent(term)
    setOpen(false)
    setQ('')
    inputRef.current?.blur()
    onNavigate?.()
    navigate(path)
  }

  const submit = (term = q) => {
    const t = term.trim()
    if (!t) return
    go(`/exames?q=${encodeURIComponent(t)}`, t)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(-1, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && results[active]) go(`/exames/${results[active].product.slug}`, q)
      else submit()
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showPanel = open && (variant === 'overlay' || true)

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className={cn(
          'group flex items-center gap-2 rounded-2xl bg-ink-50 pl-4 pr-1.5 ring-1 ring-inset ring-ink-100 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/60',
          variant === 'hero' ? 'h-14 bg-white shadow-card ring-ink-100' : 'h-12',
          variant === 'overlay' && 'h-14 bg-white',
        )}
      >
        <Search className="h-[18px] w-[18px] shrink-0 text-ink-400 transition group-focus-within:text-brand-600" />
        <input
          ref={inputRef}
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Busque por exame, sintoma ou preparo…"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
          aria-label="Buscar exames"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          role="combobox"
          aria-controls="search-suggestions"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Limpar busca">
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="submit" className="hidden h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-brand-700 sm:inline-flex">
          Buscar
        </button>
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            id="search-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'z-50 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift',
              variant === 'overlay' ? 'mt-3' : 'absolute left-0 right-0 top-[calc(100%+8px)]',
            )}
          >
            {!q.trim() ? (
              <div className="space-y-5 p-4">
                {recent.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">Buscas recentes</span>
                      <button type="button" onClick={clearRecent} className="text-xs font-semibold text-ink-500 hover:text-brand-700">
                        Limpar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <button key={r} type="button" onClick={() => submit(r)} className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5 text-[13px] font-medium text-ink-700 ring-1 ring-inset ring-ink-100 hover:bg-ink-100">
                          <Clock className="h-3.5 w-3.5 text-ink-400" /> {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">Mais procurados</span>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR.map((r) => (
                      <button key={r} type="button" onClick={() => submit(r)} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[13px] font-semibold text-brand-800 hover:bg-brand-100">
                        <TrendingUp className="h-3.5 w-3.5" /> {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length === 0 && matchedCats.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-semibold text-ink-900">Nenhum exame encontrado para “{q}”</p>
                <p className="mt-1 text-sm text-ink-500">Tente outro termo, como “sangue”, “tireoide” ou “jejum”.</p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
                {matchedCats.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1">
                    {matchedCats.map((c) => (
                      <button key={c.id} type="button" onClick={() => go(`/categorias/${c.slug}`, q)} className="rounded-full bg-peach-100 px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-peach-200">
                        Categoria: {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {results.map(({ product }, i) => (
                  <button
                    key={product.id}
                    type="button"
                    role="option"
                    aria-selected={active === i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(`/exames/${product.slug}`, q)}
                    className={cn('flex w-full items-center gap-3 rounded-xl p-2 text-left transition', active === i ? 'bg-ink-50' : 'hover:bg-ink-50')}
                  >
                    <ProductArt icon={product.icon} tone={product.tone} imageUrl={product.imageUrl} alt="" size="sm" className="h-12 w-12 shrink-0 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ink-900">
                        {highlightParts(product.name, q).map((p, k) => (p.match ? <mark key={k} className="rounded bg-peach-200 px-0.5 text-ink-900">{p.text}</mark> : <span key={k}>{p.text}</span>))}
                      </span>
                      <span className="block truncate text-xs text-ink-500">
                        {categories[product.categoryId]?.name} · {product.preparationSummary}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-sm font-bold text-ink-900">{formatCurrency(product.price)}</span>
                  </button>
                ))}
                <button type="button" onClick={() => submit()} className="mt-1 flex w-full items-center justify-between rounded-xl border-t border-ink-100 px-3 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  Ver todos os resultados para “{q}”
                  <span className="inline-flex items-center gap-2 text-ink-400">
                    <CornerDownLeft className="hidden h-4 w-4 sm:block" />
                    <ArrowRight className="h-4 w-4 text-brand-600" />
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
