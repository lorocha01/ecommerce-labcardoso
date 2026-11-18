import { useMemo, useState } from 'react'
import { Copy, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ArtTone, DataStatus, Product } from '@/types'
import { useStore } from '@/store'
import { useAdminAuth } from '@/store/adminAuth'
import { AdminPageHeader, DemoNotice, Panel } from '@/components/admin/ui'
import { ImageField } from '@/components/admin/ImageField'
import { IconPicker, TonePicker } from '@/components/admin/IconPicker'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductArt } from '@/components/product/ProductArt'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn, normalize, slugify } from '@/lib/utils'

type Draft = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

const blank = (categoryId: string): Draft => ({
  slug: '',
  name: '',
  categoryId,
  shortDescription: '',
  description: '',
  purpose: '',
  howItsDone: '',
  preparation: '',
  preparationSummary: 'Sem preparo específico',
  requiresPreparation: false,
  material: 'Sangue',
  resultTime: 'Até 2 dias úteis',
  importantInfo: 'Informação demonstrativa. Confirme as orientações com a equipe do laboratório.',
  price: 0,
  compareAtPrice: undefined,
  includes: [],
  tags: [],
  icon: 'testtube',
  tone: 'red',
  imageUrl: undefined,
  active: true,
  featured: false,
  dataStatus: 'demonstrativo',
})

