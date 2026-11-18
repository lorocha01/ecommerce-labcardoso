import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useStore } from '@/store'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { whatsappLink } from '@/lib/utils'

export function WhatsAppFloat() {
  const s = useStore((st) => st.settings)
  const [bubble, setBubble] = useState(false)
  const { pathname } = useLocation()
  const raised = /^\/exames\/.+/.test(pathname) || pathname === '/carrinho'
  useEffect(() => {
    let dismissed = false
    try {
      dismissed = sessionStorage.getItem('labcardoso:wa-bubble') === '1'
    } catch {
      /* ignore */
    }
    if (dismissed) return
    const t = setTimeout(() => setBubble(true), 6000)
    return () => clearTimeout(t)
  }, [])
  const close = () => {
    setBubble(false)
    try {
      sessionStorage.setItem('labcardoso:wa-bubble', '1')
    } catch {
      /* ignore */
    }
  }
  return (
    <div className={`fixed right-4 z-[60] flex flex-col items-end gap-3 transition-[bottom] lg:bottom-6 lg:right-6 ${raised ? 'bottom-[152px]' : 'bottom-[88px]'}`}>
      <AnimatePresence>
        {bubble && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className="relative hidden w-64 rounded-2xl bg-white p-4 pr-9 text-sm shadow-lift ring-1 ring-ink-100 lg:block">
            <button type="button" onClick={close} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-ink-400 hover:bg-ink-100" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
            <p className="font-semibold text-ink-900">Ficou com alguma dúvida?</p>
            <p className="mt-1 text-ink-500">Nossa equipe responde pelo WhatsApp sobre exames, preparo e convênios.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href={whatsappLink(s.whatsapp, `Olá! Vim pelo site do ${s.storeName} e gostaria de atendimento.`)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={close}
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,.6)] transition hover:scale-105 active:scale-95"
        aria-label="Falar pelo WhatsApp"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </a>
    </div>
  )
}
