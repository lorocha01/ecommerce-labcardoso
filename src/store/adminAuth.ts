import { create } from 'zustand'
import { ADMIN_CREDENTIALS } from '@/data/users'

/**
 * Autenticação ADMINISTRATIVA DEMONSTRATIVA.
 * ⚠️ Não é segura para produção: as credenciais ficam no código do frontend e a
 * sessão é armazenada no navegador. Em produção, substitua por autenticação
 * no servidor (ex.: JWT/sessão HTTP-only) mantendo a mesma interface.
 */
const KEY = 'labcardoso:admin-session'

interface AdminSession {
  user: string
  name: string
  loggedAt: string
  remember: boolean
}

function read(): AdminSession | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as AdminSession
    return s && typeof s.user === 'string' ? s : null
  } catch {
    return null
  }
}

interface AdminAuthState {
  session: AdminSession | null
  login: (user: string, password: string, remember: boolean) => boolean
  logout: () => void
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  session: read(),
  login: (user, password, remember) => {
    const ok = user.trim().toLowerCase() === ADMIN_CREDENTIALS.user && password === ADMIN_CREDENTIALS.password
    if (!ok) return false
    const session: AdminSession = { user: ADMIN_CREDENTIALS.user, name: ADMIN_CREDENTIALS.name, loggedAt: new Date().toISOString(), remember }
    try {
      ;(remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session))
    } catch {
      /* ignore */
    }
    set({ session })
    return true
  },
  logout: () => {
    try {
      localStorage.removeItem(KEY)
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    set({ session: null })
  },
}))
