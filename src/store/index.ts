import { create } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import type { ActivityType, Order, User } from '@/types'
import { cpfToMasked } from '@/lib/masks'
import { normalize, slugify, uid } from '@/lib/utils'
import { createSeedData, DATA_VERSION } from './seed'
import type { AppState, PersistedData } from './types'
import { sanitizeData } from './validate'

/**
 * STORE CENTRAL DA APLICAÇÃO
 * ------------------------------------------------------------------
 * Fonte única de verdade para loja e painel administrativo:
 * carrinho, pedidos, exames, categorias, banners, configurações e log.
 *
 * Persistência: LocalStorage (chave STORAGE_KEY). Para migrar para um
 * backend, substitua as ações abaixo por chamadas de API mantendo as
 * mesmas assinaturas — os componentes não precisam ser alterados.
 */

export const STORAGE_KEY = 'labcardoso:store'
export const MAX_QTY = 10

/** Avisos de integridade lidos pelo App para notificar o usuário. */
export const storageStatus = { recovered: [] as string[], quotaError: false }

const safeStorage: PersistStorage<PersistedData> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name)
      if (!raw) return null
      const parsed = JSON.parse(raw) as StorageValue<unknown>
      const { data, recovered } = sanitizeData(parsed?.state, createSeedData())
      storageStatus.recovered = recovered
      return { state: data, version: parsed?.version ?? DATA_VERSION }
    } catch {
      storageStatus.recovered = ['todos os dados (arquivo corrompido)']
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value))
    } catch {
      storageStatus.quotaError = true
      window.dispatchEvent(new CustomEvent('labcardoso:quota'))
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}

