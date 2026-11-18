import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CalendarClock,
  Check,
  ClipboardList,
  Clock,
  Droplets,
  FileText,
  FlaskConical,
  HelpCircle,
  Info,
  ListChecks,
  ShieldCheck,
  Stethoscope,
  Zap,
} from 'lucide-react'
import { useStore } from '@/store'
import { useCategoryMap, usePublicProducts } from '@/store/hooks'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { DemoTag } from '@/components/ui/Badge'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Reveal } from '@/components/ui/Reveal'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { ProductArt } from '@/components/product/ProductArt'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { FavoriteButton } from '@/components/product/FavoriteButton'
import { ProductCard } from '@/components/product/ProductCard'
import { flyToCart } from '@/components/product/flyToCart'
import { formatCurrency } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn, whatsappLink } from '@/lib/utils'
import { MAX_QTY } from '@/store'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { id } = useParams()
  const products = usePublicProducts()
  const categories = useCategoryMap()
  const addViewed = useStore((s) => s.addViewed)
  const addToCart = useStore((s) => s.addToCart)
  const viewed = useStore((s) => s.viewed)
  const settings = useStore((s) => s.settings)
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)

  const product = products.find((p) => p.slug === id || p.id === id)
  useDocumentTitle(product?.name ?? 'Exame')

  useEffect(() => {
    if (product) addViewed(product.id)
    setQty(1)
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const related = useMemo(() => {
    if (!product) return []
    const tagSet = new Set(product.tags)
    return products
      .filter((p) => p.id !== product.id)
      .map((p) => ({ p, score: (p.categoryId === product.categoryId ? 5 : 0) + p.tags.filter((t) => tagSet.has(t)).length * 2 + (p.featured ? 1 : 0) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.p)
  }, [product, products])

  const recentlyViewed = useMemo(
    () =>
      viewed
        .filter((v) => v.productId !== product?.id)
        .map((v) => products.find((p) => p.id === v.productId))
        .filter((p): p is NonNullable<typeof p> => !!p)
        .slice(0, 4),
    [viewed, products, product?.id],
  )

  if (!product) return <NotFound />
  const category = categories[product.categoryId]
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice - product.price : 0

  const buyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(product.id, qty)
    flyToCart(e.currentTarget)
    setTimeout(() => navigate('/checkout'), 350)
  }

  const facts = [
    { icon: Droplets, label: 'Material', value: product.material },
    { icon: FlaskConical, label: 'Preparo', value: product.preparationSummary },
    { icon: Clock, label: 'Prazo estimado', value: product.resultTime },
    { icon: ClipboardList, label: 'Categoria', value: category?.name ?? '—' },
  ]

  const sections = [
    { id: 'descricao', icon: FileText, title: 'Sobre o exame', body: product.description },
    { id: 'finalidade', icon: Stethoscope, title: 'Para que serve?', body: product.purpose },
    { id: 'como', icon: Zap, title: 'Como é realizado?', body: product.howItsDone },
    { id: 'preparo', icon: FlaskConical, title: 'Existe necessidade de preparo?', body: product.preparation, highlight: product.requiresPreparation },
    ...(product.includes?.length ? [{ id: 'inclui', icon: ListChecks, title: 'Exames incluídos', list: product.includes }] : []),
    { id: 'importante', icon: AlertCircle, title: 'Informações importantes', body: product.importantInfo },
  ] as { id: string; icon: typeof FileText; title: string; body?: string; list?: string[]; highlight?: boolean }[]

  return (
    <div className="pb-24 lg:pb-0">
      <div className="border-b border-ink-100 bg-white">
        <div className="container py-4">
          <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Exames', to: '/exames' }, ...(category ? [{ label: category.name, to: `/categorias/${category.slug}` }] : []), { label: product.name }]} />
        </div>
      </div>

      <section className="container py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className="relative overflow-hidden rounded-[36px] shadow-card">
              <ProductArt icon={product.icon} tone={product.tone} imageUrl={product.imageUrl} alt={product.name} size="lg" className="aspect-[4/3] w-full" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {product.featured && <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink-900 backdrop-blur">Mais procurado</span>}
                {product.includes?.length ? <span className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-bold text-white">{product.includes.length} exames incluídos</span> : null}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-ink-100 bg-white p-3.5">
                  <Icon className="h-[18px] w-[18px] text-brand-600" strokeWidth={1.8} />
                  <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">{label}</span>
                  <span className="mt-0.5 block text-[13.5px] font-semibold leading-snug text-ink-900">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="lg:sticky lg:top-[150px] lg:self-start">
            <Link to={category ? `/categorias/${category.slug}` : '/exames'} className="eyebrow hover:text-brand-800">
              <span className="h-1.5 w-1.5 rounded-[2px] bg-brand-600" />
              {category?.name}
            </Link>
            <h1 className="display mt-3 text-balance text-[2.2rem] font-medium leading-[1.05] text-ink-900 sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-pretty text-[16.5px] leading-relaxed text-ink-600">{product.shortDescription}</p>

            <div className="mt-7 rounded-[28px] border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  {product.compareAtPrice ? (
                    <span className="tabular flex items-center gap-2 text-sm text-ink-400">
                      <span className="line-through">{formatCurrency(product.compareAtPrice)}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">economize {formatCurrency(discount)}</span>
                    </span>
                  ) : null}
                  <span className="tabular display block text-[2.6rem] font-semibold leading-none tracking-tight text-ink-900">{formatCurrency(product.price)}</span>
                  <DemoTag className="mt-2" label="Preço demonstrativo — sujeito à confirmação do laboratório" />
                </div>
                <FavoriteButton productId={product.id} name={product.name} variant="outline" />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <QuantityStepper value={qty} onChange={setQty} max={MAX_QTY} className="self-start" />
                <AddToCartButton product={product} quantity={qty} size="lg" className="flex-1" fullLabel="Adicionar ao carrinho" />
              </div>
              <Button variant="dark" size="lg" className="mt-3 w-full" onClick={buyNow}>
                Comprar agora · {formatCurrency(product.price * qty)}
              </Button>

              <ul className="mt-6 space-y-2.5 border-t border-dashed border-ink-200 pt-5 text-[13.5px] text-ink-600">
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Compra simulada: nenhum pagamento real é realizado
                </li>
                <li className="flex items-center gap-2.5">
                  <CalendarClock className="h-4 w-4 text-brand-600" /> Apresente o número do pedido no dia da coleta
                </li>
              </ul>
            </div>

            <a href={whatsappLink(settings.whatsapp, `Olá! Tenho uma dúvida sobre o exame "${product.name}".`)} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-3 rounded-2xl bg-[#25D366]/10 p-4 text-sm text-ink-700 ring-1 ring-inset ring-[#25D366]/25 transition hover:bg-[#25D366]/15">
              <WhatsAppIcon className="h-6 w-6 shrink-0 text-[#25D366]" />
              <span>
                <strong className="block text-ink-900">Dúvidas sobre este exame?</strong>
                Fale com a equipe do laboratório pelo WhatsApp.
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      <section className="container pb-16">
        {product.dataStatus === 'demonstrativo' && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[14px] text-amber-900">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              <strong>Conteúdo demonstrativo.</strong> As informações clínicas, de preparo e de prazo desta página são ilustrativas e devem ser substituídas pelos dados oficiais fornecidos pelo Laboratório Cardoso. Siga sempre a orientação do seu médico.
            </p>
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav className="hidden lg:block" aria-label="Seções do exame">
            <ul className="sticky top-[150px] space-y-1 border-l border-ink-200">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[14px] text-ink-500 transition hover:border-brand-600 hover:text-ink-900">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-4">
            {sections.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.03} id={s.id} className={cn('scroll-mt-40 rounded-[28px] border bg-white p-6 sm:p-8', s.highlight ? 'border-peach-300 bg-gradient-to-br from-peach-50 to-white' : 'border-ink-100')}>
                <h2 className="flex items-center gap-3 text-lg font-bold text-ink-900 sm:text-xl">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <s.icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  {s.title}
                </h2>
                {s.body && <p className="mt-4 text-pretty text-[15.5px] leading-relaxed text-ink-600">{s.body}</p>}
                {s.list && (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {s.list.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 rounded-xl bg-ink-50 px-3.5 py-2.5 text-[14px] font-medium text-ink-800">
                        <span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-100 text-emerald-700">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}
            <Reveal className="flex items-start gap-3 rounded-[28px] bg-ink-900 p-6 text-white sm:p-8">
              <HelpCircle className="mt-0.5 h-6 w-6 shrink-0 text-peach-200" />
              <div>
                <p className="font-bold">Precisa de pedido médico?</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-200">Recomendamos sempre a orientação de um médico para solicitar e interpretar seus exames. Leve o pedido médico, quando houver, no dia da coleta.</p>
                <Link to="/faq" className="mt-3 inline-block text-sm font-semibold text-peach-200 underline underline-offset-4">
                  Ver perguntas frequentes
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink-100 bg-white py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="display text-3xl font-medium sm:text-4xl">Exames relacionados</h2>
              <Link to={category ? `/categorias/${category.slug}` : '/exames'} className="link hidden text-sm sm:inline">
                Ver categoria
              </Link>
            </div>
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
              {related.map((p) => (
                <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
                  <ProductCard product={p} compact />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="container pt-16">
          <h2 className="mb-6 text-lg font-bold text-ink-900">Vistos recentemente</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
            {recentlyViewed.map((p) => (
              <Link key={p.id} to={`/exames/${p.slug}`} className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border border-ink-100 bg-white p-2.5 transition hover:shadow-soft">
                <ProductArt icon={p.icon} tone={p.tone} imageUrl={p.imageUrl} alt="" size="sm" className="h-14 w-14 shrink-0 rounded-xl" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink-900">{p.name}</span>
                  <span className="tabular text-sm text-ink-500">{formatCurrency(p.price)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* barra de compra fixa no celular */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-ink-100 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs text-ink-500">{product.name}</span>
            <span className="tabular text-lg font-extrabold text-ink-900">{formatCurrency(product.price)}</span>
          </div>
          <AddToCartButton product={product} quantity={qty} size="md" />
        </div>
      </div>
    </div>
  )
}
