import type { Category, Order, PaymentMethod } from '@/types'
import { CONFIRMED_STATUSES, IN_PROGRESS_STATUSES } from './status'

/**
 * Cálculo de indicadores do painel a partir dos pedidos armazenados.
 * Todos os valores são DEMONSTRATIVOS (pedidos simulados).
 */

export type PeriodKey = 'today' | '7d' | '30d' | '90d' | 'custom'
export type Granularity = 'day' | 'week' | 'month'

export interface Range {
  from: Date
  to: Date
}

const DAY = 86400000

export const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
export const endOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function getRange(key: PeriodKey, custom?: { from: string; to: string }, now = new Date()): Range {
  if (key === 'custom' && custom?.from && custom?.to) {
    const a = startOfDay(new Date(`${custom.from}T00:00:00`))
    const b = endOfDay(new Date(`${custom.to}T00:00:00`))
    return a <= b ? { from: a, to: b } : { from: startOfDay(b), to: endOfDay(a) }
  }
  const days = key === 'today' ? 1 : key === '7d' ? 7 : key === '90d' ? 90 : 30
  return { from: startOfDay(new Date(now.getTime() - (days - 1) * DAY)), to: endOfDay(now) }
}

export function previousRange(r: Range): Range {
  const len = r.to.getTime() - r.from.getTime() + 1
  return { from: new Date(r.from.getTime() - len), to: new Date(r.from.getTime() - 1) }
}

export const inRange = (o: Order, r: Range) => {
  const t = new Date(o.createdAt).getTime()
  return t >= r.from.getTime() && t <= r.to.getTime()
}

export const isRevenue = (o: Order) => o.status !== 'cancelado'

export function computeKpis(orders: Order[], productsCount: number) {
  const valid = orders.filter(isRevenue)
  const sales = valid.reduce((s, o) => s + o.total, 0)
  return {
    sales,
    orders: orders.length,
    awaiting: orders.filter((o) => o.status === 'aguardando_confirmacao').length,
    confirmed: orders.filter((o) => CONFIRMED_STATUSES.includes(o.status)).length,
    inProgress: orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)).length,
    cancelled: orders.filter((o) => o.status === 'cancelado').length,
    avgTicket: valid.length ? sales / valid.length : 0,
    examsSold: valid.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0),
    productsCount,
  }
}

export const delta = (cur: number, prev: number) => (prev === 0 ? (cur === 0 ? 0 : 1) : (cur - prev) / prev)

export function autoGranularity(r: Range): Granularity {
  const days = Math.round((r.to.getTime() - r.from.getTime()) / DAY)
  if (days > 120) return 'month'
  if (days > 45) return 'week'
  return 'day'
}

function bucketStart(d: Date, g: Granularity) {
  const x = startOfDay(d)
  if (g === 'week') {
    const wd = (x.getDay() + 6) % 7 // segunda-feira
    x.setDate(x.getDate() - wd)
  }
  if (g === 'month') x.setDate(1)
  return x
}

function nextBucket(d: Date, g: Granularity) {
  const x = new Date(d)
  if (g === 'day') x.setDate(x.getDate() + 1)
  if (g === 'week') x.setDate(x.getDate() + 7)
  if (g === 'month') x.setMonth(x.getMonth() + 1)
  return x
}

function label(d: Date, g: Granularity) {
  if (g === 'month') return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export interface SeriesPoint {
  key: string
  label: string
  date: string
  sales: number
  previous: number
  orders: number
  received: number
  confirmed: number
  inProgress: number
  cancelled: number
  ticket: number
}

/** Série temporal do período atual, alinhada ponto-a-ponto ao período anterior. */
export function buildSeries(all: Order[], r: Range, g: Granularity): SeriesPoint[] {
  const prev = previousRange(r)
  const offset = r.from.getTime() - prev.from.getTime()
  const points: SeriesPoint[] = []
  const index = new Map<number, SeriesPoint>()
  for (let d = bucketStart(r.from, g); d <= r.to; d = nextBucket(d, g)) {
    const p: SeriesPoint = { key: d.toISOString(), label: label(d, g), date: d.toISOString(), sales: 0, previous: 0, orders: 0, received: 0, confirmed: 0, inProgress: 0, cancelled: 0, ticket: 0 }
    points.push(p)
    index.set(d.getTime(), p)
  }
  const validCount = new Map<SeriesPoint, number>()
  for (const o of all) {
    const t = new Date(o.createdAt)
    if (inRange(o, r)) {
      const p = index.get(bucketStart(t, g).getTime())
      if (!p) continue
      p.orders++
      p.received++
      if (isRevenue(o)) {
        p.sales += o.total
        validCount.set(p, (validCount.get(p) ?? 0) + 1)
      }
      if (CONFIRMED_STATUSES.includes(o.status)) p.confirmed++
      if (IN_PROGRESS_STATUSES.includes(o.status)) p.inProgress++
      if (o.status === 'cancelado') p.cancelled++
    } else if (inRange(o, prev) && isRevenue(o)) {
      const shifted = new Date(t.getTime() + offset)
      const p = index.get(bucketStart(shifted, g).getTime())
      if (p) p.previous += o.total
    }
  }
  for (const p of points) {
    const n = validCount.get(p) ?? 0
    p.ticket = n ? p.sales / n : 0
    p.sales = Math.round(p.sales * 100) / 100
    p.previous = Math.round(p.previous * 100) / 100
  }
  return points
}

export function topProducts(orders: Order[], limit = 8) {
  const map = new Map<string, { id: string; name: string; quantity: number; revenue: number }>()
  for (const o of orders.filter(isRevenue)) {
    for (const i of o.items) {
      const cur = map.get(i.productId) ?? { id: i.productId, name: i.name, quantity: 0, revenue: 0 }
      cur.quantity += i.quantity
      cur.revenue += i.unitPrice * i.quantity
      map.set(i.productId, cur)
    }
  }
  return [...map.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue).slice(0, limit)
}

export function topProductsByRevenue(orders: Order[], limit = 10) {
  return topProducts(orders, 999)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export function topCategories(orders: Order[], categories: Category[]) {
  const map = new Map<string, { id: string; name: string; quantity: number; revenue: number }>()
  for (const o of orders.filter(isRevenue)) {
    for (const i of o.items) {
      const name = categories.find((c) => c.id === i.categoryId)?.name ?? 'Sem categoria'
      const cur = map.get(i.categoryId) ?? { id: i.categoryId, name, quantity: 0, revenue: 0 }
      cur.quantity += i.quantity
      cur.revenue += i.unitPrice * i.quantity
      map.set(i.categoryId, cur)
    }
  }
  return [...map.values()].sort((a, b) => b.quantity - a.quantity)
}

export function revenueByPayment(orders: Order[]) {
  const base: Record<PaymentMethod, { method: PaymentMethod; revenue: number; orders: number }> = {
    pix: { method: 'pix', revenue: 0, orders: 0 },
    cartao: { method: 'cartao', revenue: 0, orders: 0 },
    presencial: { method: 'presencial', revenue: 0, orders: 0 },
  }
  for (const o of orders.filter(isRevenue)) {
    base[o.paymentMethod].revenue += o.total
    base[o.paymentMethod].orders++
  }
  return Object.values(base)
}
