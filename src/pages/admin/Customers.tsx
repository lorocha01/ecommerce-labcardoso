import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpDown, Download, Search, Users, X } from 'lucide-react'
import { useStore } from '@/store'
import { AdminPageHeader, DemoNotice, Panel } from '@/components/admin/ui'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { toCSV } from '@/lib/csv'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn, downloadFile, normalize } from '@/lib/utils'

interface Customer {
  key: string
  name: string
  email: string
  phone: string
  firstOrder: string
  lastOrder: string
  orders: number
  total: number
  registered: boolean
}

type SortKey = 'name' | 'orders' | 'total' | 'firstOrder'

export default function AdminCustomers() {
  const orders = useStore((s) => s.orders)
  const users = useStore((s) => s.users)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'total', dir: -1 })
  const [selected, setSelected] = useState<string | null>(null)

  const customers = useMemo(() => {
    const map = new Map<string, Customer>()
    for (const o of [...orders].reverse()) {
      const key = o.customer.email.toLowerCase()
      const c = map.get(key) ?? { key, name: o.customer.name, email: o.customer.email, phone: o.customer.phone, firstOrder: o.createdAt, lastOrder: o.createdAt, orders: 0, total: 0, registered: users.some((u) => u.email.toLowerCase() === key) }
      c.orders++
      if (o.status !== 'cancelado') c.total += o.total
      if (o.createdAt < c.firstOrder) c.firstOrder = o.createdAt
      if (o.createdAt > c.lastOrder) c.lastOrder = o.createdAt
      map.set(key, c)
    }
    return [...map.values()]
  }, [orders, users])

  const list = useMemo(() => {
    const nq = normalize(q)
    return customers
      .filter((c) => !nq || normalize(`${c.name} ${c.email} ${c.phone}`).includes(nq))
      .sort((a, b) => {
        const va = a[sort.key]
        const vb = b[sort.key]
        return (typeof va === 'string' ? va.localeCompare(vb as string, 'pt-BR') : (va as number) - (vb as number)) * sort.dir
      })
  }, [customers, q, sort])

  const sel = customers.find((c) => c.key === selected)
  const selOrders = sel ? orders.filter((o) => o.customer.email.toLowerCase() === sel.key) : []

  const th = (key: SortKey, label: string, align = 'text-left') => (
    <th className={cn('px-3 py-3 font-semibold', align)}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }))} className="inline-flex items-center gap-1 hover:text-ink-900">
        {label} <ArrowUpDown className={cn('h-3 w-3', sort.key === key ? 'text-brand-600' : 'opacity-40')} />
      </button>
    </th>
  )

  return (
    <>
      <AdminPageHeader
        title="Clientes"
        description={`${customers.length} clientes fictícios com pedidos registrados`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadFile(
                `clientes-demonstrativos-${new Date().toISOString().slice(0, 10)}.csv`,
                toCSV([['Nome', 'E-mail', 'Telefone', 'Primeiro pedido', 'Pedidos', 'Total comprado (R$)'], ...list.map((c) => [c.name, c.email, c.phone, formatDate(c.firstOrder), c.orders, c.total])]),
                'text/csv',
              )
            }
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        }
      />
      <DemoNotice className="mb-4">Clientes fictícios. Este painel não exibe informações de saúde nem resultados de exames.</DemoNotice>
      <Panel bodyClassName="p-4">
        <label className="relative block max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone" className="field field-sm pl-9" aria-label="Buscar clientes" />
        </label>
      </Panel>
      <Panel className="mt-4" bodyClassName="p-0">
        {list.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum cliente encontrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-[11px] uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">
                    <button type="button" onClick={() => setSort((s) => ({ key: 'name', dir: s.key === 'name' ? (s.dir === 1 ? -1 : 1) : 1 }))} className="inline-flex items-center gap-1 hover:text-ink-900">
                      Nome <ArrowUpDown className={cn('h-3 w-3', sort.key === 'name' ? 'text-brand-600' : 'opacity-40')} />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">E-mail</th>
                  <th className="px-3 py-3 text-left font-semibold">Telefone</th>
                  {th('firstOrder', 'Primeiro pedido')}
                  {th('orders', 'Pedidos', 'text-center')}
                  {th('total', 'Total comprado', 'text-right')}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map((c) => (
                  <tr key={c.key} onClick={() => setSelected(c.key)} className="cursor-pointer transition hover:bg-ink-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-peach-100 text-xs font-bold text-brand-800">
                          {c.name
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                        <span className="font-semibold text-ink-900">
                          {c.name}
                          {c.registered && <span className="ml-1.5 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">CONTA</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-600">{c.email}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-600">{c.phone}</td>
                    <td className="px-3 py-3 text-ink-600">{formatDate(c.firstOrder)}</td>
                    <td className="tabular px-3 py-3 text-center">{c.orders}</td>
                    <td className="tabular px-3 py-3 text-right font-semibold">{formatCurrency(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Drawer open={!!sel} onClose={() => setSelected(null)} className="max-w-md" label="Histórico do cliente">
        {sel && (
          <>
            <div className="flex items-start justify-between border-b border-ink-100 p-5">
              <div>
                <p className="text-lg font-bold">{sel.name}</p>
                <p className="text-sm text-ink-500">{sel.email}</p>
                <p className="text-sm text-ink-500">{sel.phone}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-full bg-ink-100" aria-label="Fechar">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-px border-b border-ink-100 bg-ink-100">
              {[
                ['Pedidos', String(sel.orders)],
                ['Total', formatCurrency(sel.total)],
                ['Cliente desde', formatDate(sel.firstOrder, { month: 'short', year: 'numeric' })],
              ].map(([l, v]) => (
                <div key={l} className="bg-white p-4">
                  <p className="text-[11px] uppercase tracking-wider text-ink-400">{l}</p>
                  <p className="tabular mt-1 font-bold">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-500">Histórico de pedidos</h3>
              <ul className="space-y-2">
                {selOrders.map((o) => (
                  <li key={o.id}>
                    <Link to={`/admin/pedidos/${o.id}`} className="block rounded-xl border border-ink-100 p-3.5 transition hover:border-ink-200 hover:shadow-soft">
                      <div className="flex items-center justify-between">
                        <span className="tabular font-bold">{o.number}</span>
                        <span className="tabular font-semibold">{formatCurrency(o.total)}</span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-ink-500">{o.items.map((i) => i.name).join(', ')}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <StatusBadge status={o.status} size="sm" />
                        <span className="text-xs text-ink-400">{formatDate(o.createdAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Drawer>
    </>
  )
}
