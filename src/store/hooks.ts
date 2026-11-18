import { useMemo } from 'react'
import type { Category, Product } from '@/types'
import { useStore } from './index'

/** Categorias ativas, ordenadas para exibição pública. */
export function usePublicCategories(): Category[] {
  const categories = useStore((s) => s.categories)
  return useMemo(() => categories.filter((c) => c.active).sort((a, b) => a.order - b.order), [categories])
}

/** Exames visíveis na loja: ativos e em categoria ativa. */
export function usePublicProducts(): Product[] {
  const products = useStore((s) => s.products)
  const categories = useStore((s) => s.categories)
  return useMemo(() => {
    const activeCats = new Set(categories.filter((c) => c.active).map((c) => c.id))
    return products.filter((p) => p.active && activeCats.has(p.categoryId))
  }, [products, categories])
}

export function useCategoryMap(): Record<string, Category> {
  const categories = useStore((s) => s.categories)
  return useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
}

export interface CartLine {
  product: Product
  quantity: number
  lineTotal: number
}

export function useCart() {
  const cart = useStore((s) => s.cart)
  const products = usePublicProducts()
  return useMemo(() => {
    const lines: CartLine[] = cart
      .map((c) => {
        const product = products.find((p) => p.id === c.productId)
        return product ? { product, quantity: c.quantity, lineTotal: product.price * c.quantity } : null
      })
      .filter((x): x is CartLine => !!x)
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
    const savings = lines.reduce((s, l) => s + (l.product.compareAtPrice ? (l.product.compareAtPrice - l.product.price) * l.quantity : 0), 0)
    const count = lines.reduce((s, l) => s + l.quantity, 0)
    return { lines, subtotal, total: subtotal, savings, count, unavailable: cart.length - lines.length }
  }, [cart, products])
}

export function useCurrentUser() {
  const users = useStore((s) => s.users)
  const id = useStore((s) => s.currentUserId)
  return useMemo(() => users.find((u) => u.id === id) ?? null, [users, id])
}

/** Pedidos do paciente logado (por vínculo de conta ou e-mail). */
export function useMyOrders() {
  const orders = useStore((s) => s.orders)
  const user = useCurrentUser()
  return useMemo(() => {
    if (!user) return []
    return orders.filter((o) => o.userId === user.id || o.customer.email.toLowerCase() === user.email.toLowerCase())
  }, [orders, user])
}
