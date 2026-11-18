import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

function useLockScroll(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title?: ReactNode; description?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  useLockScroll(open, onClose)
  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' }
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <motion.div className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={cn('relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-lift sm:rounded-[28px]', widths[size])}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 sm:px-7 sm:py-5">
                <div>
                  {title && <h2 className="text-lg font-bold text-ink-900">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
                </div>
                <button type="button" onClick={onClose} className="-mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900" aria-label="Fechar">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin sm:px-7 sm:py-6">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 bg-ink-50/50 px-5 py-4 safe-bottom sm:px-7">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Drawer({ open, onClose, children, side = 'right', className, label }: { open: boolean; onClose: () => void; children: ReactNode; side?: 'left' | 'right'; className?: string; label?: string }) {
  useLockScroll(open, onClose)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className={cn('absolute top-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-lift', side === 'right' ? 'right-0' : 'left-0', className)}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
          >
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmText = 'Confirmar', danger }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: ReactNode; confirmText?: string; danger?: boolean }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="h-10 rounded-xl px-4 text-sm font-semibold text-ink-700 hover:bg-ink-100">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cn('h-10 rounded-xl px-4 text-sm font-semibold text-white transition', danger ? 'bg-brand-600 hover:bg-brand-700' : 'bg-ink-900 hover:bg-ink-800')}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="text-[15px] leading-relaxed text-ink-600">{description}</div>
    </Modal>
  )
}
