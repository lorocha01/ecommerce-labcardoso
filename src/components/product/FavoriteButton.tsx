import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export function FavoriteButton({ productId, name, className, variant = 'floating' }: { productId: string; name: string; className?: string; variant?: 'floating' | 'outline' }) {
  const isFav = useStore((s) => s.favorites.includes(productId))
  const toggle = useStore((s) => s.toggleFavorite)
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const now = toggle(productId)
        toast(now ? 'Adicionado aos favoritos' : 'Removido dos favoritos', { description: name, icon: <Heart className={cn('h-4 w-4', now && 'fill-brand-600 text-brand-600')} /> })
      }}
      className={cn(
        'grid place-items-center transition-colors',
        variant === 'floating' ? 'h-10 w-10 rounded-full bg-white/90 shadow-soft backdrop-blur hover:bg-white' : 'h-11 w-11 rounded-xl bg-white ring-1 ring-inset ring-ink-200 hover:ring-brand-300',
        className,
      )}
      aria-pressed={isFav}
      aria-label={isFav ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
    >
      <Heart className={cn('h-[18px] w-[18px] transition-all', isFav ? 'scale-110 fill-brand-600 text-brand-600' : 'text-ink-600')} />
    </motion.button>
  )
}