export default function AdminProducts() {
  const products = useStore((s) => s.products)
  const categories = useStore((s) => s.categories)
  const addProduct = useStore((s) => s.addProduct)
  const updateProduct = useStore((s) => s.updateProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)
  const actor = useAdminAuth((s) => s.session?.user ?? 'admin')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive' | 'featured'>('')
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const list = useMemo(() => {
    const nq = normalize(q)
    return products
      .filter((p) => (!nq || normalize(`${p.name} ${p.tags.join(' ')}`).includes(nq)) && (!cat || p.categoryId === cat))
      .filter((p) => (statusFilter === 'active' ? p.active : statusFilter === 'inactive' ? !p.active : statusFilter === 'featured' ? p.featured : true))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [products, q, cat, statusFilter])

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—'

  return (
    <>
      <AdminPageHeader
        title="Exames"
        description={`${products.length} exames cadastrados · ${products.filter((p) => p.active).length} ativos · ${products.filter((p) => p.featured).length} em destaque`}
        actions={
          <Button size="sm" onClick={() => setEditing({ id: null, draft: blank(categories[0]?.id ?? '') })}>
            <Plus className="h-4 w-4" /> Novo exame
          </Button>
        }
      />
      <DemoNotice className="mb-4">As alterações refletem imediatamente na loja: exames desativados deixam de aparecer no catálogo e o preço é atualizado no carrinho.</DemoNotice>

      <Panel bodyClassName="p-4">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar exame" className="field field-sm pl-9" aria-label="Buscar exame" />
          </label>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="field field-sm" aria-label="Categoria">
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="field field-sm" aria-label="Situação">
            <option value="">Todas as situações</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="featured">Em destaque</option>
          </select>
        </div>
      </Panel>

      <Panel className="mt-4" bodyClassName="p-0">
        {list.length === 0 ? (
          <EmptyState icon={Search} title="Nenhum exame encontrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-[11px] uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Exame</th>
                  <th className="px-3 py-3 font-semibold">Categoria</th>
                  <th className="px-3 py-3 text-right font-semibold">Preço</th>
                  <th className="px-3 py-3 font-semibold">Prazo</th>
                  <th className="px-3 py-3 text-center font-semibold">Destaque</th>
                  <th className="px-3 py-3 text-center font-semibold">Ativo</th>
                  <th className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map((p) => (
                  <tr key={p.id} className={cn('transition hover:bg-ink-50/60', !p.active && 'opacity-60')}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProductArt icon={p.icon} tone={p.tone} imageUrl={p.imageUrl} alt="" size="sm" className="h-11 w-11 shrink-0 rounded-lg" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">{p.name}</p>
                          <p className="text-xs text-ink-400">
                            {p.dataStatus === 'oficial' ? <span className="font-semibold text-emerald-700">Oficial</span> : 'Demonstrativo'} · atualizado {formatDate(p.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-600">{catName(p.categoryId)}</td>
                    <td className="px-3 py-3 text-right">
                      <PriceCell product={p} onSave={(price) => (updateProduct(p.id, { price }, actor), toast.success('Preço atualizado na loja.'))} />
                    </td>
                    <td className="px-3 py-3 text-ink-600">{p.resultTime}</td>
                    <td className="px-3 py-3 text-center">
                      <button type="button" onClick={() => updateProduct(p.id, { featured: !p.featured }, actor)} aria-pressed={p.featured} aria-label="Destacar na página inicial" className={cn('inline-grid h-8 w-8 place-items-center rounded-lg transition', p.featured ? 'text-amber-500' : 'text-ink-300 hover:text-ink-500')}>
                        <Star className={cn('h-[18px] w-[18px]', p.featured && 'fill-amber-400')} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Switch size="sm" checked={p.active} onChange={(v) => (updateProduct(p.id, { active: v }, actor), toast(v ? 'Exame ativado — visível na loja.' : 'Exame desativado — oculto da loja.'))} label="Ativar exame" />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <a href={`/exames/${p.slug}`} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900" title="Ver na loja">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button type="button" onClick={() => setEditing({ id: null, draft: { ...stripMeta(p), name: `${p.name} (cópia)`, slug: '' } })} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900" title="Duplicar">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setEditing({ id: p.id, draft: stripMeta(p) })} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setToDelete(p)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-700" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {editing && (
        <ProductForm
          key={editing.id ?? 'new'}
          initial={editing.draft}
          isNew={!editing.id}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            if (editing.id) {
              updateProduct(editing.id, d, actor)
              toast.success('Exame atualizado.')
            } else {
              const p = addProduct(d, actor)
              toast.success('Exame cadastrado.', { description: p.name })
            }
            setEditing(null)
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        danger
        title="Excluir exame"
        confirmText="Excluir"
        description={
          <>
            Tem certeza que deseja excluir <strong>{toDelete?.name}</strong>? Ele será removido do catálogo, dos carrinhos e dos favoritos. Pedidos já realizados não são alterados. Prefira <em>desativar</em> se quiser apenas ocultá-lo.
          </>
        }
        onConfirm={() => {
          if (toDelete) {
            deleteProduct(toDelete.id, actor)
            toast.success('Exame excluído.')
          }
        }}
      />
    </>
  )
}

function stripMeta(p: Product): Draft {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, ...rest } = p
  return rest
}

function PriceCell({ product, onSave }: { product: Product; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [v, setV] = useState(String(product.price).replace('.', ','))
  if (!editing)
    return (
      <button type="button" onClick={() => (setV(product.price.toFixed(2).replace('.', ',')), setEditing(true))} className="tabular rounded-md px-1.5 py-0.5 font-semibold text-ink-900 underline decoration-dotted decoration-ink-300 underline-offset-4 hover:bg-ink-100" title="Clique para editar o preço">
        {formatCurrency(product.price)}
      </button>
    )
  const commit = () => {
    const n = Number(v.replace(/\./g, '').replace(',', '.'))
    if (Number.isFinite(n) && n > 0 && n !== product.price) onSave(Math.round(n * 100) / 100)
    setEditing(false)
  }
  return (
    <input
      autoFocus
      value={v}
      onChange={(e) => setV(e.target.value.replace(/[^\d,.]/g, ''))}
      onBlur={commit}
      onKeyDown={(e) => (e.key === 'Enter' ? commit() : e.key === 'Escape' && setEditing(false))}
      className="tabular h-8 w-24 rounded-md border border-brand-400 px-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      aria-label="Novo preço"
    />
  )
}

function ProductForm({ initial, isNew, onClose, onSave }: { initial: Draft; isNew: boolean; onClose: () => void; onSave: (d: Draft) => void }) {
  const categories = useStore((s) => s.categories)
  const [d, setD] = useState<Draft>(initial)
  const [priceText, setPriceText] = useState(initial.price ? initial.price.toFixed(2).replace('.', ',') : '')
  const [compareText, setCompareText] = useState(initial.compareAtPrice ? initial.compareAtPrice.toFixed(2).replace('.', ',') : '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<'geral' | 'clinico' | 'visual'>('geral')
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const parse = (t: string) => Number(t.replace(/\./g, '').replace(',', '.'))

  const submit = () => {
    const e: Record<string, string> = {}
    const price = parse(priceText)
    const compare = compareText ? parse(compareText) : undefined
    if (d.name.trim().length < 3) e.name = 'Informe o nome do exame.'
    if (!d.categoryId) e.categoryId = 'Selecione a categoria.'
    if (!Number.isFinite(price) || price <= 0) e.price = 'Preço inválido.'
    if (compare !== undefined && (!Number.isFinite(compare) || compare <= price)) e.compare = 'Deve ser maior que o preço.'
    if (d.shortDescription.trim().length < 5) e.shortDescription = 'Informe uma breve descrição.'
    setErrors(e)
    if (Object.keys(e).length) {
      setTab(e.name || e.categoryId || e.price || e.compare || e.shortDescription ? 'geral' : tab)
      return
    }
    onSave({ ...d, name: d.name.trim(), slug: d.slug ? slugify(d.slug) : '', price: Math.round(price * 100) / 100, compareAtPrice: compare ? Math.round(compare * 100) / 100 : undefined })
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isNew ? 'Novo exame' : 'Editar exame'}
      description="Os campos clínicos só devem ser marcados como oficiais quando fornecidos pelo laboratório."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>{isNew ? 'Cadastrar exame' : 'Salvar alterações'}</Button>
        </>
      }
    >
      <div className="-mt-1 mb-5 flex gap-1 rounded-xl bg-ink-100 p-1">
        {(
          [
            ['geral', 'Dados gerais'],
            ['clinico', 'Informações clínicas'],
            ['visual', 'Imagem e destaque'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={cn('flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition', tab === k ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800')}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'geral' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input wrapClassName="sm:col-span-2" label="Nome do exame" name="name" value={d.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
          <Select label="Categoria" name="categoryId" value={d.categoryId} onChange={(e) => set('categoryId', e.target.value)} error={errors.categoryId}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {!c.active ? ' (inativa)' : ''}
              </option>
            ))}
          </Select>
          <Input label="Identificador na URL (opcional)" name="slug" value={d.slug} onChange={(e) => set('slug', e.target.value)} hint={isNew ? 'Gerado a partir do nome se vazio.' : 'Alterar o identificador muda o link do exame.'} disabled={!isNew} />
          <Input label="Preço (R$)" name="price" inputMode="decimal" value={priceText} onChange={(e) => setPriceText(e.target.value.replace(/[^\d,.]/g, ''))} error={errors.price} placeholder="0,00" required />
          <Input label="Preço anterior (opcional)" name="compare" inputMode="decimal" value={compareText} onChange={(e) => setCompareText(e.target.value.replace(/[^\d,.]/g, ''))} error={errors.compare} placeholder="Para exibir desconto" />
          <Textarea wrapClassName="sm:col-span-2" label="Breve descrição (cards)" name="shortDescription" rows={2} value={d.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} error={errors.shortDescription} />
          <Textarea wrapClassName="sm:col-span-2" label="Descrição completa" name="description" rows={3} value={d.description} onChange={(e) => set('description', e.target.value)} />
          <Input wrapClassName="sm:col-span-2" label="Palavras-chave para busca" name="tags" value={d.tags.join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} hint="Separe por vírgula. Ex.: anemia, sangue, rotina" />
          <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3.5 sm:col-span-2">
            <span>
              <span className="block text-sm font-semibold">Exame ativo</span>
              <span className="text-xs text-ink-500">Exames inativos não aparecem na loja.</span>
            </span>
            <Switch checked={d.active} onChange={(v) => set('active', v)} label="Exame ativo" />
          </div>
        </div>
      )}

      {tab === 'clinico' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea wrapClassName="sm:col-span-2" label="Finalidade — para que serve?" name="purpose" rows={2} value={d.purpose} onChange={(e) => set('purpose', e.target.value)} />
          <Textarea wrapClassName="sm:col-span-2" label="Como é realizado?" name="howItsDone" rows={2} value={d.howItsDone} onChange={(e) => set('howItsDone', e.target.value)} />
          <Textarea wrapClassName="sm:col-span-2" label="Informações sobre o preparo" name="preparation" rows={2} value={d.preparation} onChange={(e) => set('preparation', e.target.value)} />
          <Input label="Resumo do preparo (cards)" name="preparationSummary" value={d.preparationSummary} onChange={(e) => set('preparationSummary', e.target.value)} />
          <div className="flex items-end">
            <label className="flex h-12 w-full cursor-pointer items-center gap-2.5 rounded-xl bg-ink-50 px-3.5 text-sm font-semibold">
              <input type="checkbox" checked={d.requiresPreparation} onChange={(e) => set('requiresPreparation', e.target.checked)} className="h-4 w-4 accent-brand-600" /> Exige preparo
            </label>
          </div>
          <Input label="Material coletado" name="material" value={d.material} onChange={(e) => set('material', e.target.value)} list="materials" />
          <datalist id="materials">
            {['Sangue', 'Urina', 'Fezes', 'Sangue e urina', 'Saliva', 'Secreção'].map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <Input label="Prazo estimado de resultado" name="resultTime" value={d.resultTime} onChange={(e) => set('resultTime', e.target.value)} />
          <Input wrapClassName="sm:col-span-2" label="Exames incluídos (check-ups)" name="includes" value={(d.includes ?? []).join(', ')} onChange={(e) => set('includes', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} hint="Separe por vírgula. Deixe vazio para exames individuais." />
          <Textarea wrapClassName="sm:col-span-2" label="Informações importantes" name="importantInfo" rows={2} value={d.importantInfo} onChange={(e) => set('importantInfo', e.target.value)} />
          <Select wrapClassName="sm:col-span-2" label="Origem das informações" name="dataStatus" value={d.dataStatus} onChange={(e) => set('dataStatus', e.target.value as DataStatus)}>
            <option value="demonstrativo">Demonstrativo — exibe aviso na página do exame</option>
            <option value="oficial">Oficial — validado pelo laboratório</option>
          </Select>
        </div>
      )}

      {tab === 'visual' && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-2xl bg-ink-50 p-4">
            <ProductArt icon={d.icon} tone={d.tone} imageUrl={d.imageUrl} alt="" className="h-24 w-32 shrink-0 rounded-xl" />
            <div className="text-sm text-ink-600">
              <p className="font-semibold text-ink-900">Pré-visualização</p>
              Ilustração exibida nos cards e na página do exame.
            </div>
          </div>
          <ImageField value={d.imageUrl} onChange={(v) => set('imageUrl', v)} label="Imagem ilustrativa (opcional)" />
          <IconPicker value={d.icon} onChange={(v) => set('icon', v)} />
          <TonePicker value={d.tone} onChange={(v: ArtTone) => set('tone', v)} />
          <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3.5">
            <span>
              <span className="block text-sm font-semibold">Destacar na página inicial</span>
              <span className="text-xs text-ink-500">Aparece na seção “Exames mais procurados”.</span>
            </span>
            <Switch checked={d.featured} onChange={(v) => set('featured', v)} label="Destacar na página inicial" />
          </div>
        </div>
      )}
    </Modal>
  )
}
