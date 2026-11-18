import type { OrderStatus, PaymentMethod } from '@/types'

export const ORDER_STATUSES: OrderStatus[] = [
  'aguardando_confirmacao',
  'confirmado',
  'aguardando_pagamento',
  'pago',
  'em_processamento',
  'aguardando_coleta',
  'concluido',
  'cancelado',
]

export const STATUS_META: Record<OrderStatus, { label: string; short: string; className: string; dot: string; description: string }> = {
  aguardando_confirmacao: {
    label: 'Aguardando confirmação',
    short: 'Aguardando',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
    dot: 'bg-amber-500',
    description: 'Recebemos seu pedido e ele será conferido pela equipe.',
  },
  confirmado: {
    label: 'Confirmado',
    short: 'Confirmado',
    className: 'bg-sky-50 text-sky-800 ring-sky-200',
    dot: 'bg-sky-500',
    description: 'Pedido conferido e confirmado pelo laboratório.',
  },
  aguardando_pagamento: {
    label: 'Aguardando pagamento',
    short: 'Ag. pagamento',
    className: 'bg-orange-50 text-orange-800 ring-orange-200',
    dot: 'bg-orange-500',
    description: 'Aguardando a confirmação do pagamento (simulado).',
  },
  pago: {
    label: 'Pago (demonstrativo)',
    short: 'Pago',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Pagamento marcado como recebido — apenas demonstração.',
  },
  em_processamento: {
    label: 'Em processamento',
    short: 'Processando',
    className: 'bg-violet-50 text-violet-800 ring-violet-200',
    dot: 'bg-violet-500',
    description: 'Pedido em preparação pela equipe do laboratório.',
  },
  aguardando_coleta: {
    label: 'Aguardando coleta',
    short: 'Ag. coleta',
    className: 'bg-peach-100 text-brand-800 ring-peach-300',
    dot: 'bg-brand-400',
    description: 'Compareça ao laboratório com documento e pedido médico.',
  },
  concluido: {
    label: 'Concluído',
    short: 'Concluído',
    className: 'bg-ink-100 text-ink-800 ring-ink-200',
    dot: 'bg-ink-600',
    description: 'Atendimento concluído.',
  },
  cancelado: {
    label: 'Cancelado',
    short: 'Cancelado',
    className: 'bg-brand-50 text-brand-800 ring-brand-200',
    dot: 'bg-brand-600',
    description: 'Pedido cancelado.',
  },
}

/** Agrupamentos usados nos indicadores do painel. */
export const CONFIRMED_STATUSES: OrderStatus[] = ['confirmado', 'pago', 'em_processamento', 'aguardando_coleta', 'concluido']
export const IN_PROGRESS_STATUSES: OrderStatus[] = ['aguardando_pagamento', 'pago', 'em_processamento', 'aguardando_coleta']

export const PAYMENT_META: Record<PaymentMethod, { label: string; short: string }> = {
  pix: { label: 'PIX (simulado)', short: 'PIX' },
  cartao: { label: 'Cartão de crédito (simulado)', short: 'Cartão' },
  presencial: { label: 'Pagamento presencial', short: 'Presencial' },
}
