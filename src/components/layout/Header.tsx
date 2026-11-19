import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, FileCheck2, Heart, Menu, Phone, Search, ShoppingBag, User, X } from 'lucide-react'
import { useStore } from '@/store'
import { useCart, useCurrentUser, usePublicCategories, usePublicProducts } from '@/store/hooks'
import { Logo } from '@/components/ui/Logo'
import { DynamicIcon } from '@/components/ui/Icon'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { Drawer } from '@/components/ui/Modal'
import { cn, telLink, whatsappLink } from '@/lib/utils'
import { RESULTS_PATH, SHOP_PATH, checkupsFirst, shopCategoryName, shopUrl } from '@/lib/routes'
import { SearchBox } from './SearchBox'

type NavItem = { to: string; label: string; end?: boolean; mega?: boolean; highlight?: boolean }
const NAV: NavItem[] = [
  { to: '/', label: 'Início', end: true },
  { to: SHOP_PATH, label: 'Comprar Exames', mega: true },
  { to: RESULTS_PATH, label: 'Resultados de Exames', highlight: true },
  { to: '/sobre', label: 'O laboratório' },
  { to: '/faq', label: 'Dúvidas' },
  { to: '/contato', label: 'Contato' },
]

export function AnnouncementBar() {
  const settings = useStore((s) => s.settings)
  if (!settings.announcementActive || !settings.announcement) return null
  return (
    <div className="relative z-40 bg-brand-900 text-[12px] text-brand-50">
      <div className="container flex h-9 items-center justify-center gap-6 sm:justify-between">
        <p className="truncate text-center">
          <span className="mr-2 inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Demo</span>
          {settings.announcement}
        </p>
        <div className="hidden shrink-0 items-center gap-5 sm:flex">
          <a href={telLink(settings.phone)} className="inline-flex items-center gap-1.5 hover:text-white">
            <Phone className="h-3.5 w-3.5" /> {settings.phone}
          </a>
          <span className="text-brand-200/70">{settings.slogan}</span>
        </div>
      </div>
    </div>
  )
}

