import type {
  ActivityLog,
  ActivityType,
  Banner,
  CartItem,
  Category,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  StoreSettings,
  User,
  ViewedEntry,
} from '@/types'

/** Dados persistidos no LocalStorage — equivalem às "tabelas" de um futuro backend. */
export interface PersistedData {
  version: number
  seededAt: string
  products: Product[]
  categories: Category[]
  orders: Order[]
  users: User[]
  banners: Banner[]
  settings: StoreSettings
  activity: ActivityLog[]
  cart: CartItem[]
  favorites: string[]
  viewed: ViewedEntry[]
  recentSearches: string[]
  currentUserId: string | null
}

export interface PlaceOrderInput {
  customer: {
    name: string
    email: string
    phone: string
    cpf: string
    birthDate: string
    cep: string
    address: string
    city: string
  }
  paymentMethod: PaymentMethod
  paymentDetail?: string
}

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

export interface Actions {
  // catálogo
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, actor?: string) => Product
  updateProduct: (id: string, patch: Partial<Product>, actor?: string) => void
  deleteProduct: (id: string, actor?: string) => void
  addCategory: (c: Omit<Category, 'id' | 'order'>, actor?: string) => Category
  updateCategory: (id: string, patch: Partial<Category>, actor?: string) => void
  deleteCategory: (id: string, actor?: string) => Result
  moveCategory: (id: string, direction: -1 | 1, actor?: string) => void
  // carrinho
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  // favoritos e histórico
  toggleFavorite: (productId: string) => boolean
  addViewed: (productId: string) => void
  clearViewed: () => void
  addRecentSearch: (term: string) => void
  clearRecentSearches: () => void
  // pedidos
  placeOrder: (input: PlaceOrderInput) => Result<Order>
  updateOrderStatus: (id: string, status: OrderStatus, note?: string, actor?: string) => void
  updateOrderNotes: (id: string, notes: string, actor?: string) => void
  // conta do paciente
  login: (email: string, password: string) => Result<User>
  logout: () => void
  register: (data: Omit<User, 'id' | 'createdAt' | 'cpfMasked'> & { cpf: string }) => Result<User>
  updateProfile: (patch: Partial<Omit<User, 'id' | 'email' | 'password'>>) => void
  changePassword: (current: string, next: string) => Result
  resetPassword: (email: string, newPassword: string) => Result
  // conteúdo
  updateSettings: (patch: Partial<StoreSettings>, actor?: string) => void
  addBanner: (b: Omit<Banner, 'id' | 'order'>, actor?: string) => void
  updateBanner: (id: string, patch: Partial<Banner>, actor?: string) => void
  deleteBanner: (id: string, actor?: string) => void
  moveBanner: (id: string, direction: -1 | 1, actor?: string) => void
  // administração
  logActivity: (type: ActivityType, description: string, user: string) => void
  clearActivity: (actor: string) => void
  resetDemoData: (actor?: string) => void
  exportData: () => string
  importData: (json: string, actor?: string) => Result<{ recovered: string[] }>
}

export type AppState = PersistedData & Actions
