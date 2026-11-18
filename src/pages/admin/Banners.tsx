import { useState } from 'react'
import { ArrowDown, ArrowUp, ClipboardList, Eye, FlaskConical, Pencil, Plus, Tractor, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Banner } from '@/types'
import { useStore } from '@/store'
import { useAdminAuth } from '@/store/adminAuth'
import { AdminPageHeader, DemoNotice, Panel } from '@/components/admin/ui'
import { ImageField } from '@/components/admin/ImageField'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { HeroArt } from '@/components/home/HeroArt'
import { cn } from '@/lib/utils'

type Draft = Omit<Banner, 'id' | 'order'>

const INTERNAL_LINKS = [
  ['/exames', 'Catálogo de exames'],
  ['/categorias/check-ups', 'Check-ups'],
  ['/categorias/exames-de-sangue', 'Exames de sangue'],
  ['/sobre', 'Sobre o laboratório'],
  ['/contato', 'Contato'],
  ['/faq', 'Perguntas frequentes'],
  ['/minha-conta', 'Minha conta'],
]

const blank: Draft = { eyebrow: '', title: '', highlight: '', subtitle: '', art: 'lab', imageUrl: undefined, primaryText: 'Confira nossos exames', primaryLink: '/exames', secondaryText: 'Conheça o laboratório', secondaryLink: '/sobre', active: true }

export default function AdminBanners() {
  const banners = useStore((s) => s.banners)
  const addBanner = useStore((s) => s.addBanner)
  const updateBanner = useStore((s) => s.updateBanner)
  const deleteBanner = useStore((s) => s.deleteBanner)
  const moveBanner = useStore((s) => s.moveBanner)
  const actor = useAdminAuth((s) => s.session?.user ?? 'admin')
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const [toDelete, setToDelete] = useState<Banner | null>(null)
  const sorted = [...banners].sort((a, b) => a.order - b.order)

  return (
    <>
      <AdminPageHeader
        title="Banners"
        description="Destaques rotativos exibidos no topo da página inicial."
        actions={
          <>
            <Button variant="secondary" size="sm" href="/" external>
              <Eye className="h-4 w-4" /> Ver página inicial
            </Button>
            <Button size="sm" onClick={() => setEditing({ id: null, draft: blank })}>
              <Plus className="h-4 w-4" /> Novo banner
            </Button>
          </>
        }
      />
      <DemoNotice className="mb-4">Somente banners ativos aparecem no carrossel, na ordem definida abaixo. As alterações refletem imediatamente na página inicial.</DemoNotice>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {sorted.map((b, i) => (
          <Panel key={b.id} bodyClassName="p-0" className={cn(!b.active && 'opacity-60')}>
            <div className="relative h-44 overflow-hidden rounded-t-2xl bg-gradient-to-br from-white to-peach-50">
              <div className="absolute inset-y-0 left-0 z-10 flex w-[58%] flex-col justify-center p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">{b.eyebrow}</p>
                <p className="display mt-1 line-clamp-3 text-lg leading-tight text-ink-900">
                  {b.title} <em className="text-brand-600">{b.highlight}</em>
                </p>
              </div>
              <BannerThumb banner={b} />
              <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-ink-700 shadow-soft">#{i + 1}</span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-ink-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Switch size="sm" checked={b.active} onChange={(v) => (updateBanner(b.id, { active: v }, actor), toast(v ? 'Banner ativado.' : 'Banner desativado.'))} label="Banner ativo" />
                <span className="text-xs font-semibold text-ink-500">{b.active ? 'Ativo' : 'Inativo'}</span>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => moveBanner(b.id, -1, actor)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label="Mover para cima">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveBanner(b.id, 1, actor)} disabled={i === sorted.length - 1} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label="Mover para baixo">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setEditing({ id: b.id, draft: { ...b } })} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setToDelete(b)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-700" aria-label="Excluir">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {editing && (
        <BannerForm
          key={editing.id ?? 'new'}
          initial={editing.draft}
          isNew={!editing.id}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            if (editing.id) updateBanner(editing.id, d, actor)
            else addBanner(d, actor)
            toast.success(editing.id ? 'Banner atualizado.' : 'Banner adicionado.')
            setEditing(null)
          }}
        />
      )}
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} danger title="Excluir banner" confirmText="Excluir" description="Este banner será removido da página inicial." onConfirm={() => toDelete && (deleteBanner(toDelete.id, actor), toast.success('Banner excluído.'))} />
    </>
  )
}