const now = () => new Date().toISOString()

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      const log = (type: ActivityType, description: string, actor?: string) => {
        if (!actor) return
        set((s) => ({
          activity: [{ id: uid('act'), type, description, user: actor, at: now() }, ...s.activity].slice(0, 500),
        }))
      }

      return {
        ...createSeedData(),

        // ───────────────────────────── catálogo
        addProduct: (p, actor) => {
          const base = slugify(p.slug || p.name) || uid('exame')
          let id = base
          let i = 2
          while (get().products.some((x) => x.id === id)) id = `${base}-${i++}`
          const product = { ...p, id, slug: id, createdAt: now(), updatedAt: now() }
          set((s) => ({ products: [product, ...s.products] }))
          log('produto_criado', `Exame "${product.name}" cadastrado.`, actor)
          return product
        },
        updateProduct: (id, patch, actor) => {
          const before = get().products.find((p) => p.id === id)
          if (!before) return
          set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch, id, updatedAt: now() } : p)) }))
          const changes: string[] = []
          if (patch.price !== undefined && patch.price !== before.price) changes.push(`preço ${before.price.toFixed(2)} → ${patch.price.toFixed(2)}`)
          if (patch.active !== undefined && patch.active !== before.active) changes.push(patch.active ? 'ativado' : 'desativado')
          if (patch.featured !== undefined && patch.featured !== before.featured) changes.push(patch.featured ? 'destacado na home' : 'removido dos destaques')
          log('produto_editado', `Exame "${patch.name ?? before.name}" editado${changes.length ? ` (${changes.join(', ')})` : ''}.`, actor)
        },
        deleteProduct: (id, actor) => {
          const p = get().products.find((x) => x.id === id)
          set((s) => ({
            products: s.products.filter((x) => x.id !== id),
            cart: s.cart.filter((c) => c.productId !== id),
            favorites: s.favorites.filter((f) => f !== id),
          }))
          if (p) log('produto_excluido', `Exame "${p.name}" excluído.`, actor)
        },
        addCategory: (c, actor) => {
          const base = slugify(c.slug || c.name) || uid('categoria')
          let slug = base
          let i = 2
          while (get().categories.some((x) => x.slug === slug)) slug = `${base}-${i++}`
          const category = { ...c, slug, id: `cat-${slug}`, order: Math.max(0, ...get().categories.map((x) => x.order)) + 1 }
          set((s) => ({ categories: [...s.categories, category] }))
          log('categoria_criada', `Categoria "${category.name}" criada.`, actor)
          return category
        },
        updateCategory: (id, patch, actor) => {
          const before = get().categories.find((c) => c.id === id)
          if (!before) return
          const next = { ...patch }
          if (next.slug !== undefined) {
            next.slug = slugify(next.slug) || before.slug
            if (get().categories.some((c) => c.slug === next.slug && c.id !== id)) next.slug = `${next.slug}-${id.slice(-4)}`
          }
          set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...next } : c)) }))
          log('categoria_editada', `Categoria "${patch.name ?? before.name}" editada${patch.active !== undefined && patch.active !== before.active ? (patch.active ? ' (ativada)' : ' (desativada)') : ''}.`, actor)
        },
        deleteCategory: (id, actor) => {
          const c = get().categories.find((x) => x.id === id)
          const count = get().products.filter((p) => p.categoryId === id).length
          if (count > 0) return { ok: false, error: `Existem ${count} exame(s) nesta categoria. Mova-os para outra categoria antes de excluir.` }
          set((s) => ({ categories: s.categories.filter((x) => x.id !== id) }))
          if (c) log('categoria_excluida', `Categoria "${c.name}" excluída.`, actor)
          return { ok: true, data: undefined }
        },
        moveCategory: (id, direction, actor) => {
          const list = [...get().categories].sort((a, b) => a.order - b.order)
          const idx = list.findIndex((c) => c.id === id)
          const target = idx + direction
          if (idx < 0 || target < 0 || target >= list.length) return
          ;[list[idx], list[target]] = [list[target], list[idx]]
          set({ categories: list.map((c, i) => ({ ...c, order: i + 1 })) })
          log('categoria_editada', `Ordem de exibição da categoria "${list[target].name}" alterada.`, actor)
        },

        // ───────────────────────────── carrinho
        addToCart: (productId, quantity = 1) =>
          set((s) => {
            const existing = s.cart.find((c) => c.productId === productId)
            if (existing) {
              return { cart: s.cart.map((c) => (c.productId === productId ? { ...c, quantity: Math.min(MAX_QTY, c.quantity + quantity) } : c)) }
            }
            return { cart: [...s.cart, { productId, quantity: Math.min(MAX_QTY, quantity), addedAt: now() }] }
          }),
        removeFromCart: (productId) => set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) })),
        setQuantity: (productId, quantity) =>
          set((s) => ({
            cart:
              quantity <= 0
                ? s.cart.filter((c) => c.productId !== productId)
                : s.cart.map((c) => (c.productId === productId ? { ...c, quantity: Math.min(MAX_QTY, quantity) } : c)),
          })),
        clearCart: () => set({ cart: [] }),

        // ───────────────────────────── favoritos e histórico
        toggleFavorite: (productId) => {
          const isFav = get().favorites.includes(productId)
          set((s) => ({ favorites: isFav ? s.favorites.filter((f) => f !== productId) : [productId, ...s.favorites] }))
          return !isFav
        },
        addViewed: (productId) =>
          set((s) => ({ viewed: [{ productId, at: now() }, ...s.viewed.filter((v) => v.productId !== productId)].slice(0, 12) })),
        clearViewed: () => set({ viewed: [] }),
        addRecentSearch: (term) => {
          const t = term.trim()
          if (t.length < 2) return
          set((s) => ({ recentSearches: [t, ...s.recentSearches.filter((x) => normalize(x) !== normalize(t))].slice(0, 6) }))
        },
        clearRecentSearches: () => set({ recentSearches: [] }),

        // ───────────────────────────── pedidos
        placeOrder: (input) => {
          const { cart, products, orders, currentUserId } = get()
          const items = cart
            .map((c) => {
              const p = products.find((x) => x.id === c.productId && x.active)
              return p ? { productId: p.id, name: p.name, categoryId: p.categoryId, unitPrice: p.price, quantity: c.quantity } : null
            })
            .filter((x): x is NonNullable<typeof x> => !!x)
          if (!items.length) return { ok: false, error: 'Seu carrinho está vazio.' }
          const subtotal = Math.round(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100) / 100
          const nextNumber = Math.max(1000, ...orders.map((o) => Number(o.number.replace(/\D/g, '')) || 0)) + 1
          const { cpf, ...customer } = input.customer
          const order: Order = {
            id: `ord-${nextNumber}`,
            number: `LC-${nextNumber}`,
            userId: currentUserId ?? undefined,
            customer: { ...customer, email: customer.email.trim().toLowerCase(), cpfMasked: cpfToMasked(cpf) },
            items,
            subtotal,
            discount: 0,
            total: subtotal,
            paymentMethod: input.paymentMethod,
            paymentDetail: input.paymentDetail,
            status: 'aguardando_confirmacao',
            history: [{ status: 'aguardando_confirmacao', at: now(), by: 'Sistema', note: 'Pedido recebido pela loja virtual (simulação).' }],
            adminNotes: '',
            createdAt: now(),
            seeded: false,
          }
          set((s) => ({ orders: [order, ...s.orders], cart: [] }))
          return { ok: true, data: order }
        },
        updateOrderStatus: (id, status, note, actor = 'admin') => {
          const o = get().orders.find((x) => x.id === id)
          if (!o || o.status === status) return
          set((s) => ({
            orders: s.orders.map((x) =>
              x.id === id ? { ...x, status, history: [...x.history, { status, at: now(), by: actor, note: note?.trim() || undefined }] } : x,
            ),
          }))
          log('pedido_atualizado', `Pedido ${o.number} alterado para "${status.replace(/_/g, ' ')}".`, actor)
        },
        updateOrderNotes: (id, notes, actor) => {
          const o = get().orders.find((x) => x.id === id)
          set((s) => ({ orders: s.orders.map((x) => (x.id === id ? { ...x, adminNotes: notes } : x)) }))
          if (o) log('pedido_atualizado', `Observações administrativas do pedido ${o.number} atualizadas.`, actor)
        },

        // ───────────────────────────── conta do paciente (demonstrativa)
        login: (email, password) => {
          const user = get().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
          if (!user || user.password !== password) return { ok: false, error: 'E-mail ou senha incorretos.' }
          set({ currentUserId: user.id })
          return { ok: true, data: user }
        },
        logout: () => set({ currentUserId: null }),
        register: ({ cpf, ...data }) => {
          const email = data.email.trim().toLowerCase()
          if (get().users.some((u) => u.email.toLowerCase() === email)) return { ok: false, error: 'Já existe uma conta com este e-mail.' }
          const user: User = { ...data, email, id: uid('user'), cpfMasked: cpfToMasked(cpf), createdAt: now() }
          set((s) => ({ users: [...s.users, user], currentUserId: user.id }))
          return { ok: true, data: user }
        },
        updateProfile: (patch) =>
          set((s) => ({ users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)) })),
        changePassword: (current, next) => {
          const u = get().users.find((x) => x.id === get().currentUserId)
          if (!u) return { ok: false, error: 'Sessão expirada.' }
          if (u.password !== current) return { ok: false, error: 'Senha atual incorreta.' }
          set((s) => ({ users: s.users.map((x) => (x.id === u.id ? { ...x, password: next } : x)) }))
          return { ok: true, data: undefined }
        },
        resetPassword: (email, newPassword) => {
          const u = get().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
          if (!u) return { ok: false, error: 'Não encontramos uma conta com este e-mail.' }
          set((s) => ({ users: s.users.map((x) => (x.id === u.id ? { ...x, password: newPassword } : x)) }))
          return { ok: true, data: undefined }
        },

        // ───────────────────────────── conteúdo
        updateSettings: (patch, actor) => {
          set((s) => ({ settings: { ...s.settings, ...patch } }))
          log('configuracao_modificada', `Configurações da loja atualizadas (${Object.keys(patch).length} campo(s)).`, actor)
        },
        addBanner: (b, actor) => {
          set((s) => ({ banners: [...s.banners, { ...b, id: uid('banner'), order: Math.max(0, ...s.banners.map((x) => x.order)) + 1 }] }))
          log('banner_alterado', `Banner "${b.title} ${b.highlight}" adicionado.`, actor)
        },
        updateBanner: (id, patch, actor) => {
          const b = get().banners.find((x) => x.id === id)
          set((s) => ({ banners: s.banners.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
          if (b)
            log(
              'banner_alterado',
              `Banner "${patch.title ?? b.title} ${patch.highlight ?? b.highlight}" ${patch.active !== undefined && patch.active !== b.active ? (patch.active ? 'ativado' : 'desativado') : 'editado'}.`,
              actor,
            )
        },
        deleteBanner: (id, actor) => {
          const b = get().banners.find((x) => x.id === id)
          set((s) => ({ banners: s.banners.filter((x) => x.id !== id) }))
          if (b) log('banner_alterado', `Banner "${b.title} ${b.highlight}" excluído.`, actor)
        },
        moveBanner: (id, direction, actor) => {
          const list = [...get().banners].sort((a, b) => a.order - b.order)
          const idx = list.findIndex((b) => b.id === id)
          const target = idx + direction
          if (idx < 0 || target < 0 || target >= list.length) return
          ;[list[idx], list[target]] = [list[target], list[idx]]
          set({ banners: list.map((b, i) => ({ ...b, order: i + 1 })) })
          log('banner_alterado', `Ordem dos banners alterada.`, actor)
        },

        // ───────────────────────────── administração e dados
        logActivity: (type, description, user) => log(type, description, user),
        clearActivity: (actor) => set({ activity: [{ id: uid('act'), type: 'dados_restaurados', description: 'Log de atividades limpo.', user: actor, at: now() }] }),
        resetDemoData: (actor) => {
          const seed = createSeedData()
          set({ ...seed })
          log('dados_restaurados', 'Dados de demonstração restaurados.', actor)
        },
        exportData: () => {
          const s = get()
          const data: PersistedData = {
            version: s.version,
            seededAt: s.seededAt,
            products: s.products,
            categories: s.categories,
            orders: s.orders,
            users: s.users,
            banners: s.banners,
            settings: s.settings,
            activity: s.activity,
            cart: s.cart,
            favorites: s.favorites,
            viewed: s.viewed,
            recentSearches: s.recentSearches,
            currentUserId: s.currentUserId,
          }
          return JSON.stringify({ app: 'laboratorio-cardoso-demo', exportedAt: now(), data }, null, 2)
        },
        importData: (json, actor) => {
          let parsed: unknown
          try {
            parsed = JSON.parse(json)
          } catch {
            return { ok: false, error: 'Arquivo inválido: não foi possível ler o JSON.' }
          }
          const payload = (parsed as { data?: unknown })?.data ?? parsed
          const { data, recovered } = sanitizeData(payload, createSeedData())
          if (recovered.includes('todos os dados') || recovered.length >= 8) {
            return { ok: false, error: 'O arquivo não parece ser uma exportação válida desta loja.' }
          }
          set({ ...data, version: DATA_VERSION })
          log('dados_importados', `Dados importados de arquivo JSON${recovered.length ? ` (restaurados do padrão: ${recovered.join(', ')})` : ''}.`, actor)
          return { ok: true, data: { recovered } }
        },
      }
    },
    {
      name: STORAGE_KEY,
      version: DATA_VERSION,
      storage: safeStorage,
      partialize: (s): PersistedData => ({
        version: s.version,
        seededAt: s.seededAt,
        products: s.products,
        categories: s.categories,
        orders: s.orders,
        users: s.users,
        banners: s.banners,
        settings: s.settings,
        activity: s.activity,
        cart: s.cart,
        favorites: s.favorites,
        viewed: s.viewed,
        recentSearches: s.recentSearches,
        currentUserId: s.currentUserId,
      }),
      migrate: (persisted) => persisted as PersistedData,
    },
  ),
)

/** Sincroniza abas abertas: um pedido feito na loja aparece no painel aberto em outra aba. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useStore.persist.rehydrate()
  })
}
