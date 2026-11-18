import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types'
import { useStore } from '@/store'
import { buttonClass } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { flyToCart } from './flyToCart'

export function AddToCartButton({ product, quantity = 1, size = 'md', className, label = 'Adicionar', fullLabel }: { product: Product; quantity?: number; size?: 'sm' | 'md' | 'lg'; className?: string; label?: string; fullLabel?: string }) {
  const addToCart = useStore((s) => s.addToCart)
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  const onClick = () => {
    addToCart(product.id, quantity)
    flyToCart(ref.current)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
    toast.success(`${product.name} adicionado ao carrinho`, {
      description: quantity > 1 ? `${quantity} unidades` : 'Carrinho atualizado',
      action: { label: 'Ver carrinho', onClick: () => navigate('/carrinho') },
    })
  }

  return (
    <button ref={ref} type="button" onClick={onClick} className={cn(buttonClass(added ? 'dark' : 'primary', size), 'overflow-hidden', className)} aria-label={`Adicionar ${product.name} ao carrinho`}>
      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <motion.span key="ok" className="inline-flex items-center gap-2" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.18 }}>
            <Check className="h-4 w-4" strokeWidth={2.5} /> Adicionado
          </motion.span>
        ) : (
          <motion.span key="add" className="inline-flex items-center gap-2" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.18 }}>
            <ShoppingBag className="h-4 w-4" />
            {fullLabel ?? label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
