import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, Download, Receipt, ShoppingCart, Wallet } from 'lucide-react'
import { useStore } from '@/store'
import { useAdminPrefs } from '@/store/adminPrefs'
import { AdminPageHeader, ChartTooltip, DemoNotice, Panel, PeriodFilter, Segmented, StatCard } from '@/components/admin/ui'
import { Button } from '@/components/ui/Button'
import { autoGranularity, buildSeries, computeKpis, delta, getRange, inRange, previousRange, revenueByPayment, topProductsByRevenue, type Granularity } from '@/lib/analytics'
import { AXIS, GRID, SERIES } from '@/lib/chartColors'
import { toCSV } from '@/lib/csv'
import { formatCurrency, formatCurrencyCompact, formatDate, formatDateTime, formatNumber } from '@/lib/format'
import { PAYMENT_META, STATUS_META } from '@/lib/status'
import { downloadFile } from '@/lib/utils'

const axisProps = { stroke: AXIS, fontSize: 11, tickLine: false, axisLine: false } as const

export default function AdminFinance() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const { period, custom } = useAdminPrefs()
  const range = useMemo(() => getRange(period, custom), [period, custom])
  const [gran, setGran] = useState<Granularity | 'auto'>('auto')
  const granularity = gran === 'auto' ? autoGranularity(range) : gran

  const d = useMemo(() => {
    const cur = orders.filter((o) => inRange(o, range))
    const prev = orders.filter((o) => inRange(o, previousRange(range)))
    return {
      cur,
      k: computeKpis(cur, products.length),
      pk: computeKpis(prev, products.length),
      series: buildSeries(orders, range, granularity),
      payments: revenueByPayment(cur),
      top: topProductsByRevenue(cur, 10),
    }
  }, [orders, products.length, range, granularity])

  const totalPay = d.payments.reduce((s, p) => s + p.revenue, 0) || 1
  const stamp = `${formatDate(range.from.toISOString()).replace(/\//g, '-')}_a_${formatDate(range.to.toISOString()).replace(/\//g, '-')}`
  const exportOrders = () =>
    downloadFile(
      `financeiro-pedidos_${stamp}.csv`,
      toCSV([
        ['DADOS DEMONSTRATIVOS — NÃO REPRESENTAM FATURAMENTO REAL'],
        ['Pedido', 'Data', 'Paciente (fictício)', 'Forma de pagamento', 'Status', 'Considerado no faturamento', 'Valor (R$)'],
        ...d.cur.map((o) => [o.number, formatDateTime(o.createdAt), o.customer.name, PAYMENT_META[o.paymentMethod].short, STATUS_META[o.status].label, o.status === 'cancelado' ? 'Não' : 'Sim', o.total]),
      ]),
      'text/csv',
    )
  const exportSummary = () =>
    downloadFile(
      `financeiro-resumo_${stamp}.csv`,
      toCSV([
        ['DADOS DEMONSTRATIVOS — NÃO REPRESENTAM FATURAMENTO REAL'],
        ['Período', `${formatDate(range.from.toISOString())} a ${formatDate(range.to.toISOString())}`],
        ['Faturamento bruto (R$)', d.k.sales],
        ['Total de pedidos', d.k.orders],
        ['Pedidos cancelados', d.k.cancelled],
        ['Valor médio por pedido (R$)', Math.round(d.k.avgTicket * 100) / 100],
        [],
        ['Vendas por período'],
        ['Período', 'Vendas (R$)', 'Pedidos'],
        ...d.series.map((p) => [p.label, p.sales, p.orders]),
        [],
        ['Valores por forma de pagamento'],
        ['Forma', 'Pedidos', 'Valor (R$)'],
        ...d.payments.map((p) => [PAYMENT_META[p.method].short, p.orders, Math.round(p.revenue * 100) / 100]),
        [],
        ['Exames com maior faturamento'],
        ['Exame', 'Unidades', 'Faturamento (R$)'],
        ...d.top.map((t) => [t.name, t.quantity, Math.round(t.revenue * 100) / 100]),
      ]),
      'text/csv',
    )

  return (
    <>
      <AdminPageHeader
        title="Financeiro"
        description={`${formatDate(range.from.toISOString())} a ${formatDate(range.to.toISOString())}`}
        actions={
          <>
            <PeriodFilter />
          </>
        }
      />
      <DemoNotice className="mb-6">
        <strong>Relatório demonstrativo.</strong> Os valores abaixo são calculados a partir de pedidos fictícios e simulados e <strong>não devem ser apresentados como faturamento real</strong>. Pedidos cancelados não entram no faturamento.
      </DemoNotice>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard index={0} label="Faturamento bruto (demo)" value={formatCurrency(d.k.sales)} icon={Wallet} tone="brand" delta={delta(d.k.sales, d.pk.sales)} hint="vs. anterior" />
        <StatCard index={1} label="Total de pedidos" value={formatNumber(d.k.orders)} icon={ShoppingCart} delta={delta(d.k.orders, d.pk.orders)} hint="vs. anterior" />
        <StatCard index={2} label="Valor médio por pedido" value={formatCurrency(d.k.avgTicket)} icon={Receipt} delta={delta(d.k.avgTicket, d.pk.avgTicket)} hint="vs. anterior" />
        <StatCard index={3} label="Exames vendidos" value={formatNumber(d.k.examsSold)} icon={Banknote} hint="unidades no período" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={exportSummary}>
          <Download className="h-4 w-4" /> Exportar resumo (CSV)
        </Button>
        <Button variant="secondary" size="sm" onClick={exportOrders}>
          <Download className="h-4 w-4" /> Exportar pedidos do período (CSV)
        </Button>
      </div>

      <Panel
        className="mt-6"
        title="Vendas por período"
        description="Faturamento demonstrativo agrupado"
        actions={
          <Segmented
            value={gran}
            onChange={setGran}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'day', label: 'Dia' },
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mês' },
            ]}
          />
        }
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" {...axisProps} minTickGap={14} />
              <YAxis {...axisProps} tickFormatter={(v) => formatCurrencyCompact(v)} width={64} />
              <Tooltip content={<ChartTooltip format={(v, k) => (k === 'sales' ? formatCurrency(v) : String(v))} />} cursor={{ fill: 'rgba(28,21,20,.04)' }} />
              <Bar dataKey="sales" name="Vendas" fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="Valores por forma de pagamento">
          <div className="flex h-4 overflow-hidden rounded-full bg-ink-100">
            {d.payments.map((p, i) => (
              <div key={p.method} title={`${PAYMENT_META[p.method].short}: ${formatCurrency(p.revenue)}`} className="h-full border-r-2 border-white last:border-r-0 transition-all duration-700" style={{ width: `${(p.revenue / totalPay) * 100}%`, background: SERIES[i] }} />
            ))}
          </div>
          <table className="mt-5 w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-ink-400">
              <tr>
                <th className="pb-2 font-semibold">Forma</th>
                <th className="pb-2 text-center font-semibold">Pedidos</th>
                <th className="pb-2 text-right font-semibold">Valor</th>
                <th className="pb-2 text-right font-semibold">%</th>
              </tr>
            </thead>
            <tbody className="tabular divide-y divide-ink-100">
              {d.payments.map((p, i) => (
                <tr key={p.method}>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERIES[i] }} />
                      {PAYMENT_META[p.method].short}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">{p.orders}</td>
                  <td className="py-2.5 text-right font-semibold">{formatCurrency(p.revenue)}</td>
                  <td className="py-2.5 text-right text-ink-500">{((p.revenue / totalPay) * 100).toFixed(1).replace('.', ',')}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Exames que geraram maior faturamento" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-[11px] uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">#</th>
                  <th className="px-3 py-2.5 font-semibold">Exame</th>
                  <th className="px-3 py-2.5 text-center font-semibold">Unidades</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {d.top.map((t, i) => (
                  <tr key={t.id}>
                    <td className="tabular px-5 py-2.5 text-ink-400">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium">{t.name}</td>
                    <td className="tabular px-3 py-2.5 text-center">{t.quantity}</td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="tabular font-semibold">{formatCurrency(t.revenue)}</span>
                      <div className="ml-auto mt-1 h-1 w-24 overflow-hidden rounded-full bg-ink-100">
                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(t.revenue / (d.top[0]?.revenue || 1)) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
                {d.top.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-ink-400">
                      Sem vendas no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  )
}
