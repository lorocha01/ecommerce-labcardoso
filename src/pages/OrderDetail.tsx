import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Info, Lock, MapPin, Printer, X } from 'lucide-react'
import type { OrderStatus } from '@/types'
import { useStore } from '@/store'
import { useCurrentUser } from '@/store/hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { PAYMENT_META, STATUS_META } from '@/lib/status'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn } from '@/lib/utils'
import { LOOKUP_KEY } from './Orders'

const TRACK: { status: OrderStatus[]; label: string }[] = [
  { status: ['aguardando_confirmacao'], label: 'Pedido recebido' },
  { status: ['confirmado', 'aguardando_pagamento', 'pago'], label: 'Confirmado' },
  { status: ['em_processamento'], label: 'Em processamento' },
  { status: ['aguardando_coleta'], label: 'Aguardando coleta' },
  { status: ['concluido'], label: 'Concluído' },
]

export default function OrderDetail() {
  const { id } = useParams()
  const order = useStore((s) => s.orders.find((o) => o.id === id))
  const user = useCurrentUser()
  useDocumentTitle(order ? `Pedido ${order.number}` : 'Pedido')

  let allowed = false
  try {
    allowed = !!order && (sessionStorage.getItem(LOOKUP_KEY) === order.id)
  } catch {
    /* ignore */
  }
  if (order && user && (order.userId === user.id || order.customer.email.toLowerCase() === user.email.toLowerCase())) allowed = true

  if (!order || !allowed) {
    return (
      <div className="container py-16">
        <div className="card">
          <EmptyState icon={Lock} title="Pedido não disponível" description="Entre na sua conta ou consulte o pedido informando o número e o e-mail utilizados na compra." action={<Button to="/pedidos">Consultar pedidos</Button>} />
        </div>
      </div>
    )
  }

  const cancelled = order.status === 'cancelado'
  const currentStep = TRACK.findIndex((t) => t.status.includes(order.status))
  const reached = (i: number) => {
    if (cancelled) return order.history.some((h) => TRACK[i].status.includes(h.status))
    return i <= currentStep
  }

  return (
    <>
      <PageHeader title={<span className="tabular">Pedido {order.number}</span>} description={`Realizado em ${formatDateTime(order.createdAt)}`} crumbs={[{ label: 'Meus pedidos', to: '/pedidos' }, { label: order.number }]}>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="text-sm text-ink-500">{STATUS_META[order.status].description}</span>
        </div>
      </PageHeader>
      <div className="container grid gap-6 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6 sm:p-8">
            <h2 className="font-bold">Acompanhamento</h2>
            {cancelled && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-800">
                <X className="h-4 w-4" /> Este pedido foi cancelado.
              </p>
            )}
            <ol className="relative mt-6 grid gap-6 sm:grid-cols-5 sm:gap-2">
              {TRACK.map((t, i) => {
                const ok = reached(i)
                return (
                  <li key={t.label} className="relative flex items-center gap-3 sm:flex-col sm:text-center">
                    {i < TRACK.length - 1 && <span className={cn('absolute left-[15px] top-8 h-[calc(100%+8px)] w-0.5 sm:left-1/2 sm:top-[15px] sm:h-0.5 sm:w-full', ok && reached(i + 1) ? 'bg-brand-600' : 'bg-ink-200')} />}
                    <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} className={cn('relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-white', ok ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400')}>
                      {ok ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="text-xs font-bold">{i + 1}</span>}
                    </motion.span>
                    <span className={cn('text-[13px] font-semibold', ok ? 'text-ink-900' : 'text-ink-400')}>{t.label}</span>
                  </li>
                )
              })}
            </ol>
            <h3 className="mt-8 text-sm font-bold text-ink-500">Histórico</h3>
            <ul className="mt-3 space-y-3">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="flex gap-3 text-[14px]">
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', STATUS_META[h.status].dot)} />
                  <span>
                    <strong>{STATUS_META[h.status].label}</strong> <span className="text-ink-400">· {formatDateTime(h.at)}</span>
                    {h.note && <span className="block text-ink-500">{h.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-6 sm:p-8">
            <h2 className="font-bold">Exames</h2>
            <ul className="mt-3 divide-y divide-ink-100">
              {order.items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-4 py-3 text-[14.5px]">
                  <Link to={`/exames/${i.productId}`} className="hover:text-brand-700">
                    {i.name} <span className="text-ink-400">× {i.quantity}</span>
                  </Link>
                  <span className="tabular font-semibold">{formatCurrency(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-end justify-between border-t border-dashed border-ink-200 pt-4">
              <span className="font-bold">Total</span>
              <span className="tabular display text-3xl font-semibold">{formatCurrency(order.total)}</span>
            </div>
          </section>
        </div>
        <aside className="space-y-4">
          <section className="card p-6">
            <h2 className="font-bold">Pagamento</h2>
            <p className="mt-2 text-[14.5px]">{PAYMENT_META[order.paymentMethod].label}</p>
            {order.paymentDetail && <p className="text-sm text-ink-500">{order.paymentDetail}</p>}
          </section>
          <section className="card p-6">
            <h2 className="font-bold">Paciente</h2>
            <p className="mt-2 text-[14.5px] font-semibold">{order.customer.name}</p>
            <p className="text-sm text-ink-500">{order.customer.email}</p>
            <p className="text-sm text-ink-500">{order.customer.phone}</p>
            <p className="text-sm text-ink-500">CPF {order.customer.cpfMasked}</p>
          </section>
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <MapPin className="h-4 w-4 text-brand-600" /> Local da coleta
            </h2>
            <p className="mt-2 text-sm text-ink-600">Laboratório Cardoso · Rua Tenente Salviano, 136 – Centro, Pedregulho/SP</p>
          </section>
          <Button variant="secondary" className="w-full" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir comprovante
          </Button>
          <p className="flex gap-2 rounded-2xl bg-amber-50 p-4 text-[13px] text-amber-900 ring-1 ring-inset ring-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" /> Pedido demonstrativo — sem validade fiscal ou de pagamento.
          </p>
        </aside>
      </div>
    </>
  )
}
