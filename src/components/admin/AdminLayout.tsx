import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ChevronsLeft,
  ChevronsRight,
  FlaskConical,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  Store,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/store'
import { useAdminAuth } from '@/store/adminAuth'
import { useAdminPrefs } from '@/store/adminPrefs'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean; badge?: 'awaiting' }[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart, badge: 'awaiting' },
  { to: '/admin/exames', label: 'Exames', icon: FlaskConical },
  { to: '/admin/categorias', label: 'Categorias', icon: LayoutGrid },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/admin/banners', label: 'Banners', icon: Images },
  { to: '/admin/atividades', label: 'Atividades', icon: Activity },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const settings = useStore((s) => s.settings)
  const awaiting = useStore((s) => s.orders.filter((o) => o.status === 'aguardando_confirmacao').length)
  const session = useAdminAuth((s) => s.session)
  const logout = useAdminAuth((s) => s.logout)
  const logActivity = useStore((s) => s.logActivity)
  const navigate = useNavigate()

  const doLogout = () => {
    if (session) logActivity('logout', 'Logout realizado no painel administrativo.', session.user)
    logout()
    toast('Sessão encerrada.')
    navigate('/admin/login')
  }

  const item = (to: string, label: string, Icon: LucideIcon, opts: { end?: boolean; badge?: number } = {}) => (
    <NavLink
      key={to}
      to={to}
      end={opts.end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) => cn('group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition', isActive ? 'text-white' : 'text-brand-100/65 hover:bg-white/5 hover:text-white', collapsed && 'justify-center px-0')}
    >
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 shadow-[0_8px_20px_-8px_rgba(187,32,38,.7)]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          <Icon className="relative h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          {!collapsed && <span className="relative flex-1 truncate">{label}</span>}
          {!!opts.badge && (
            <span className={cn('tabular relative grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[10.5px] font-bold text-ink-900', collapsed && 'absolute -right-1 -top-1 h-4 min-w-4 text-[9px]')}>{opts.badge}</span>
          )}
        </>
      )}
    </NavLink>
  )

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center gap-3 px-4', collapsed && 'justify-center px-2')}>
        <img src={collapsed ? '/favicon.png' : settings.logoWhiteUrl} alt={settings.storeName} className={cn(collapsed ? 'h-8 w-8 rounded-lg' : 'h-8 w-auto')} />
        {!collapsed && <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-peach-200">Admin</span>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-none" aria-label="Menu administrativo">
        {!collapsed && <p className="mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-100/35">Gestão</p>}
        {NAV.map((n) => item(n.to, n.label, n.icon, { end: n.end, badge: n.badge === 'awaiting' ? awaiting : undefined }))}
      </nav>
      <div className="space-y-1 border-t border-white/10 px-3 py-3">
        <Link to="/" onClick={onNavigate} title={collapsed ? 'Voltar para a loja' : undefined} className={cn('flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium text-brand-100/65 transition hover:bg-white/5 hover:text-white', collapsed && 'justify-center px-0')}>
          <Store className="h-[18px] w-[18px]" strokeWidth={1.8} /> {!collapsed && 'Voltar para a loja'}
        </Link>
        <button type="button" onClick={doLogout} title={collapsed ? 'Sair' : undefined} className={cn('flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium text-brand-100/65 transition hover:bg-white/5 hover:text-white', collapsed && 'justify-center px-0')}>
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} /> {!collapsed && 'Sair'}
        </button>
        {!collapsed && session && (
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">A</span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-semibold text-white">{session.name}</span>
              <span className="block truncate text-[11px] text-brand-100/50">Login {formatRelative(session.loggedAt)}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const session = useAdminAuth((s) => s.session)
  const { collapsed, toggleCollapsed } = useAdminPrefs()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    document.title = 'Painel administrativo · Laboratório Cardoso'
  }, [location.pathname])

  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  const current = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))

  return (
    <div className="min-h-dvh bg-[#F6F3F1]">
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden bg-[#1F0C0D] transition-[width] duration-300 lg:block', collapsed ? 'w-[76px]' : 'w-64')}>
        <div className="absolute inset-0 bg-noise opacity-40" />
        <div className="relative h-full">
          <SidebarContent collapsed={collapsed} />
        </div>
        <button type="button" onClick={toggleCollapsed} className="absolute -right-3 top-20 z-10 grid h-6 w-6 place-items-center rounded-full bg-white text-ink-600 shadow-soft ring-1 ring-ink-200 hover:text-ink-900" aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
          {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-ink-900/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside className="absolute inset-y-0 left-0 w-72 bg-[#1F0C0D]" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
              <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg text-white/70 hover:bg-white/10" aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </button>
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className={cn('transition-[padding] duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} className="-ml-1 grid h-10 w-10 place-items-center rounded-xl text-ink-700 hover:bg-ink-100 lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">Painel administrativo</p>
            <p className="truncate text-[15px] font-bold text-ink-900">{current?.label ?? 'Detalhes'}</p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Dados demonstrativos
          </span>
          <Link to="/" target="_blank" className="hidden h-10 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold text-ink-700 ring-1 ring-inset ring-ink-200 transition hover:bg-ink-50 md:inline-flex">
            <Store className="h-4 w-4" /> Ver loja
          </Link>
        </header>
        <AnimatePresence mode="wait">
          <motion.main key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:py-8">
            {outlet}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
