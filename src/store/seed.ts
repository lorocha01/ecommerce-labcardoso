import { banners } from '@/data/banners'
import { categories } from '@/data/categories'
import { generateDemoOrders } from '@/data/orders'
import { products } from '@/data/products'
import { settings } from '@/data/settings'
import { users } from '@/data/users'
import type { ActivityLog } from '@/types'
import type { PersistedData } from './types'

export const DATA_VERSION = 1

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

/** Monta o estado inicial a partir dos arquivos em src/data. */
export function createSeedData(now = new Date()): PersistedData {
  const prods = clone(products)
  const t = (minAgo: number) => new Date(now.getTime() - minAgo * 60000).toISOString()
  const activity: ActivityLog[] = [
    { id: 'act-seed-1', type: 'dados_restaurados', description: 'Base de dados demonstrativa criada no navegador.', user: 'Sistema', at: t(1) },
    { id: 'act-seed-2', type: 'produto_editado', description: 'Exame "TSH + T4 livre" teve o preço demonstrativo ajustado.', user: 'admin', at: t(60 * 26) },
    { id: 'act-seed-3', type: 'banner_alterado', description: 'Banner "Check-ups demonstrativos" ativado na página inicial.', user: 'admin', at: t(60 * 50) },
    { id: 'act-seed-4', type: 'categoria_editada', description: 'Categoria "Check-ups" teve a descrição atualizada.', user: 'admin', at: t(60 * 74) },
  ]
  return {
    version: DATA_VERSION,
    seededAt: now.toISOString(),
    products: prods,
    categories: clone(categories),
    orders: generateDemoOrders(prods, now),
    users: clone(users),
    banners: clone(banners),
    settings: clone(settings),
    activity,
    cart: [],
    favorites: ['vitamina-d', 'check-up-essencial'],
    viewed: [],
    recentSearches: [],
    currentUserId: null,
  }
}
