import { NavLink } from 'react-router-dom'
import { FileCheck2, Home, LayoutGrid, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/store/hooks'
import { cn } from '@/lib/utils'

/** Navegação inferior pensada para uso com uma mão no celular. */
export function MobileTabBar() {
  const { count } = useCart()
  const items = [
    { to: '/', label: 'Início', icon: Home, end: true },
    { to: '/exames', label: 'Comprar', icon: LayoutGrid },
    { to: '/resultados', label: 'Resultados', icon: FileCheck2 },
    { to: '/minha-conta', label: 'Conta', icon: User },
    { to: '/carrinho', label: 'Carrinho', icon: ShoppingBag, badge: count },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-100 bg-white/95 backdrop-blur-xl safe-bottom lg:hidden" aria-label="Navegação rápida">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => cn('relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition', isActive ? 'text-brand-700' : 'text-ink-500')}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600" />}
                  <span className="relative" data-cart-target={to === '/carrinho' ? '' : undefined}>
                    <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                    {badge ? <span className="tabular absolute -right-2.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">{badge}</span> : null}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
