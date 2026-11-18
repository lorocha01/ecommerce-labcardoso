import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PeriodKey } from '@/lib/analytics'

/** Preferências de interface do painel (período selecionado, sidebar recolhida). */
interface AdminPrefs {
  period: PeriodKey
  custom: { from: string; to: string }
  collapsed: boolean
  setPeriod: (p: PeriodKey) => void
  setCustom: (c: { from: string; to: string }) => void
  toggleCollapsed: () => void
}

const today = new Date().toISOString().slice(0, 10)
const monthAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10)

export const useAdminPrefs = create<AdminPrefs>()(
  persist(
    (set) => ({
      period: '30d',
      custom: { from: monthAgo, to: today },
      collapsed: false,
      setPeriod: (period) => set({ period }),
      setCustom: (custom) => set({ custom, period: 'custom' }),
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: 'labcardoso:admin-prefs' },
  ),
)
