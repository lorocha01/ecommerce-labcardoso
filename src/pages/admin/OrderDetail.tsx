import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, CreditCard, Hash, Mail, MapPin, Phone, Save, User } from 'lucide-react'
import { toast } from 'sonner'
import type { OrderStatus } from '@/types'
import { useStore } from '@/store'
import { useAdminAuth } from '@/store/adminAuth'
import { AdminPageHeader, DemoNotice, Panel } from '@/components/admin/ui'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
import { ORDER_STATUSES, PAYMENT_META, STATUS_META } from '@/lib/status'
import { cn } from '@/lib/utils'

export default function AdminOrderDetail() {
  const { id } = useParams()
  const order = useStore((s) => s.orders.find((o) => o.id === id))
  const categories = useStore((s) => s.categories)
  const updateStatus = useStore((s) => s.updateOrderStatus)
  const updateNotes = useStore((s) => s.updateOrderNotes)
  const actor = useAdminAuth((s) => s.session?.user ?? 'admin')
  const [status, setStatus] = useState<OrderStatus>('aguardando_confirmacao')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (order) {
      setStatus(order.status)
      setNotes(order.adminNotes)
    }
  }, [order?.id, order?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!order)
    return (
      <Panel>
        <EmptyState icon={Hash} title="Pedido não encontrado" action={<Button to="/admin/pedidos">Voltar aos pedidos</Button>} />
      </Panel>
    )

  const saveStatus = () => {
    if (status === order.status) return toast('Selecione um status diferente do atual.')
    updateStatus(order.id, status, note, actor)
    setNote('')
    toast.success(`Status atualizado para "${STATUS_META[status].label}"`, { description: 'Indicadores do dashboard atualizados.' })
  }

  return (
    <>
      <Link to="/admin/pedidos" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Pedidos
      </Link>
      <AdminPageHeader title={`Pedido ${order.number}`} description={`Realizado em ${formatDateTime(order.createdAt)} · ${order.seeded ? 'pedido de demonstração inicial' : 'pedido simulado na loja virtual'}`} actions={<StatusBadge status={order.status} />} />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Exames adquiridos" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-[11px] uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">Exame</th>
                    <th className="px-3 py-2.5 font-semibold">Categoria</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Valor unit.</th>
                    <th className="px-3 py-2.5 text-center font-semibold">Qtd.</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {order.items.map((i) => (
                    <tr key={i.productId}>
                      <td className="px-5 py-3 font-medium">{i.name}</td>
                      <td className="px-3 py-3 text-ink-500">{categories.find((c) => c.id === i.categoryId)?.name ?? '—'}</td>
                      <td className="tabular px-3 py-3 text-right">{formatCurrency(i.unitPrice)}</td>
                      <td className="tabular px-3 py-3 text-center">{i.quantity}</td>
                      <td className="tabular px-5 py-3 text-right font-semibold">{formatCurrency(i.unitPrice * i.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-ink-200">
                  <tr>
                    <td colSpan={4} className="px-5 py-3 text-right font-bold">
                      Valor total
                    </td>
                    <td className="tabular px-5 py-3 text-right text-lg font-bold">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Panel>

          <Panel title="Histórico de alterações do status">
            <ol className="relative space-y-5 border-l border-ink-200 pl-6">
              {[...order.history].reverse().map((h, idx) => (
                <li key={idx} className="relative">
                  <span className={cn('absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white', STATUS_META[h.status].dot)} />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={h.status} size="sm" />
                    <span className="text-xs text-ink-400">{formatDateTime(h.at)}</span>
                    <span className="text-xs text-ink-400">· por {h.by}</span>
                  </div>
                  {h.note && <p className="mt-1.5 text-[13.5px] text-ink-600">{h.note}</p>}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Alterar status" description="A alteração atualiza o histórico, o dashboard e a área do paciente.">
            <div className="grid grid-cols-2 gap-2">
              {ORDER_STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)} className={cn('flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-semibold ring-1 ring-inset transition', status === s ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-700 ring-ink-200 hover:ring-ink-300')}>
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_META[s].dot)} />
                  <span className="truncate">{STATUS_META[s].label}</span>
                </button>
              ))}
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Observação sobre a alteração (opcional)" className="field mt-3 text-sm" />
            <Button className="mt-3 w-full" onClick={saveStatus} disabled={status === order.status}>
              <Save className="h-4 w-4" /> Salvar status
            </Button>
          </Panel>

          <Panel title="Paciente (fictício)">
            <dl className="space-y-3 text-[13.5px]">
              {[
                { icon: User, v: order.customer.name },
                { icon: Mail, v: order.customer.email },
                { icon: Phone, v: order.customer.phone },
                { icon: Hash, v: `CPF ${order.customer.cpfMasked}` },
                { icon: Calendar, v: `Nascimento: ${order.customer.birthDate ? formatDate(`${order.customer.birthDate}T12:00:00`) : '—'}` },
                { icon: MapPin, v: `${order.customer.address} · ${order.customer.city} · ${order.customer.cep}` },
              ].map(({ icon: Icon, v }, i) => (
                <div key={i} className="flex gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                  <span className="break-words text-ink-700">{v}</span>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Pagamento">
            <div className="flex gap-3 text-[13.5px]">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              <div>
                <p className="font-semibold">{PAYMENT_META[order.paymentMethod].label}</p>
                {order.paymentDetail && <p className="text-ink-500">{order.paymentDetail}</p>}
              </div>
            </div>
          </Panel>

          <Panel title="Observações administrativas">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Anotações internas sobre o pedido" className="field text-sm" />
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => {
                updateNotes(order.id, notes, actor)
                toast.success('Observações salvas.')
              }}
            >
              Salvar observações
            </Button>
          </Panel>
          <DemoNotice>Não há informações reais de saúde ou resultados de exames neste painel.</DemoNotice>
        </div>
      </div>
    </>
  )
}
