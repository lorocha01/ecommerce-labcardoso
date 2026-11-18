import type { Order, OrderItem, OrderStatus, PaymentMethod, Product, StatusChange } from '@/types'
import { createRandom } from '@/lib/random'

/**
 * PEDIDOS DEMONSTRATIVOS
 * ------------------------------------------------------------------
 * Pacientes e pedidos 100% fictícios, gerados de forma determinística
 * a partir da data do primeiro acesso, para que o painel tenha dados
 * em todos os filtros de período (hoje, 7, 30 e 90 dias).
 * E-mails usam o domínio reservado ".test" e CPFs são sempre mascarados.
 */

export const demoCustomers = [
  ['Ana Ribeiro', 'Pedregulho/SP'],
  ['Bruno Matos', 'Pedregulho/SP'],
  ['Carla Nogueira', 'Franca/SP'],
  ['Diego Fontes', 'Pedregulho/SP'],
  ['Eduarda Salles', 'Rifaina/SP'],
  ['Fábio Teixeira', 'Pedregulho/SP'],
  ['Gabriela Assis', 'Jeriquara/SP'],
  ['Henrique Prado', 'Pedregulho/SP'],
  ['Isabela Moura', 'Franca/SP'],
  ['João Pedro Lacerda', 'Pedregulho/SP'],
  ['Karina Duarte', 'Pedregulho/SP'],
  ['Leonardo Peixoto', 'Ibiraci/MG'],
  ['Mariana Campos', 'Pedregulho/SP'],
  ['Nicolas Barreto', 'Rifaina/SP'],
  ['Olívia Guedes', 'Pedregulho/SP'],
  ['Paulo Henrique Viana', 'Pedregulho/SP'],
  ['Rafaela Toledo', 'Franca/SP'],
  ['Sérgio Antunes', 'Pedregulho/SP'],
  ['Tatiane Freitas', 'Jeriquara/SP'],
  ['Vinícius Rocha', 'Pedregulho/SP'],
  ['Yasmin Carvalho', 'Pedregulho/SP'],
  ['André Lemos', 'Pedregulho/SP'],
  ['Beatriz Pacheco', 'Rifaina/SP'],
  ['Caio Bittencourt', 'Pedregulho/SP'],
  ['Débora Siqueira', 'Franca/SP'],
  ['Elias Andrade', 'Pedregulho/SP'],
  ['Fernanda Queiroz', 'Pedregulho/SP'],
  ['Gustavo Pimentel', 'Ibiraci/MG'],
  ['Helena Brandão', 'Pedregulho/SP'],
  ['Igor Meireles', 'Pedregulho/SP'],
  ['Juliana Fonseca', 'Jeriquara/SP'],
  ['Lucas Amaral', 'Pedregulho/SP'],
  ['Marcela Vieira', 'Franca/SP'],
  ['Otávio Cunha', 'Pedregulho/SP'],
  ['Patrícia Lima', 'Pedregulho/SP'],
  ['Renato Godoy', 'Rifaina/SP'],
] as const

export const toEmail = (name: string) =>
  `${name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '.')}@paciente.test`

const STREETS = ['Rua das Palmeiras', 'Av. Central', 'Rua São José', 'Rua XV de Novembro', 'Rua Rio Grande', 'Av. Brasil', 'Rua Dom Pedro II']

/** Pedidos do usuário de demonstração (área do paciente). */
const DEMO_USER = { name: 'Paciente Demonstração', email: 'paciente@demo.test', city: 'Pedregulho/SP', userId: 'user-demo' }

