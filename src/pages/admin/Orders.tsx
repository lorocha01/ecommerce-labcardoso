import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, Eye, Filter, Search, X } from 'lucide-react'
import type { OrderStatus, PaymentMethod } from '@/types'
import { useStore } from '@/store'
import { AdminPageHeader, Panel } from '@/components/admin/ui'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { endOfDay, startOfDay } from '@/lib/analytics'
import { toCSV } from '@/lib/csv'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { ORDER_STATUSES, PAYMENT_META, STATUS_META } from '@/lib/status'
import { cn, downloadFile, normalize } from '@/lib/utils'

const PAGE = 15

export default function AdminOrders() {
  const orders = useStore((s) => s.orders)
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const q = params.get('q') ?? ''
  const status = (params.get('status') as OrderStatus | null) ?? ''
  const payment = (params.get('payment') as PaymentMethod | null) ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(params)
    if (v) n.set(k, v)
    else n.delete(k)
    setParams(n, { replace: true })
    setPage(1)
  }

  const filtered = useMemo(() => {
    const nq = normalize(q)
    const f = from ? startOfDay(new Date(`${from}T00:00:00`)).getTime() : 0
    const t = to ? endOfDay(new Date(`${to}T00:00:00`)).getTime() : Infinity
    return orders.filter((o) => {
      if (nq && !normalize(`${o.number} ${o.customer.name} ${o.customer.email}`).includes(nq)) return false
      if (status && o.status !== status) return false
      if (payment && o.paymentMethod !== payment) return false
      const ct = new Date(o.createdAt).getTime()
      return ct >= f && ct <= t
    })
  }, [orders, q, status, payment, from, to])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages)
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE)
  const total = filtered.filter((o) => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0)
  const hasFilters = !!(q || status || payment || from || to)

  const exportCsv = () => {
    const csv = toCSV([
      ['Pedido', 'Data', 'Paciente (fictício)', 'E-mail', 'Exames', 'Qtd. exames', 'Valor total (R$)', 'Pagamento', 'Status'],
      ...filtered.map((o) => [o.number, formatDateTime(o.createdAt), o.customer.name, o.customer.email, o.items.map((i) => i.name).join(' | '), o.items.reduce((s, i) => s + i.quantity, 0), o.total, PAYMENT_META[o.paymentMethod].short, STATUS_META[o.status].label]),
    ])
    downloadFile(`pedidos-demonstrativos-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv')
  }

  return (
    <>
      <AdminPageHeader
        title="Pedidos"
        description={`${filtered.length} pedido(s) · ${formatCurrency(total)} em vendas demonstrativas (exceto cancelados)`}
        actions={
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        }
      />

      <Panel bodyClassName="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1.4fr_auto] [&>*]:min-w-0">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Nº do pedido, nome ou e-mail" className="field field-sm pl-9" aria-label="Buscar pedidos" />
          </label>
          <select value={status} onChange={(e) => set('status', e.target.value)} className="field field-sm" aria-label="Filtrar por status">
            <option value="">Todos os status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
          <select value={payment} onChange={(e) => set('payment', e.target.value)} className="field field-sm" aria-label="Filtrar por pagamento">
            <option value="">Todas as formas</option>
            {(Object.keys(PAYMENT_META) as PaymentMethod[]).map((p) => (
              <option key={p} value={p}>
                {PAYMENT_META[p].short}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={from} max={to || undefined} onChange={(e) => set('from', e.target.value)} className="field field-sm min-w-0 flex-1" aria-label="Data inicial" />
            <span className="text-ink-300">–</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => set('to', e.target.value)} className="field field-sm min-w-0 flex-1" aria-label="Data final" />
          </div>
          {hasFilters ? (
            <Button variant="ghost" size="sm" className="h-10" onClick={() => (setParams({}, { replace: true }), setPage(1))}>
              <X className="h-4 w-4" /> Limpar
            </Button>
          ) : (
            <span className="hidden items-center gap-1.5 px-2 text-xs text-ink-400 xl:inline-flex">
              <Filter className="h-3.5 w-3.5" /> Filtros
            </span>
          )}
        </div>
        <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
          {ORDER_STATUSES.map((s) => {
            const count = orders.filter((o) => o.status === s).length
            return (
              <button key={s} type="button" onClick={() => set('status', status === s ? '' : s)} className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition', status === s ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-600 ring-ink-200 hover:ring-ink-300')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[s].dot)} />
                {STATUS_META[s].short} <span className="tabular opacity-60">{count}</span>
              </button>
            )
          })}
        </div>
      </Panel>

      <Panel className="mt-4" bodyClassName="p-0">
        {rows.length === 0 ? (
          <EmptyState icon={Search} title="Nenhum pedido encontrado" description="Ajuste os filtros para encontrar pedidos." />
        ) : (
          <>
            {/* tabela (desktop) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-[11px] uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Pedido</th>
                    <th className="px-3 py-3 font-semibold">Paciente</th>
                    <th className="px-3 py-3 font-semibold">Data</th>
                    <th className="px-3 py-3 font-semibold">Exames</th>
                    <th className="px-3 py-3 text-center font-semibold">Qtd.</th>
                    <th className="px-3 py-3 text-right font-semibold">Total</th>
                    <th className="px-3 py-3 font-semibold">Pagamento</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {rows.map((o) => (
                    <tr key={o.id} className="transition hover:bg-ink-50/60">
                      <td className="px-5 py-3">
                        <Link to={`/admin/pedidos/${o.id}`} className="tabular font-bold text-ink-900 hover:text-brand-700">
                          {o.number}
                        </Link>
                        {!o.seeded && <span className="ml-1.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">LOJA</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className="block font-medium text-ink-800">{o.customer.name}</span>
                        <span className="block text-xs text-ink-400">{o.customer.email}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-ink-600">{formatDateTime(o.createdAt)}</td>
                      <td className="max-w-[220px] px-3 py-3">
                        <span className="line-clamp-2 text-ink-600">{o.items.map((i) => i.name).join(', ')}</span>
                      </td>
                      <td className="tabular px-3 py-3 text-center">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td className="tabular whitespace-nowrap px-3 py-3 text-right font-semibold">{formatCurrency(o.total)}</td>
                      <td className="px-3 py-3 text-ink-600">{PAYMENT_META[o.paymentMethod].short}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={o.status} size="sm" />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link to={`/admin/pedidos/${o.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-white hover:text-brand-700">
                          <Eye className="h-3.5 w-3.5" /> Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* cards (mobile) */}
            <ul className="divide-y divide-ink-100 md:hidden">
              {rows.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/pedidos/${o.id}`} className="block p-4 active:bg-ink-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="tabular font-bold">{o.number}</p>
                        <p className="text-[13px] text-ink-600">{o.customer.name}</p>
                      </div>
                      <span className="tabular font-bold">{formatCurrency(o.total)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge status={o.status} size="sm" />
                      <span className="text-xs text-ink-400">
                        {formatDateTime(o.createdAt)} · {PAYMENT_META[o.paymentMethod].short}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-sm">
              <span className="text-ink-500">
                Página {current} de {pages}
              </span>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setPage(current - 1)} disabled={current <= 1} className="grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset ring-ink-200 disabled:opacity-40" aria-label="Página anterior">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setPage(current + 1)} disabled={current >= pages} className="grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset ring-ink-200 disabled:opacity-40" aria-label="Próxima página">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </>
  )
}
