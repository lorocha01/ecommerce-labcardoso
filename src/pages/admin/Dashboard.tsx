import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Ban, CheckCircle2, Clock, DollarSign, FlaskConical, Receipt, ShoppingCart, TrendingUp } from 'lucide-react'
import { useStore } from '@/store'
import { useAdminPrefs } from '@/store/adminPrefs'
import { AdminPageHeader, ChartTooltip, DemoNotice, Legend, Panel, PeriodFilter, Segmented, StatCard } from '@/components/admin/ui'
import { StatusBadge } from '@/components/ui/Badge'
import { autoGranularity, buildSeries, computeKpis, delta, getRange, inRange, previousRange, topCategories, topProducts, type Granularity } from '@/lib/analytics'
import { AXIS, GRID, PREVIOUS, SERIES } from '@/lib/chartColors'
import { formatCurrency, formatCurrencyCompact, formatDate, formatNumber } from '@/lib/format'
import { ORDER_STATUSES, STATUS_META } from '@/lib/status'
import { cn } from '@/lib/utils'

const axisProps = { stroke: AXIS, fontSize: 11, tickLine: false, axisLine: false } as const

export default function Dashboard() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const categories = useStore((s) => s.categories)
  const { period, custom } = useAdminPrefs()
  const range = useMemo(() => getRange(period, custom), [period, custom])
  const [gran, setGran] = useState<Granularity | 'auto'>('auto')
  const granularity = gran === 'auto' ? autoGranularity(range) : gran
  const [ordersView, setOrdersView] = useState<'chart' | 'table'>('chart')

  const data = useMemo(() => {
    const cur = orders.filter((o) => inRange(o, range))
    const prev = orders.filter((o) => inRange(o, previousRange(range)))
    const k = computeKpis(cur, products.length)
    const pk = computeKpis(prev, products.length)
    const series = buildSeries(orders, range, granularity)
    let acc = 0
    const cumulative = series.map((p) => ({ ...p, cumulative: (acc += p.sales) }))
    const statusCounts = ORDER_STATUSES.map((s) => ({ status: s, label: STATUS_META[s].short, count: cur.filter((o) => o.status === s).length }))
    return { cur, k, pk, series: cumulative, top: topProducts(cur, 6), cats: topCategories(cur, categories).slice(0, 6), statusCounts }
  }, [orders, products.length, categories, range, granularity])

  const { k, pk } = data
  const totalSeriesPrev = data.series.reduce((s, p) => s + p.previous, 0)
  const recent = orders.slice(0, 6)
  const maxTop = Math.max(1, ...data.top.map((t) => t.quantity))

  return (
    <>
      <AdminPageHeader title="Dashboard" description={`Período: ${formatDate(range.from.toISOString())} a ${formatDate(range.to.toISOString())} · comparado ao período anterior`} actions={<PeriodFilter />} />
      <DemoNotice className="mb-6">
        Indicadores calculados automaticamente a partir dos <strong>pedidos demonstrativos</strong> salvos neste navegador. Não representam faturamento real.
      </DemoNotice>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard index={0} label="Total de vendas" value={formatCurrency(k.sales)} icon={DollarSign} tone="brand" delta={delta(k.sales, pk.sales)} hint="vs. anterior" />
        <StatCard index={1} label="Quantidade de pedidos" value={formatNumber(k.orders)} icon={ShoppingCart} delta={delta(k.orders, pk.orders)} hint="vs. anterior" />
        <StatCard index={2} label="Aguardando confirmação" value={formatNumber(k.awaiting)} icon={Clock} tone="warning" hint="no período" />
        <StatCard index={3} label="Pedidos confirmados" value={formatNumber(k.confirmed)} icon={CheckCircle2} tone="success" delta={delta(k.confirmed, pk.confirmed)} hint="vs. anterior" />
        <StatCard index={4} label="Pedidos cancelados" value={formatNumber(k.cancelled)} icon={Ban} tone="danger" hint={k.orders ? `${((k.cancelled / k.orders) * 100).toFixed(1).replace('.', ',')}% do total` : '—'} />
        <StatCard index={5} label="Ticket médio" value={formatCurrency(k.avgTicket)} icon={Receipt} delta={delta(k.avgTicket, pk.avgTicket)} hint="vs. anterior" />
        <StatCard index={6} label="Exames cadastrados" value={formatNumber(products.length)} icon={FlaskConical} hint={`${products.filter((p) => p.active).length} ativos`} />
        <StatCard index={7} label="Exames vendidos" value={formatNumber(k.examsSold)} icon={TrendingUp} delta={delta(k.examsSold, pk.examsSold)} hint="unidades" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Vendas"
          description={`${formatCurrency(k.sales)} no período · ${formatCurrency(totalSeriesPrev)} no período anterior`}
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
          <Legend items={[{ label: 'Período atual', color: SERIES[0] }, { label: 'Período anterior', color: PREVIOUS, muted: true }]} />
          <div className="mt-3 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" {...axisProps} minTickGap={18} />
                <YAxis {...axisProps} tickFormatter={(v) => formatCurrencyCompact(v)} width={64} />
                <Tooltip content={<ChartTooltip format={(v) => formatCurrency(v)} />} cursor={{ stroke: AXIS, strokeWidth: 1 }} />
                <Area type="monotone" dataKey="previous" name="Período anterior" stroke={PREVIOUS} strokeWidth={1.5} fill="none" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="sales" name="Período atual" stroke={SERIES[0]} strokeWidth={2} fill="url(#salesFill)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Exames mais vendidos" description="Unidades no período" actions={<Link to="/admin/financeiro" className="text-xs font-semibold text-brand-700 hover:underline">Ver financeiro</Link>}>
          {data.top.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-400">Sem vendas no período.</p>
          ) : (
            <ol className="space-y-3.5">
              {data.top.map((t, i) => (
                <li key={t.id}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="tabular w-4 text-xs font-bold text-ink-400">{i + 1}</span>
                      <span className="truncate font-medium text-ink-800">{t.name}</span>
                    </span>
                    <span className="tabular shrink-0 font-semibold text-ink-900">{t.quantity}</span>
                  </div>
                  <div className="ml-6 mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-600 transition-all duration-700" style={{ width: `${(t.quantity / maxTop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Pedidos"
          description="Recebidos, confirmados, em andamento e cancelados por período"
          actions={
            <Segmented
              value={ordersView}
              onChange={setOrdersView}
              options={[
                { value: 'chart', label: 'Gráfico' },
                { value: 'table', label: 'Tabela' },
              ]}
            />
          }
        >
          <Legend
            items={[
              { label: 'Recebidos', color: SERIES[0] },
              { label: 'Confirmados', color: SERIES[1] },
              { label: 'Em andamento', color: SERIES[2] },
              { label: 'Cancelados', color: SERIES[3] },
            ]}
          />
          {ordersView === 'chart' ? (
            <div className="mt-3 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.series} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="label" {...axisProps} minTickGap={18} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: AXIS, strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="received" name="Recebidos" stroke={SERIES[0]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="confirmed" name="Confirmados" stroke={SERIES[1]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="inProgress" name="Em andamento" stroke={SERIES[2]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="cancelled" name="Cancelados" stroke={SERIES[3]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-3 max-h-[260px] overflow-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white text-left text-[11px] uppercase tracking-wider text-ink-400">
                  <tr>
                    <th className="py-2 font-semibold">Período</th>
                    <th className="py-2 text-right font-semibold">Recebidos</th>
                    <th className="py-2 text-right font-semibold">Confirmados</th>
                    <th className="py-2 text-right font-semibold">Em andamento</th>
                    <th className="py-2 text-right font-semibold">Cancelados</th>
                  </tr>
                </thead>
                <tbody className="tabular divide-y divide-ink-100">
                  {data.series.map((p) => (
                    <tr key={p.key}>
                      <td className="py-2">{p.label}</td>
                      <td className="py-2 text-right">{p.received}</td>
                      <td className="py-2 text-right">{p.confirmed}</td>
                      <td className="py-2 text-right">{p.inProgress}</td>
                      <td className="py-2 text-right">{p.cancelled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Status dos pedidos" description="Distribuição no período">
          <ul className="space-y-2.5">
            {data.statusCounts.map((s) => {
              const pct = k.orders ? (s.count / k.orders) * 100 : 0
              return (
                <li key={s.status}>
                  <Link to={`/admin/pedidos?status=${s.status}`} className="group block">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2 text-ink-700 group-hover:text-ink-900">
                        <span className={cn('h-2 w-2 rounded-full', STATUS_META[s.status].dot)} />
                        {STATUS_META[s.status].label}
                      </span>
                      <span className="tabular font-semibold text-ink-900">
                        {s.count} <span className="font-normal text-ink-400">· {pct.toFixed(0)}%</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-ink-700 transition-all duration-700 group-hover:bg-brand-600" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Evolução do faturamento" description="Acumulado no período (demonstrativo)">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" {...axisProps} minTickGap={24} />
                <YAxis {...axisProps} tickFormatter={(v) => formatCurrencyCompact(v)} width={60} />
                <Tooltip content={<ChartTooltip format={(v) => formatCurrency(v)} />} cursor={{ stroke: AXIS, strokeWidth: 1 }} />
                <Area type="monotone" dataKey="cumulative" name="Faturamento acumulado" stroke={SERIES[0]} strokeWidth={2} fill="url(#cumFill)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Ticket médio" description="Valor médio por pedido">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" {...axisProps} minTickGap={24} />
                <YAxis {...axisProps} tickFormatter={(v) => `R$${Math.round(v)}`} width={52} />
                <Tooltip content={<ChartTooltip format={(v) => formatCurrency(v)} />} cursor={{ stroke: AXIS, strokeWidth: 1 }} />
                <Line type="monotone" dataKey="ticket" name="Ticket médio" stroke={SERIES[0]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Categorias mais procuradas" description="Exames vendidos por categoria">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cats} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barCategoryGap={6}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" {...axisProps} allowDecimals={false} />
                <YAxis type="category" dataKey="name" {...axisProps} width={104} tick={{ fill: '#5B504D', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(28,21,20,.04)' }} />
                <Bar dataKey="quantity" name="Exames" fill={SERIES[0]} radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6" title="Pedidos recentes" actions={<Link to="/admin/pedidos" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link>} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <tbody className="divide-y divide-ink-100">
              {recent.map((o) => (
                <tr key={o.id} className="transition hover:bg-ink-50/60">
                  <td className="px-5 py-3">
                    <Link to={`/admin/pedidos/${o.id}`} className="tabular font-bold text-ink-900 hover:text-brand-700">
                      {o.number}
                    </Link>
                    {!o.seeded && <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">LOJA</span>}
                  </td>
                  <td className="px-5 py-3 text-ink-700">{o.customer.name}</td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(o.createdAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} size="sm" />
                  </td>
                  <td className="tabular px-5 py-3 text-right font-semibold">{formatCurrency(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
