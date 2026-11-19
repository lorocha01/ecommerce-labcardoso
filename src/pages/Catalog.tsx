import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, LayoutGrid, Rows3, Search, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useCategoryMap, usePublicCategories, usePublicProducts } from '@/store/hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductRow } from '@/components/product/ProductRow'
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Modal'
import { DynamicIcon } from '@/components/ui/Icon'
import { searchProducts } from '@/lib/search'
import { formatCurrency } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn } from '@/lib/utils'
import { CHECKUPS_SLUG, checkupsFirst, shopCategoryName as groupName } from '@/lib/routes'
import type { Product } from '@/types'

type Sort = 'relevance' | 'price-asc' | 'price-desc' | 'name'
const SORTS: { value: Sort; label: string }[] = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'name', label: 'Ordem alfabética (A–Z)' },
]
const PRICE_PRESETS = [
  { label: 'Até R$ 30', min: 0, max: 30 },
  { label: 'R$ 30 a R$ 60', min: 30, max: 60 },
  { label: 'R$ 60 a R$ 120', min: 60, max: 120 },
  { label: 'Acima de R$ 120', min: 120, max: 0 },
]

/** Página única de compras: todos os exames, check-ups e pacotes, com busca e filtros. */
export default function Catalog() {
  const allCategories = usePublicCategories()
  const categories = useMemo(() => checkupsFirst(allCategories), [allCategories])
  const categoryMap = useCategoryMap()
  const products = usePublicProducts()
  const [params, setParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('labcardoso:view') as 'grid' | 'list') || 'grid'
    } catch {
      return 'grid'
    }
  })

  const q = params.get('q') ?? ''
  // ?categoria=<slug> (links novos) ou ?cat=<id> (links antigos)
  const selected = categories.find((c) => c.slug === params.get('categoria')) ?? categories.find((c) => c.id === params.get('cat'))
  const cat = selected?.id ?? ''
  const min = Number(params.get('min') || 0)
  const max = Number(params.get('max') || 0)
  const sort = (params.get('sort') as Sort) || 'relevance'
  const prep = params.get('prep') ?? ''
  const material = params.get('material') ?? ''

  useDocumentTitle(selected ? `${groupName(selected)} · Comprar exames` : q ? `Busca: ${q}` : 'Comprar exames')

  const update = (patch: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params)
    if ('cat' in patch) {
      // categoria sempre gravada pelo slug, legível e compartilhável
      const id = patch.cat
      delete patch.cat
      next.delete('cat')
      patch.categoria = id ? categoryMap[id as string]?.slug ?? null : null
    }
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || v === 0) next.delete(k)
      else next.set(k, String(v))
    }
    setParams(next, { replace: true })
  }

  // estado de carregamento curto para transições de filtro
  const filterKey = `${q}|${cat}|${min}|${max}|${sort}|${prep}|${material}`
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 320)
    return () => clearTimeout(t)
  }, [filterKey])

  const materials = useMemo(() => [...new Set(products.map((p) => p.material))].sort(), [products])

  const results = useMemo(() => {
    let list = searchProducts(products, categoryMap, q)
    if (cat) list = list.filter((r) => r.product.categoryId === cat)
    if (min) list = list.filter((r) => r.product.price >= min)
    if (max) list = list.filter((r) => r.product.price <= max)
    if (prep === 'sem') list = list.filter((r) => !r.product.requiresPreparation)
    if (prep === 'com') list = list.filter((r) => r.product.requiresPreparation)
    if (material) list = list.filter((r) => r.product.material === material)
    const sorted = [...list]
    if (sort === 'price-asc') sorted.sort((a, b) => a.product.price - b.product.price)
    if (sort === 'price-desc') sorted.sort((a, b) => b.product.price - a.product.price)
    if (sort === 'name') sorted.sort((a, b) => a.product.name.localeCompare(b.product.name, 'pt-BR'))
    if (sort === 'relevance' && !q) sorted.sort((a, b) => Number(b.product.featured) - Number(a.product.featured))
    return sorted.map((r) => r.product)
  }, [products, categoryMap, q, cat, min, max, prep, material, sort])

  // Visão padrão (sem busca nem filtros): tudo agrupado por categoria, check-ups primeiro.
  const grouped = !q && !cat && !min && !max && !prep && !material && sort === 'relevance'
  const groups = useMemo(() => {
    if (!grouped) return []
    return categories.map((c) => ({ category: c, items: results.filter((p) => p.categoryId === c.id) })).filter((g) => g.items.length)
  }, [grouped, categories, results])

  const activeChips = [
    q && { key: 'q', label: `“${q}”` },
    selected && { key: 'cat', label: groupName(selected) },
    (min || max) && { key: 'price', label: max ? `${formatCurrency(min)} – ${formatCurrency(max)}` : `A partir de ${formatCurrency(min)}` },
    prep && { key: 'prep', label: prep === 'sem' ? 'Sem preparo' : 'Com preparo' },
    material && { key: 'material', label: material },
  ].filter(Boolean) as { key: string; label: string }[]

  const clearChip = (key: string) => {
    if (key === 'price') update({ min: null, max: null })
    else update({ [key]: null })
  }
  const selectCategory = (id: string | null) => {
    update({ cat: id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const clearAll = () => setParams(new URLSearchParams(sort !== 'relevance' ? { sort } : {}), { replace: true })

  const setViewPersist = (v: 'grid' | 'list') => {
    setView(v)
    try {
      localStorage.setItem('labcardoso:view', v)
    } catch {
      /* ignore */
    }
  }

  const filters = (
    <div className="space-y-8">
      <FilterGroup title="Categoria">
        <FilterOption active={!cat} onClick={() => update({ cat: null })} label="Todos os exames" count={products.length} />
        {categories.map((c) => (
          <FilterOption key={c.id} active={cat === c.id} onClick={() => update({ cat: cat === c.id ? null : c.id })} label={groupName(c)} icon={c.icon} count={products.filter((p) => p.categoryId === c.id).length} />
        ))}
      </FilterGroup>
      <FilterGroup title="Faixa de preço">
        {PRICE_PRESETS.map((p) => (
          <FilterOption key={p.label} active={min === p.min && max === p.max} onClick={() => (min === p.min && max === p.max ? update({ min: null, max: null }) : update({ min: p.min, max: p.max }))} label={p.label} />
        ))}
        <PriceInputs min={min} max={max} onApply={(a, b) => update({ min: a, max: b })} />
      </FilterGroup>
      <FilterGroup title="Preparo">
        <FilterOption active={prep === 'sem'} onClick={() => update({ prep: prep === 'sem' ? null : 'sem' })} label="Sem preparo específico" />
        <FilterOption active={prep === 'com'} onClick={() => update({ prep: prep === 'com' ? null : 'com' })} label="Exige preparo (jejum, coleta…)" />
      </FilterGroup>
      <FilterGroup title="Material coletado">
        {materials.map((m) => (
          <FilterOption key={m} active={material === m} onClick={() => update({ material: material === m ? null : m })} label={m} count={products.filter((p) => p.material === m).length} />
        ))}
      </FilterGroup>
    </div>
  )

  return (
    <>
      <PageHeader
        eyebrow="Exames, check-ups e pacotes"
        title={selected ? groupName(selected) : q ? <>Resultados para “{q}”</> : 'Comprar exames'}
        description={selected ? selected.description : 'Todos os exames e check-ups do laboratório em um só lugar. Pesquise pelo nome, filtre por categoria e adicione ao carrinho.'}
        crumbs={selected || q ? [{ label: 'Comprar exames', to: '/exames' }, { label: selected ? groupName(selected) : 'Busca' }] : [{ label: 'Comprar exames' }]}
      >
        <ShopSearch value={q} onChange={(v) => update({ q: v || null })} />
        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" role="toolbar" aria-label="Categorias">
          <CategoryChip active={!cat} onClick={() => update({ cat: null })} label="Todos" count={products.length} />
          {categories.map((c) => (
            <CategoryChip key={c.id} active={cat === c.id} onClick={() => update({ cat: cat === c.id ? null : c.id })} label={groupName(c)} icon={c.icon} count={products.filter((p) => p.categoryId === c.id).length} />
          ))}
        </div>
      </PageHeader>

      <div className="container py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[150px] max-h-[calc(100dvh-170px)] overflow-y-auto pr-2 scrollbar-thin">{filters}</div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-ink-500" aria-live="polite">
                {loading ? <Skeleton className="h-4 w-36" /> : <><strong className="font-bold text-ink-900">{results.length}</strong> {grouped ? 'exames e check-ups disponíveis' : results.length === 1 ? 'exame encontrado' : 'exames encontrados'}</>}
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button variant="secondary" size="md" className="flex-1 lg:hidden" onClick={() => setMobileFilters(true)}>
                  <SlidersHorizontal className="h-4 w-4" /> Filtros {activeChips.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] text-white">{activeChips.length}</span>}
                </Button>
                <label className="sr-only" htmlFor="sort">
                  Ordenar por
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => update({ sort: e.target.value === 'relevance' ? null : e.target.value })}
                  className="field h-11 flex-1 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23776B67%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_0.8rem_center] bg-no-repeat pr-9 text-sm font-semibold sm:w-56 sm:flex-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="hidden rounded-xl bg-white p-1 ring-1 ring-inset ring-ink-200 sm:flex">
                  <button type="button" onClick={() => setViewPersist('grid')} className={cn('grid h-9 w-9 place-items-center rounded-lg transition', view === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900')} aria-label="Visualizar em grade" aria-pressed={view === 'grid'}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setViewPersist('list')} className={cn('grid h-9 w-9 place-items-center rounded-lg transition', view === 'list' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900')} aria-label="Visualizar em lista" aria-pressed={view === 'list'}>
                    <Rows3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {activeChips.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex flex-wrap items-center gap-2 overflow-hidden">
                  {activeChips.map((c) => (
                    <motion.button layout key={c.key} type="button" onClick={() => clearChip(c.key)} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 pl-3 pr-2 text-[13px] font-semibold text-brand-800 ring-1 ring-inset ring-brand-100 transition hover:bg-brand-100">
                      {c.label} <X className="h-3.5 w-3.5" />
                    </motion.button>
                  ))}
                  <button type="button" onClick={clearAll} className="px-2 text-[13px] font-semibold text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline">
                    Limpar filtros
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {Array.from({ length: 6 }).map((_, i) => (view === 'grid' ? <ProductCardSkeleton key={i} /> : <Skeleton key={i} className="h-36 rounded-3xl" />))}
              </div>
            ) : results.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={SearchX}
                  title="Nenhum exame encontrado"
                  description={q ? `Não encontramos resultados para “${q}” com os filtros selecionados. Tente outro termo ou remova alguns filtros.` : 'Nenhum exame corresponde aos filtros selecionados.'}
                  action={
                    <>
                      <Button onClick={clearAll}>Limpar filtros</Button>
                      <Button variant="secondary" to="/contato">
                        Falar com o laboratório
                      </Button>
                    </>
                  }
                />
              </div>
            ) : grouped ? (
              <div className="space-y-14">
                {groups.map(({ category, items }) => (
                  <section key={category.id} aria-labelledby={`grupo-${category.slug}`} className="scroll-mt-40">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-ink-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl', category.slug === CHECKUPS_SLUG ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand' : 'bg-brand-50 text-brand-700')}>
                          <DynamicIcon name={category.icon} className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 id={`grupo-${category.slug}`} className="text-xl font-bold leading-tight text-ink-900">
                            {groupName(category)} <span className="tabular ml-1 text-[15px] font-semibold text-ink-400">{items.length}</span>
                          </h2>
                          <p className="mt-0.5 line-clamp-1 text-[13.5px] text-ink-500">{category.description}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => selectCategory(category.id)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 transition hover:text-brand-800">
                        Ver só esta categoria <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <ProductGrid products={items} view={view} />
                  </section>
                ))}
              </div>
            ) : (
              <ProductGrid products={results} view={view} />
            )}
            <p className="mt-10 text-center text-xs text-ink-400">Preços, prazos e orientações exibidos são demonstrativos e serão substituídos pelos dados oficiais do laboratório.</p>
          </div>
        </div>
      </div>

      <Drawer open={mobileFilters} onClose={() => setMobileFilters(false)} side="right" label="Filtros">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <span className="text-lg font-bold">Filtros</span>
          <button type="button" onClick={() => setMobileFilters(false)} className="grid h-10 w-10 place-items-center rounded-full bg-ink-100" aria-label="Fechar filtros">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">{filters}</div>
        <div className="flex gap-2 border-t border-ink-100 p-4 safe-bottom">
          <Button variant="secondary" className="flex-1" onClick={clearAll}>
            Limpar
          </Button>
          <Button className="flex-[2]" onClick={() => setMobileFilters(false)}>
            Ver {results.length} {results.length === 1 ? 'exame' : 'exames'}
          </Button>
        </div>
      </Drawer>
    </>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">{title}</legend>
      <div className="space-y-0.5">{children}</div>
    </fieldset>
  )
}

