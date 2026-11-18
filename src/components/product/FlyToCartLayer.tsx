import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Fly {
  id: number
  x: number
  y: number
  tx: number
  ty: number
}

/** Camada global que anima um "pixel" do botão até o ícone do carrinho. */
export function FlyToCartLayer() {
  const [flies, setFlies] = useState<Fly[]>([])
  useEffect(() => {
    const onFly = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail
      const targets = [...document.querySelectorAll<HTMLElement>('[data-cart-target]')].filter((el) => el.offsetParent !== null)
      const target = targets[0]
      if (!target) return
      const r = target.getBoundingClientRect()
      const id = Date.now() + Math.random()
      setFlies((f) => [...f, { id, x, y, tx: r.left + r.width / 2, ty: r.top + r.height / 2 }])
      setTimeout(() => {
        setFlies((f) => f.filter((fl) => fl.id !== id))
        target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' })
      }, 720)
    }
    window.addEventListener('labcardoso:fly', onFly)
    return () => window.removeEventListener('labcardoso:fly', onFly)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      <AnimatePresence>
        {flies.map((f) => (
          <motion.span
            key={f.id}
            className="absolute left-0 top-0 h-4 w-4 rounded-[5px] bg-brand-600 shadow-brand"
            initial={{ x: f.x - 8, y: f.y - 8, scale: 1, opacity: 1, rotate: 0 }}
            animate={{ x: [f.x - 8, (f.x + f.tx) / 2, f.tx - 8], y: [f.y - 8, Math.min(f.y, f.ty) - 120, f.ty - 8], scale: [1, 1.3, 0.5], rotate: [0, 90, 180], opacity: [1, 1, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72, ease: [0.45, 0, 0.2, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