export function generateDemoOrders(products: Product[], now = new Date()): Order[] {
  const rand = createRandom(1974)
  const active = products.filter((p) => p.active)
  const popular = active.filter((p) => p.featured)
  const orders: Order[] = []
  const DAYS = 120
  let seq = 1001

  const payments: (readonly [PaymentMethod, number])[] = [
    ['pix', 5],
    ['cartao', 3],
    ['presencial', 2.5],
  ]

  for (let dayAgo = DAYS; dayAgo >= 0; dayAgo--) {
    const date = new Date(now)
    date.setDate(date.getDate() - dayAgo)
    const weekday = date.getDay()
    if (weekday === 0 && rand.next() < 0.85) continue // domingo quase sem pedidos
    // leve crescimento ao longo do período + sazonalidade semanal
    const growth = 0.7 + ((DAYS - dayAgo) / DAYS) * 0.9
    const base = weekday === 1 || weekday === 2 ? 2.1 : weekday === 6 ? 0.9 : 1.5
    let count = Math.round(base * growth * (0.55 + rand.next() * 0.9))
    if (dayAgo === 0) count = Math.max(2, Math.min(count, 4))

    for (let k = 0; k < count; k++) {
      const useDemoUser = rand.next() < 0.035
      const [name, city] = useDemoUser ? [DEMO_USER.name, DEMO_USER.city] : rand.pick(demoCustomers)
      const created = new Date(date)
      const hour = dayAgo === 0 ? Math.min(now.getHours(), rand.int(7, 17)) : rand.int(7, 19)
      created.setHours(hour, rand.int(0, 59), rand.int(0, 59), 0)
      if (created > now) created.setTime(now.getTime() - rand.int(5, 90) * 60000)

      // itens
      const nItems = rand.weighted([[1, 4], [2, 3.5], [3, 2], [4, 0.8]] as const)
      const chosen = new Map<string, Product>()
      while (chosen.size < nItems) {
        const p = rand.next() < 0.55 && popular.length ? rand.pick(popular) : rand.pick(active)
        chosen.set(p.id, p)
      }
      const items: OrderItem[] = [...chosen.values()].map((p) => ({
        productId: p.id,
        name: p.name,
        categoryId: p.categoryId,
        unitPrice: p.price,
        quantity: rand.next() < 0.06 ? 2 : 1,
      }))
      const subtotal = round(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))
      const payment = rand.weighted(payments)

      const status = pickStatus(dayAgo, payment, rand.next())
      const history = buildHistory(status, payment, created, now, rand)

      orders.push({
        id: `ord-${seq}`,
        number: `LC-${seq}`,
        userId: useDemoUser ? DEMO_USER.userId : undefined,
        customer: {
          name,
          email: useDemoUser ? DEMO_USER.email : toEmail(name),
          phone: `(16) 90000-${String(1000 + Math.max(0, demoCustomers.findIndex((c) => c[0] === name)) * 7).slice(-4)}`,
          cpfMasked: `***.***.***-${String(rand.int(10, 99))}`,
          birthDate: `19${rand.int(55, 99)}-${String(rand.int(1, 12)).padStart(2, '0')}-${String(rand.int(1, 28)).padStart(2, '0')}`,
          cep: '14470-000',
          address: `${rand.pick(STREETS)}, ${rand.int(10, 980)}`,
          city,
        },
        items,
        subtotal,
        discount: 0,
        total: subtotal,
        paymentMethod: payment,
        paymentDetail: payment === 'cartao' ? `Cartão final ${rand.int(1000, 9999)} (fictício)` : undefined,
        status,
        history,
        adminNotes: status === 'cancelado' ? 'Cancelado a pedido do paciente (registro demonstrativo).' : '',
        createdAt: created.toISOString(),
        seeded: true,
      })
      seq++
    }
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function round(v: number) {
  return Math.round(v * 100) / 100
}

function pickStatus(dayAgo: number, payment: PaymentMethod, r: number): OrderStatus {
  if (r < 0.07) return 'cancelado'
  if (dayAgo <= 0) {
    if (r < 0.6) return 'aguardando_confirmacao'
    return payment === 'presencial' ? 'confirmado' : 'aguardando_pagamento'
  }
  if (dayAgo <= 2) {
    if (r < 0.3) return 'aguardando_confirmacao'
    if (r < 0.5) return payment === 'presencial' ? 'confirmado' : 'aguardando_pagamento'
    if (r < 0.75) return 'pago'
    return 'aguardando_coleta'
  }
  if (dayAgo <= 7) {
    if (r < 0.15) return 'confirmado'
    if (r < 0.35) return 'em_processamento'
    if (r < 0.6) return 'aguardando_coleta'
    return 'concluido'
  }
  return r < 0.1 ? 'aguardando_coleta' : 'concluido'
}

const FLOW: Record<PaymentMethod, OrderStatus[]> = {
  pix: ['aguardando_confirmacao', 'aguardando_pagamento', 'pago', 'confirmado', 'em_processamento', 'aguardando_coleta', 'concluido'],
  cartao: ['aguardando_confirmacao', 'aguardando_pagamento', 'pago', 'confirmado', 'em_processamento', 'aguardando_coleta', 'concluido'],
  presencial: ['aguardando_confirmacao', 'confirmado', 'aguardando_coleta', 'pago', 'em_processamento', 'concluido'],
}

function buildHistory(
  status: OrderStatus,
  payment: PaymentMethod,
  created: Date,
  now: Date,
  rand: ReturnType<typeof createRandom>,
): StatusChange[] {
  const history: StatusChange[] = [{ status: 'aguardando_confirmacao', at: created.toISOString(), by: 'Sistema', note: 'Pedido recebido pela loja virtual (simulação).' }]
  if (status === 'aguardando_confirmacao') return history
  const flow = FLOW[payment]
  const target = status === 'cancelado' ? flow[rand.int(0, 2)] : status
  let t = created.getTime()
  for (const s of flow.slice(1)) {
    if (status !== 'cancelado' && flow.indexOf(s) > flow.indexOf(target)) break
    if (status === 'cancelado' && flow.indexOf(s) > flow.indexOf(target)) break
    t = Math.min(now.getTime(), t + rand.int(20, 60 * 20) * 60000)
    history.push({ status: s, at: new Date(t).toISOString(), by: 'admin' })
    if (s === target) break
  }
  if (status === 'cancelado') {
    t = Math.min(now.getTime(), t + rand.int(30, 600) * 60000)
    history.push({ status: 'cancelado', at: new Date(t).toISOString(), by: 'admin', note: 'Cancelamento demonstrativo.' })
  }
  // Garante que o último registro reflita o status atual
  if (history[history.length - 1].status !== status) {
    history.push({ status, at: new Date(Math.min(now.getTime(), t + 3600000)).toISOString(), by: 'admin' })
  }
  return history
}