function FilterOption({ active, onClick, label, count, icon }: { active: boolean; onClick: () => void; label: string; count?: number; icon?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[14px] transition', active ? 'bg-brand-50 font-semibold text-brand-800' : 'text-ink-700 hover:bg-ink-50')}>
      <span className={cn('grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] ring-1 ring-inset transition', active ? 'bg-brand-600 ring-brand-600' : 'bg-white ring-ink-300')}>{active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}</span>
      {icon && <DynamicIcon name={icon} className={cn('h-4 w-4 shrink-0', active ? 'text-brand-600' : 'text-ink-400')} />}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && <span className="tabular text-xs text-ink-400">{count}</span>}
    </button>
  )
}

function PriceInputs({ min, max, onApply }: { min: number; max: number; onApply: (min: number, max: number) => void }) {
  const [a, setA] = useState(min ? String(min) : '')
  const [b, setB] = useState(max ? String(max) : '')
  useEffect(() => {
    setA(min ? String(min) : '')
    setB(max ? String(max) : '')
  }, [min, max])
  return (
    <form
      className="mt-3 flex items-center gap-2 px-1"
      onSubmit={(e) => {
        e.preventDefault()
        const na = Math.max(0, Number(a) || 0)
        const nb = Math.max(0, Number(b) || 0)
        onApply(nb && na > nb ? nb : na, nb && na > nb ? na : nb)
      }}
    >
      <input value={a} onChange={(e) => setA(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="Mín." className="field field-sm h-10 w-full" aria-label="Preço mínimo" />
      <span className="text-ink-300">–</span>
      <input value={b} onChange={(e) => setB(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="Máx." className="field field-sm h-10 w-full" aria-label="Preço máximo" />
      <button type="submit" className="h-10 shrink-0 rounded-lg bg-ink-900 px-3 text-xs font-bold text-white hover:bg-ink-800">
        OK
      </button>
    </form>
  )
}

function ProductGrid({ products, view }: { products: Product[]; view: 'grid' | 'list' }) {
  return (
    <motion.div layout className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
      <AnimatePresence initial={false}>
        {products.map((p) => (view === 'grid' ? <ProductCard key={p.id} product={p} /> : <ProductRow key={p.id} product={p} />))}
      </AnimatePresence>
    </motion.div>
  )
}

function CategoryChip({ active, onClick, label, count, icon }: { active: boolean; onClick: () => void; label: string; count: number; icon?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn('inline-flex shrink-0 items-center gap-2 rounded-full py-2 pl-3.5 pr-2.5 text-[13px] font-semibold ring-1 ring-inset transition', active ? 'bg-brand-600 text-white ring-brand-600 shadow-brand' : 'bg-white text-ink-700 ring-ink-200 hover:ring-ink-300')}
    >
      {icon && <DynamicIcon name={icon} className="h-4 w-4" />}
      {label}
      <span className={cn('tabular rounded-full px-1.5 py-px text-[11px]', active ? 'bg-white/20' : 'bg-ink-100 text-ink-500')}>{count}</span>
    </button>
  )
}

/** Busca por nome direto na página (atualiza a URL com atraso curto). */
function ShopSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value)
  const timer = useRef<number>()
  useEffect(() => setText(value), [value])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const change = (v: string) => {
    setText(v)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onChange(v.trim()), 280)
  }
  return (
    <form
      role="search"
      className="relative mt-7 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault()
        window.clearTimeout(timer.current)
        onChange(text.trim())
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={text}
        onChange={(e) => change(e.target.value)}
        placeholder="Buscar exame ou check-up pelo nome"
        aria-label="Pesquisar exames pelo nome"
        className="field h-14 rounded-2xl pl-12 pr-12 text-[15.5px] shadow-soft [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button type="button" onClick={() => change('')} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900" aria-label="Limpar busca">
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  )
}
