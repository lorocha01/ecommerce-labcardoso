import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, FlaskConical, Info, Lock, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/store'
import { useCart, useCategoryMap, usePublicProducts } from '@/store/hooks'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { ProductArt } from '@/components/product/ProductArt'
import { ProductCard } from '@/components/product/ProductCard'
import { Steps } from '@/components/checkout/Steps'
import { formatCurrency, plural } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { MAX_QTY } from '@/store'
import { shopUrl } from '@/lib/routes'

export default function Cart() {
  useDocumentTitle('Carrinho')
  const { lines, subtotal, total, savings, count } = useCart()
  const setQuantity = useStore((s) => s.setQuantity)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const addToCart = useStore((s) => s.addToCart)
  const clearCart = useStore((s) => s.clearCart)
  const cartRaw = useStore((s) => s.cart)
  const categories = useCategoryMap()
  const products = usePublicProducts()

  const suggestions = products.filter((p) => p.featured && !lines.some((l) => l.product.id === p.id)).slice(0, 4)
  const prepItems = lines.filter((l) => l.product.requiresPreparation)

  const remove = (id: string, name: string, qty: number) => {
    removeFromCart(id)
    toast(`${name} removido do carrinho`, { action: { label: 'Desfazer', onClick: () => addToCart(id, qty) } })
  }

  const clear = () => {
    const snapshot = [...cartRaw]
    clearCart()
    toast('Carrinho esvaziado', { action: { label: 'Desfazer', onClick: () => snapshot.forEach((c) => addToCart(c.productId, c.quantity)) } })
  }

  return (
    <div className="container py-8 lg:py-12">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="display text-4xl font-medium sm:text-5xl">Seu carrinho</h1>
          <p className="mt-2 text-ink-500">{count > 0 ? `${plural(count, 'exame selecionado', 'exames selecionados')}` : 'Nenhum exame adicionado ainda'}</p>
        </div>
        <div className="lg:w-[520px] xl:w-[640px]">
          <Steps current={0} />
        </div>
      </div>

      {lines.length === 0 ? (
        <>
          <div className="card">
            <EmptyState
              icon={ShoppingBag}
              title="Seu carrinho está vazio"
              description="Explore o catálogo, consulte o preparo de cada exame e adicione os que você precisa realizar."
              action={
                <>
                  <Button to="/exames">Comprar exames</Button>
                  <Button to={shopUrl('check-ups')} variant="secondary">
                    Conhecer check-ups
                  </Button>
                </>
              }
            />
          </div>
          {suggestions.length > 0 && (
            <section className="mt-14">
              <h2 className="display mb-6 text-3xl font-medium">Exames mais procurados</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {suggestions.map((p) => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="overflow-hidden rounded-[28px] border border-ink-100 bg-white">
              <div className="hidden grid-cols-[1fr_140px_120px_44px] gap-4 border-b border-ink-100 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400 md:grid">
                <span>Exame</span>
                <span className="text-center">Quantidade</span>
                <span className="text-right">Total</span>
                <span />
              </div>
              <ul className="divide-y divide-ink-100">
                <AnimatePresence initial={false}>
                  {lines.map(({ product, quantity, lineTotal }) => (
                    <motion.li key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }} className="overflow-hidden">
                      <div className="grid grid-cols-[72px_1fr] gap-4 p-4 sm:p-6 md:grid-cols-[1fr_140px_120px_44px] md:items-center">
                        <div className="contents md:flex md:items-center md:gap-4">
                          <Link to={`/exames/${product.slug}`} className="shrink-0 overflow-hidden rounded-2xl">
                            <ProductArt icon={product.icon} tone={product.tone} imageUrl={product.imageUrl} alt="" size="sm" className="h-[72px] w-[72px]" />
                          </Link>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">{categories[product.categoryId]?.name}</span>
                            <Link to={`/exames/${product.slug}`} className="mt-0.5 block font-bold leading-snug text-ink-900 hover:text-brand-700">
                              {product.name}
                            </Link>
                            <span className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-500">
                              <FlaskConical className="h-3.5 w-3.5" /> {product.preparationSummary}
                            </span>
                            <span className="tabular mt-1 block text-[13px] text-ink-500">{formatCurrency(product.price)} / unidade</span>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-between gap-3 md:contents">
                          <div className="md:flex md:justify-center">
                            <QuantityStepper value={quantity} onChange={(v) => setQuantity(product.id, v)} max={MAX_QTY} size="sm" />
                          </div>
                          <span className="tabular text-right text-lg font-extrabold text-ink-900">{formatCurrency(lineTotal)}</span>
                          <button type="button" onClick={() => remove(product.id, product.name, quantity)} className="grid h-10 w-10 place-items-center rounded-xl text-ink-400 transition hover:bg-brand-50 hover:text-brand-700" aria-label={`Remover ${product.name}`}>
                            <Trash2 className="h-[18px] w-[18px]" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Button to="/exames" variant="ghost">
                <ArrowLeft className="h-4 w-4" /> Continuar comprando
              </Button>
              <button type="button" onClick={clear} className="text-sm font-semibold text-ink-500 hover:text-brand-700">
                Esvaziar carrinho
              </button>
            </div>

            {prepItems.length > 0 && (
              <div className="mt-6 rounded-[24px] border border-peach-300 bg-peach-50 p-5">
                <p className="flex items-center gap-2 font-bold text-ink-900">
                  <FlaskConical className="h-5 w-5 text-brand-600" /> Atenção ao preparo
                </p>
                <ul className="mt-3 space-y-1.5 text-[14px] text-ink-700">
                  {prepItems.map((l) => (
                    <li key={l.product.id}>
                      <strong>{l.product.name}:</strong> {l.product.preparationSummary}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-ink-500">Orientações demonstrativas. Quando houver exames com preparos diferentes, siga sempre o mais restritivo e confirme com o laboratório.</p>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-[150px] lg:self-start">
            <div className="rounded-[28px] border border-ink-100 bg-white p-6 shadow-card">
              <h2 className="text-lg font-bold">Resumo do pedido</h2>
              <dl className="mt-5 space-y-3 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-ink-500">Subtotal ({plural(count, 'item', 'itens')})</dt>
                  <dd className="tabular font-semibold">{formatCurrency(subtotal)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Economia em combos</dt>
                    <dd className="tabular font-semibold">− {formatCurrency(savings)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-500">Taxa de serviço</dt>
                  <dd className="font-semibold text-emerald-700">Grátis</dd>
                </div>
              </dl>
              <div className="mt-5 flex items-end justify-between border-t border-dashed border-ink-200 pt-5">
                <span className="font-bold">Total</span>
                <span className="tabular display text-3xl font-semibold">{formatCurrency(total)}</span>
              </div>
              <Button to="/checkout" size="lg" className="mt-6 w-full">
                Prosseguir para finalização <ArrowRight className="arrow h-4 w-4" />
              </Button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
                <Lock className="h-3.5 w-3.5" /> Checkout demonstrativo — sem cobrança real
              </p>
            </div>
            <div className="mt-4 flex gap-3 rounded-2xl bg-ink-50 p-4 text-[13px] text-ink-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              Valores demonstrativos. Os dados do carrinho ficam salvos apenas neste navegador.
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
