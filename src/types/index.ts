/**
 * Tipos centrais da aplicação.
 * Mantidos independentes da camada de armazenamento para facilitar a futura
 * troca do LocalStorage por uma API/banco de dados sem alterar componentes.
 */

/** Indica se a informação foi validada pelo laboratório ou é apenas ilustrativa. */
export type DataStatus = 'demonstrativo' | 'oficial'

export type ArtTone = 'red' | 'wine' | 'peach' | 'rose' | 'sand' | 'ink'

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  tone: ArtTone
  active: boolean
  order: number
}

export interface Product {
  id: string
  slug: string
  name: string
  categoryId: string
  shortDescription: string
  description: string
  purpose: string
  howItsDone: string
  preparation: string
  /** Resumo curto exibido nos cards (ex.: "Jejum de 8 horas"). */
  preparationSummary: string
  requiresPreparation: boolean
  material: string
  resultTime: string
  importantInfo: string
  price: number
  /** Preço anterior (opcional) para destacar ofertas demonstrativas. */
  compareAtPrice?: number
  /** Lista de exames incluídos (check-ups e combos). */
  includes?: string[]
  tags: string[]
  icon: string
  tone: ArtTone
  imageUrl?: string
  active: boolean
  featured: boolean
  dataStatus: DataStatus
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  quantity: number
  addedAt: string
}

export type OrderStatus =
  | 'aguardando_confirmacao'
  | 'confirmado'
  | 'aguardando_pagamento'
  | 'pago'
  | 'em_processamento'
  | 'aguardando_coleta'
  | 'concluido'
  | 'cancelado'

export type PaymentMethod = 'pix' | 'cartao' | 'presencial'

export interface OrderItem {
  productId: string
  name: string
  categoryId: string
  unitPrice: number
  quantity: number
}

export interface StatusChange {
  status: OrderStatus
  at: string
  by: string
  note?: string
}

export interface OrderCustomer {
  name: string
  email: string
  phone: string
  /** CPF sempre mascarado — nunca armazenamos o número completo. */
  cpfMasked: string
  birthDate: string
  cep: string
  address: string
  city: string
}

export interface Order {
  id: string
  number: string
  userId?: string
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  paymentDetail?: string
  status: OrderStatus
  history: StatusChange[]
  adminNotes: string
  createdAt: string
  /** true para pedidos gerados pelo seed inicial, false para pedidos simulados pelo usuário */
  seeded: boolean
}

export interface User {
  id: string
  name: string
  email: string
  /** Senha demonstrativa em texto — NÃO usar em produção. */
  password: string
  phone: string
  birthDate: string
  cpfMasked: string
  cep: string
  address: string
  city: string
  createdAt: string
}

export interface Banner {
  id: string
  title: string
  highlight: string
  subtitle: string
  eyebrow: string
  imageUrl?: string
  /** Arte ilustrativa interna usada quando não há imagem. */
  art: 'lab' | 'family' | 'checkup' | 'heritage'
  primaryText: string
  primaryLink: string
  secondaryText: string
  secondaryLink: string
  active: boolean
  order: number
}

export interface SocialLinks {
  instagram: string
  facebook: string
}

export interface StoreSettings {
  storeName: string
  legalName: string
  logoUrl: string
  logoWhiteUrl: string
  phone: string
  whatsapp: string
  email: string
  address: string
  district: string
  city: string
  state: string
  cep: string
  hours: string
  hoursSaturday: string
  hoursNote: string
  since: number
  slogan: string
  tagline: string
  about: string
  mission: string
  social: SocialLinks
  /** Portal oficial de consulta de resultados (link externo). */
  resultsUrl: string
  announcement: string
  announcementActive: boolean
  homeCategoriesTitle: string
  homeFeaturedTitle: string
  homeFeaturedSubtitle: string
  insurances: string[]
}

export type ActivityType =
  | 'login'
  | 'logout'
  | 'produto_criado'
  | 'produto_editado'
  | 'produto_excluido'
  | 'pedido_atualizado'
  | 'categoria_criada'
  | 'categoria_editada'
  | 'categoria_excluida'
  | 'banner_alterado'
  | 'configuracao_modificada'
  | 'dados_restaurados'
  | 'dados_importados'

export interface ActivityLog {
  id: string
  type: ActivityType
  description: string
  user: string
  at: string
}

export interface ViewedEntry {
  productId: string
  at: string
}