function CartLink({ className }: { className?: string }) {
  const { count } = useCart()
  return (
    <Link to="/carrinho" className={cn('relative grid h-11 w-11 place-items-center rounded-xl text-ink-800 transition hover:bg-ink-100', className)} aria-label={`Carrinho com ${count} itens`}>
      <span data-cart-target className="grid place-items-center">
        <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.8} />
      </span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="tabular absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white ring-2 ring-white"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  const categories = usePublicCategories()
  const products = usePublicProducts()
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="absolute left-0 right-0 top-full z-40 border-b border-ink-100 bg-white shadow-lift"
      onMouseLeave={onClose}
    >
      <div className="container grid grid-cols-12 gap-8 py-8">
        <div className="col-span-8">
          <div className="mb-3 flex items-center justify-between px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">Categorias</span>
            <Link to={SHOP_PATH} onClick={onClose} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:text-brand-800">
              Todos os exames e check-ups ({products.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
          {checkupsFirst(categories).map((c) => (
            <Link key={c.id} to={shopUrl(c.slug)} onClick={onClose} className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-ink-50">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <DynamicIcon name={c.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-ink-900">{shopCategoryName(c)}</span>
                <span className="text-xs text-ink-500">{products.filter((p) => p.categoryId === c.id).length} exames</span>
              </span>
            </Link>
          ))}
          </div>
        </div>
        <div className="col-span-4 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-peach-200">Check-ups e pacotes</span>
          <p className="display mt-2 text-2xl leading-tight">Sua rotina de exames em um só pedido.</p>
          <p className="mt-2 text-sm text-brand-100">Combinações práticas para acompanhar a saúde com o seu médico.</p>
          <Link to={shopUrl('check-ups')} onClick={onClose} className="mt-5 inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-brand-700 transition hover:bg-peach-50">
            Ver check-ups
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export function Header() {
  const settings = useStore((s) => s.settings)
  const user = useCurrentUser()
  const favCount = useStore((s) => s.favorites.length)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mega, setMega] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setMega(false)
  }, [location.pathname])

  const wa = whatsappLink(settings.whatsapp, `Olá! Vim pelo site do ${settings.storeName} e gostaria de informações sobre exames.`)

  return (
    <>
      <header className={cn('sticky top-0 z-50 border-b transition-all duration-300', scrolled ? 'border-ink-100 bg-white/90 shadow-[0_8px_30px_-12px_rgba(28,21,20,.12)] backdrop-blur-xl' : 'border-transparent bg-white')}>
        <div className="container">
          <div className={cn('flex items-center gap-3 transition-all duration-300 lg:gap-8', scrolled ? 'h-16' : 'h-[72px] lg:h-20')}>
            <button type="button" className="-ml-2 grid h-11 w-11 place-items-center rounded-xl text-ink-800 hover:bg-ink-100 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              <Menu className="h-6 w-6" />
            </button>
            <Logo className={cn('transition-all duration-300', scrolled ? 'h-9' : 'h-10 lg:h-12')} />

            <SearchBox className="hidden max-w-xl flex-1 lg:block" />

            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
              <button type="button" onClick={() => setSearchOpen(true)} className="grid h-11 w-11 place-items-center rounded-xl text-ink-800 hover:bg-ink-100 lg:hidden" aria-label="Buscar exames">
                <Search className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </button>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="hidden h-11 items-center gap-2 rounded-xl px-3.5 text-[13px] font-semibold text-[#128C4B] ring-1 ring-inset ring-[#25D366]/30 transition hover:bg-[#25D366]/10 xl:inline-flex">
                <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp
              </a>
              <Link to="/minha-conta" className="hidden h-11 items-center gap-2.5 rounded-xl px-3 text-ink-800 transition hover:bg-ink-100 md:inline-flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-100 text-ink-700">
                  {user ? <span className="text-xs font-bold">{user.name.charAt(0)}</span> : <User className="h-4 w-4" />}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-[11px] text-ink-500">{user ? 'Olá,' : 'Entre ou cadastre-se'}</span>
                  <span className="block text-[13px] font-semibold">{user ? user.name.split(' ')[0] : 'Minha conta'}</span>
                </span>
              </Link>
              <Link to="/favoritos" className="relative hidden h-11 w-11 place-items-center rounded-xl text-ink-800 transition hover:bg-ink-100 sm:grid" aria-label="Favoritos">
                <Heart className="h-[22px] w-[22px]" strokeWidth={1.8} />
                {favCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />}
              </Link>
              <CartLink />
            </div>
          </div>
        </div>

        <nav className="relative hidden border-t border-ink-100/80 lg:block" aria-label="Principal">
          <div className="container flex h-12 items-center justify-between">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.to} onMouseEnter={() => setMega(!!item.mega)}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      item.highlight
                        ? cn('mx-1.5 inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-semibold ring-1 ring-inset transition-all', isActive ? 'bg-brand-600 text-white ring-brand-600 shadow-brand' : 'bg-brand-50 text-brand-700 ring-brand-100 hover:bg-brand-600 hover:text-white hover:ring-brand-600')
                        : cn('relative inline-flex h-12 items-center gap-1 px-3.5 text-[14px] font-medium transition-colors', isActive ? 'text-brand-700' : 'text-ink-600 hover:text-ink-900')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.highlight && <FileCheck2 className="h-4 w-4" strokeWidth={2} />}
                        {item.label}
                        {item.mega && <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', mega && 'rotate-180')} />}
                        {isActive && !item.highlight && <motion.span layoutId="nav-underline" className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-brand-600" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-5 text-[13px] text-ink-500">
              <a href={telLink(settings.phone)} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                <Phone className="h-3.5 w-3.5" /> {settings.phone}
              </a>
              <span className="h-4 w-px bg-ink-200" />
              <span>
                {settings.city}/{settings.state}
              </span>
            </div>
          </div>
          <AnimatePresence>{mega && <MegaMenu onClose={() => setMega(false)} />}</AnimatePresence>
        </nav>
      </header>

      {/* Busca mobile em tela cheia */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div className="fixed inset-0 z-[75] bg-canvas/95 backdrop-blur-xl lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="container pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-bold text-ink-900">Buscar exames</span>
                <button type="button" onClick={() => setSearchOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft" aria-label="Fechar busca">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SearchBox variant="overlay" autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useStore((s) => s.settings)
  const categories = usePublicCategories()
  const user = useCurrentUser()
  return (
    <Drawer open={open} onClose={onClose} side="left" label="Menu">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <Logo className="h-9" />
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-ink-100" aria-label="Fechar menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <Link to="/minha-conta" onClick={onClose} className="mb-5 flex items-center gap-3 rounded-2xl bg-ink-50 p-3.5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 font-bold text-white">{user ? user.name.charAt(0) : <User className="h-5 w-5" />}</span>
          <span>
            <span className="block text-xs text-ink-500">{user ? 'Olá,' : 'Área do paciente'}</span>
            <span className="block font-semibold text-ink-900">{user ? user.name : 'Entrar ou cadastrar'}</span>
          </span>
        </Link>
        <nav className="space-y-0.5">
          {NAV.map((n) =>
            n.highlight ? (
              <NavLink key={n.to} to={n.to} onClick={onClose} className="my-1.5 flex items-center gap-3 rounded-2xl bg-[#1F0C0D] p-3 text-white">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand">
                  <FileCheck2 className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{n.label}</span>
                  <span className="block text-xs text-brand-100/70">Consulta rápida e segura</span>
                </span>
                <ArrowRight className="h-4 w-4 text-peach-200" />
              </NavLink>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={onClose} className={({ isActive }) => cn('flex h-12 items-center rounded-xl px-3 text-[15px] font-semibold', isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-ink-50')}>
                {n.label}
              </NavLink>
            ),
          )}
          <NavLink to="/pedidos" onClick={onClose} className={({ isActive }) => cn('flex h-12 items-center rounded-xl px-3 text-[15px] font-semibold', isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-ink-50')}>
            Meus pedidos
          </NavLink>
          <NavLink to="/favoritos" onClick={onClose} className={({ isActive }) => cn('flex h-12 items-center rounded-xl px-3 text-[15px] font-semibold', isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-ink-50')}>
            Favoritos
          </NavLink>
        </nav>
        <p className="mb-2 mt-6 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">Comprar por categoria</p>
        <div className="grid grid-cols-2 gap-2">
          {checkupsFirst(categories).map((c) => (
            <Link key={c.id} to={shopUrl(c.slug)} onClick={onClose} className="flex items-center gap-2 rounded-xl bg-ink-50 p-2.5 text-[13px] font-medium text-ink-800">
              <DynamicIcon name={c.icon} className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="truncate">{shopCategoryName(c)}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="space-y-2 border-t border-ink-100 p-5 safe-bottom">
        <a href={whatsappLink(settings.whatsapp, 'Olá! Gostaria de informações sobre exames.')} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] font-semibold text-white">
          <WhatsAppIcon className="h-5 w-5" /> Falar no WhatsApp
        </a>
        <a href={telLink(settings.phone)} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink-100 font-semibold text-ink-800">
          <Phone className="h-4 w-4" /> {settings.phone}
        </a>
      </div>
    </Drawer>
  )
}
