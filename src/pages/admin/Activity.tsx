import { useMemo, useState } from 'react'
import { Activity as ActivityIcon, Edit3, FileDown, Image, LogIn, LogOut, PackageCheck, PlusCircle, RotateCcw, Search, Settings, Tag, Trash2, Upload } from 'lucide-react'
import type { ActivityType } from '@/types'
import { useStore } from '@/store'
import { useAdminAuth } from '@/store/adminAuth'
import { AdminPageHeader, Panel } from '@/components/admin/ui'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { toCSV } from '@/lib/csv'
import { formatDate, formatDateTime } from '@/lib/format'
import { cn, downloadFile, normalize } from '@/lib/utils'

const META: Record<ActivityType, { label: string; icon: typeof LogIn; tone: string }> = {
  login: { label: 'Login realizado', icon: LogIn, tone: 'bg-sky-50 text-sky-700' },
  logout: { label: 'Logout', icon: LogOut, tone: 'bg-ink-100 text-ink-600' },
  produto_criado: { label: 'Exame cadastrado', icon: PlusCircle, tone: 'bg-emerald-50 text-emerald-700' },
  produto_editado: { label: 'Exame editado', icon: Edit3, tone: 'bg-amber-50 text-amber-700' },
  produto_excluido: { label: 'Exame excluído', icon: Trash2, tone: 'bg-brand-50 text-brand-700' },
  pedido_atualizado: { label: 'Pedido atualizado', icon: PackageCheck, tone: 'bg-violet-50 text-violet-700' },
  categoria_criada: { label: 'Categoria criada', icon: Tag, tone: 'bg-emerald-50 text-emerald-700' },
  categoria_editada: { label: 'Categoria editada', icon: Tag, tone: 'bg-amber-50 text-amber-700' },
  categoria_excluida: { label: 'Categoria excluída', icon: Tag, tone: 'bg-brand-50 text-brand-700' },
  banner_alterado: { label: 'Banner alterado', icon: Image, tone: 'bg-peach-100 text-brand-800' },
  configuracao_modificada: { label: 'Configuração modificada', icon: Settings, tone: 'bg-ink-100 text-ink-700' },
  dados_restaurados: { label: 'Dados restaurados', icon: RotateCcw, tone: 'bg-ink-100 text-ink-700' },
  dados_importados: { label: 'Dados importados', icon: Upload, tone: 'bg-sky-50 text-sky-700' },
}

export default function AdminActivity() {
  const activity = useStore((s) => s.activity)
  const clearActivity = useStore((s) => s.clearActivity)
  const actor = useAdminAuth((s) => s.session?.user ?? 'admin')
  const [q, setQ] = useState('')
  const [type, setType] = useState<ActivityType | ''>('')
  const [confirm, setConfirm] = useState(false)

  const list = useMemo(() => activity.filter((a) => (!type || a.type === type) && (!q || normalize(`${a.description} ${a.user}`).includes(normalize(q)))), [activity, q, type])
  const groups = useMemo(() => {
    const m = new Map<string, typeof list>()
    for (const a of list) {
      const k = formatDate(a.at, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
      m.set(k, [...(m.get(k) ?? []), a])
    }
    return [...m.entries()]
  }, [list])

  return (
    <>
      <AdminPageHeader
        title="Log de atividades"
        description={`${activity.length} registro(s) armazenados localmente`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => downloadFile(`atividades-${new Date().toISOString().slice(0, 10)}.csv`, toCSV([['Data e horário', 'Ação', 'Descrição', 'Usuário'], ...list.map((a) => [formatDateTime(a.at), META[a.type]?.label ?? a.type, a.description, a.user])]), 'text/csv')}>
              <FileDown className="h-4 w-4" /> Exportar CSV
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
              Limpar log
            </Button>
          </>
        }
      />
      <Panel bodyClassName="p-4">
        <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar na descrição" className="field field-sm pl-9" aria-label="Buscar atividades" />
          </label>
          <select value={type} onChange={(e) => setType(e.target.value as ActivityType | '')} className="field field-sm" aria-label="Tipo de ação">
            <option value="">Todas as ações</option>
            {(Object.keys(META) as ActivityType[]).map((t) => (
              <option key={t} value={t}>
                {META[t].label}
              </option>
            ))}
          </select>
        </div>
      </Panel>
      <div className="mt-4 space-y-6">
        {groups.length === 0 && (
          <Panel>
            <EmptyState icon={ActivityIcon} title="Nenhuma atividade encontrada" />
          </Panel>
        )}
        {groups.map(([day, items]) => (
          <div key={day}>
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-400">{day}</p>
            <Panel bodyClassName="p-0">
              <ul className="divide-y divide-ink-100">
                {items.map((a) => {
                  const m = META[a.type] ?? META.configuracao_modificada
                  return (
                    <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', m.tone)}>
                        <m.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-semibold text-ink-900">{m.label}</p>
                        <p className="text-[13px] text-ink-600">{a.description}</p>
                      </div>
                      <div className="shrink-0 text-right text-xs text-ink-400">
                        <p className="tabular font-semibold text-ink-600">{new Date(a.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p>{a.user}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Panel>
          </div>
        ))}
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} danger title="Limpar log de atividades" confirmText="Limpar" description="Todos os registros serão removidos deste navegador." onConfirm={() => clearActivity(actor)} />
    </>
  )
}