function BannerForm({ initial, isNew, onClose, onSave }: { initial: Draft; isNew: boolean; onClose: () => void; onSave: (d: Draft) => void }) {
  const [d, setD] = useState<Draft>(initial)
  const [error, setError] = useState('')
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={isNew ? 'Novo banner' : 'Editar banner'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => (d.title.trim().length < 3 ? setError('Informe o título.') : onSave(d))}>Salvar banner</Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <Input label="Texto de apoio (acima do título)" name="eyebrow" value={d.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Título" name="title" value={d.title} onChange={(e) => (set('title', e.target.value), setError(''))} error={error} />
            <Input label="Destaque do título (itálico)" name="highlight" value={d.highlight} onChange={(e) => set('highlight', e.target.value)} />
          </div>
          <Textarea label="Subtítulo" name="subtitle" rows={3} value={d.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Texto do botão principal" name="primaryText" value={d.primaryText} onChange={(e) => set('primaryText', e.target.value)} />
            <Input label="Link do botão principal" name="primaryLink" value={d.primaryLink} onChange={(e) => set('primaryLink', e.target.value)} list="internal-links" />
            <Input label="Texto do botão secundário" name="secondaryText" value={d.secondaryText} onChange={(e) => set('secondaryText', e.target.value)} />
            <Input label="Link do botão secundário" name="secondaryLink" value={d.secondaryLink} onChange={(e) => set('secondaryLink', e.target.value)} list="internal-links" />
          </div>
          <datalist id="internal-links">
            {INTERNAL_LINKS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </datalist>
          <Select label="Ilustração (quando não houver imagem)" name="art" value={d.art} onChange={(e) => set('art', e.target.value as Draft['art'])}>
            <option value="lab">Tubos de laboratório</option>
            <option value="checkup">Lista de check-up</option>
            <option value="family">Do campo até a cidade</option>
            <option value="heritage">Ano de fundação</option>
          </Select>
          <ImageField value={d.imageUrl} onChange={(v) => set('imageUrl', v)} label="Imagem do banner (opcional)" maxSize={1400} />
          <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3.5">
            <span className="text-sm font-semibold">Banner ativo</span>
            <Switch checked={d.active} onChange={(v) => set('active', v)} label="Banner ativo" />
          </div>
        </div>
        <div>
          <span className="field-label">Pré-visualização</span>
          <div className="sticky top-0 overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-b from-white to-canvas p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700">{d.eyebrow || 'Texto de apoio'}</p>
            <p className="display mt-2 text-3xl leading-[1.05] text-ink-900">
              {d.title || 'Título do banner'} <em className="text-brand-600">{d.highlight}</em>
            </p>
            <p className="mt-3 text-sm text-ink-600">{d.subtitle || 'Subtítulo do banner.'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {d.primaryText && <span className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white">{d.primaryText}</span>}
              {d.secondaryText && <span className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-ink-900 ring-1 ring-ink-200">{d.secondaryText}</span>}
            </div>
            <div className="mx-auto mt-6 max-w-[300px]">
              <HeroArt banner={{ ...d, id: 'preview', order: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function BannerThumb({ banner }: { banner: Banner }) {
  const Icon = banner.art === 'checkup' ? ClipboardList : banner.art === 'family' ? Tractor : FlaskConical
  return (
    <div className="absolute bottom-4 right-4 top-4 w-[36%] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-900 shadow-card">
      {banner.imageUrl ? (
        <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : banner.art === 'heritage' ? (
        <span className="display grid h-full place-items-center text-3xl italic text-white/90">1974</span>
      ) : (
        <span className="grid h-full place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
            <Icon className="h-7 w-7 text-white" strokeWidth={1.5} />
          </span>
        </span>
      )}
      <span className="absolute left-2.5 top-2.5 h-2.5 w-2.5 rounded-[3px] bg-white/80" />
      <span className="absolute left-6 top-2 h-1.5 w-1.5 rounded-[2px] bg-white/50" />
    </div>
  )
}
