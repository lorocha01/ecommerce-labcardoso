import type { PersistedData } from './types'

/**
 * Validação defensiva dos dados lidos do LocalStorage/JSON importado.
 * Cada coleção inválida é substituída pelos dados de demonstração,
 * preservando o que estiver íntegro.
 */
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const arrOf = (v: unknown, check: (x: Record<string, unknown>) => boolean) => Array.isArray(v) && v.every((x) => isObj(x) && check(x))
const str = (v: unknown) => typeof v === 'string'
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v)

const validators: { [K in keyof PersistedData]?: (v: unknown) => boolean } = {
  products: (v) => arrOf(v, (p) => str(p.id) && str(p.name) && num(p.price) && str(p.categoryId)),
  categories: (v) => arrOf(v, (c) => str(c.id) && str(c.slug) && str(c.name)),
  orders: (v) => arrOf(v, (o) => str(o.id) && str(o.number) && Array.isArray(o.items) && num(o.total) && str(o.status) && isObj(o.customer)),
  users: (v) => arrOf(v, (u) => str(u.id) && str(u.email)),
  banners: (v) => arrOf(v, (b) => str(b.id) && str(b.title)),
  settings: (v) => isObj(v) && str(v.storeName) && str(v.phone),
  activity: (v) => arrOf(v, (a) => str(a.id) && str(a.at)),
  cart: (v) => arrOf(v, (c) => str(c.productId) && num(c.quantity)),
  favorites: (v) => Array.isArray(v) && v.every(str),
  viewed: (v) => arrOf(v, (x) => str(x.productId)),
  recentSearches: (v) => Array.isArray(v) && v.every(str),
  currentUserId: (v) => v === null || str(v),
}

const LABELS: Record<string, string> = {
  products: 'exames',
  categories: 'categorias',
  orders: 'pedidos',
  users: 'usuários',
  banners: 'banners',
  settings: 'configurações',
  activity: 'atividades',
  cart: 'carrinho',
  favorites: 'favoritos',
  viewed: 'histórico de navegação',
  recentSearches: 'buscas recentes',
  currentUserId: 'sessão do paciente',
}

export function sanitizeData(raw: unknown, fallback: PersistedData): { data: PersistedData; recovered: string[] } {
  const recovered: string[] = []
  if (!isObj(raw)) return { data: fallback, recovered: ['todos os dados'] }
  const data = { ...fallback } as PersistedData
  for (const key of Object.keys(validators) as (keyof PersistedData)[]) {
    const value = raw[key]
    if (validators[key]!(value)) {
      ;(data as unknown as Record<string, unknown>)[key] = value
    } else {
      recovered.push(LABELS[key] ?? key)
    }
  }
  // Configurações: completa campos novos que não existiam na versão salva
  if (isObj(raw.settings)) data.settings = { ...fallback.settings, ...(raw.settings as object) }
  if (str(raw.seededAt)) data.seededAt = raw.seededAt as string
  return { data, recovered }
}
