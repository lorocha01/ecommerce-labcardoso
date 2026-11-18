import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'soft' | 'white' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-brand hover:bg-brand-700 active:bg-brand-800 [&_svg]:transition-transform hover:[&_svg.arrow]:translate-x-0.5',
  secondary: 'bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:ring-ink-300 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-100/70 hover:text-ink-900',
  dark: 'bg-ink-900 text-white hover:bg-ink-800',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  white: 'bg-white text-brand-700 shadow-soft hover:bg-peach-50',
  danger: 'bg-white text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 min-h-[52px] px-7 text-[15px] gap-2.5 rounded-2xl',
  icon: 'h-11 w-11 rounded-xl',
  'icon-sm': 'h-9 w-9 rounded-lg',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  to?: string
  href?: string
  external?: boolean
  children?: ReactNode
}

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(
    'relative inline-flex select-none items-center justify-center whitespace-nowrap font-semibold tracking-[-0.005em] transition-all duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, to, href, external, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const cls = buttonClass(variant, size, className)
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={cls} onClick={rest.onClick as never} aria-label={rest['aria-label']}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} aria-label={rest['aria-label']}>
        {content}
      </a>
    )
  }
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
})
