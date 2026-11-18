import { useState } from 'react'
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ArtTone, Category } from '@/types'
import { useStore } from '@/store'
import { useAdminAuth } from '@/store/adminAuth'
import { AdminPageHeader, Panel } from '@/components/admin/ui'
import { IconPicker, TonePicker } from '@/components/admin/IconPicker'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { DynamicIcon } from '@/components/ui/Icon'
import { TONES } from '@/components/product/ProductArt'
import { cn } from '@/lib/utils'

type Draft = Omit<Category, 'id' | 'order'>

export default function AdminCategories() {
  const categories = useStore((s) => s.categories)
  const products = useStore((s) => s.products)
  const addCategory = useStore((s) => s.addCategory)
  const updateCategory = useStore((s) => s.updateCategory)
  const deleteCategory = useStore((s) => s.deleteCategory)
  const moveCategory = useStore((s) => s.moveCategory)
  const actor = useAdminAuth((s) => s.session?.user ?? 'admin')
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  return (
    <>
      <AdminPageHeader
        title="Categorias"
        description="Organize as categorias exibidas na loja. A ordem definida aqui é usada na página inicial, no menu e no catálogo."
        actions={
          <Button size="sm" onClick={() => setEditing({ id: null, draft: { name: '', slug: '', description: '', icon: 'testtube', tone: 'red', active: true } })}>
            <Plus className="h-4 w-4" /> Nova categoria
          </Button>
        }
      />
      <Panel bodyClassName="p-0">
        <ul className="divide-y divide-ink-100">
          {sorted.map((c, i) => {
            const count = products.filter((p) => p.categoryId === c.id).length
            return (
              <li key={c.id} className={cn('flex flex-wrap items-center gap-4 px-4 py-3.5 transition hover:bg-ink-50/50 sm:px-5', !c.active && 'opacity-60')}>
                <div className="flex flex-col">
                  <button type="button" onClick={() => moveCategory(c.id, -1, actor)} disabled={i === 0} className="grid h-6 w-7 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-30" aria-label="Mover para cima">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => moveCategory(c.id, 1, actor)} disabled={i === sorted.length - 1} className="grid h-6 w-7 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-30" aria-label="Mover para baixo">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="tabular w-5 text-xs font-bold text-ink-400">{i + 1}</span>
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br', TONES[c.tone]?.bg)}>
                  <DynamicIcon name={c.icon} className={cn('h-5 w-5', TONES[c.tone]?.icon)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    /categorias/{c.slug} · {count} exame(s) · {c.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch size="sm" checked={c.active} onChange={(v) => (updateCategory(c.id, { active: v }, actor), toast(v ? 'Categoria ativada.' : 'Categoria desativada — seus exames ficam ocultos na loja.'))} label="Categoria ativa" />
                  <a href={`/categorias/${c.slug}`} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100" title="Ver na loja">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button type="button" onClick={() => setEditing({ id: c.id, draft: { name: c.name, slug: c.slug, description: c.description, icon: c.icon, tone: c.tone, active: c.active } })} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setToDelete(c)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-700" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </Panel>

      {editing && <CategoryForm key={editing.id ?? 'new'} initial={editing.draft} isNew={!editing.id} onClose={() => setEditing(null)} onSave={(d) => {
        if (editing.id) {
          updateCategory(editing.id, d, actor)
          toast.success('Categoria atualizada.')
        } else {
          addCategory(d, actor)
          toast.success('Categoria criada.')
        }
        setEditing(null)
      }} />}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        danger
        title="Excluir categoria"
        confirmText="Excluir"
        description={<>Excluir a categoria <strong>{toDelete?.name}</strong>? Só é possível excluir categorias sem exames vinculados.</>}
        onConfirm={() => {
          if (!toDelete) return
          const r = deleteCategory(toDelete.id, actor)
          if (r.ok) toast.success('Categoria excluída.')
          else toast.error(r.error)
        }}
      />
    </>
  )
}

function CategoryForm({ initial, isNew, onClose, onSave }: { initial: Draft; isNew: boolean; onClose: () => void; onSave: (d: Draft) => void }) {
  const [d, setD] = useState(initial)
  const [error, setError] = useState('')
  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'Nova categoria' : 'Editar categoria'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => (d.name.trim().length < 3 ? setError('Informe o nome da categoria.') : onSave({ ...d, name: d.name.trim() }))}>Salvar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Nome" name="name" value={d.name} onChange={(e) => (setD({ ...d, name: e.target.value }), setError(''))} error={error} />
        <Input label="Identificador na URL" name="slug" value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} hint="Gerado a partir do nome se vazio. Ex.: exames-de-sangue" />
        <Textarea label="Descrição" name="description" rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} />
        <IconPicker value={d.icon} onChange={(icon) => setD({ ...d, icon })} />
        <TonePicker value={d.tone} onChange={(tone: ArtTone) => setD({ ...d, tone })} />
        <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3.5">
          <span className="text-sm font-semibold">Categoria ativa</span>
          <Switch checked={d.active} onChange={(active) => setD({ ...d, active })} label="Categoria ativa" />
        </div>
      </div>
    </Modal>
  )
}
