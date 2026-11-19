import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, Instagram, X } from 'lucide-react'
import { VIDEO_TOPICS, type LabVideo } from '@/data/videos'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { VideoPlayer } from './VideoPlayer'
import { formatDuration } from './format'

type Props = { videos: LabVideo[]; index: number | null; onClose: () => void; onIndexChange: (i: number) => void }

/** Visualizador em tela cheia: player, navegação (setas, teclado, swipe) e playlist. */
export function VideoLightbox({ videos, index, onClose, onIndexChange }: Props) {
  const open = index !== null && !!videos[index]
  return createPortal(<AnimatePresence>{open && <LightboxContent videos={videos} index={index!} onClose={onClose} onIndexChange={onIndexChange} />}</AnimatePresence>, document.body)
}

function LightboxContent({ videos, index, onClose, onIndexChange }: { videos: LabVideo[]; index: number; onClose: () => void; onIndexChange: (i: number) => void }) {
  const instagram = useStore((s) => s.settings.social.instagram)
  const video = videos[index]
  const [dir, setDir] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const advanceTimer = useRef<number>()
  const hasPrev = index > 0
  const hasNext = index < videos.length - 1

  const go = useCallback(
    (d: number) => {
      const next = index + d
      if (next < 0 || next >= videos.length) return
      window.clearTimeout(advanceTimer.current)
      setDir(d)
      onIndexChange(next)
    },
    [index, videos.length, onIndexChange],
  )

  // Trava o scroll, foca o botão fechar e devolve o foco ao sair.
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = prevOverflow
      window.clearTimeout(advanceTimer.current)
      prevFocus?.focus?.({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[role="slider"]')) return
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current
    touch.current = null
    if (!start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1)
    else if (dy > 120 && Math.abs(dy) > Math.abs(dx) * 1.4) onClose()
  }

  const reelUrl = video.instagramUrl || instagram

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#140708] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Vídeo: ${video.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Brilho ambiente a partir do poster */}
      <AnimatePresence>
        <motion.img
          key={video.id}
          src={video.poster}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-0 blur-3xl saturate-150"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-noise opacity-40" onClick={onClose} />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white ring-1 ring-inset ring-white/15 backdrop-blur transition hover:bg-white hover:text-ink-900 sm:right-6 sm:top-6 sm:bg-white/10"
        aria-label="Fechar vídeo"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative z-10 flex h-full w-full items-center justify-center gap-8 lg:w-auto">
        {/* Anterior (desktop) */}
        <NavButton side="left" disabled={!hasPrev} onClick={() => go(-1)} />

        <motion.div
          className="relative h-full w-full sm:h-[min(86dvh,880px)] sm:w-auto sm:aspect-[9/16]"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={video.id}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.97 }),
                center: { opacity: 1, x: 0, scale: 1 },
                exit: (d: number) => ({ opacity: 0, x: d * -60, scale: 0.97 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <VideoPlayer
                video={video}
                className="h-full w-full sm:rounded-[28px] sm:shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)] sm:ring-1 sm:ring-white/10"
                onEnded={() => {
                  if (hasNext) advanceTimer.current = window.setTimeout(() => go(1), 1200)
                }}
              />
              {/* Título sobreposto (mobile e tablet) */}
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/25 to-transparent px-5 pb-12 pt-5 pr-16 sm:rounded-t-[28px] lg:hidden">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-peach-200">
                  {VIDEO_TOPICS[video.topic]} · {index + 1}/{videos.length}
                </span>
                <p className="display mt-1 text-balance text-xl font-medium leading-tight text-white">{video.title}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Indicadores de posição (mobile) */}
          {videos.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 -bottom-5 hidden justify-center gap-1.5 sm:flex lg:hidden">
              {videos.map((v, i) => (
                <span key={v.id} className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/35')} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Painel lateral (desktop) */}
        <motion.aside
          className="hidden h-[min(86dvh,880px)] w-[320px] flex-col text-white lg:flex xl:w-[360px]"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow text-peach-200">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-peach-200" />
            {VIDEO_TOPICS[video.topic]} · {formatDuration(video.duration)}
          </span>
          <AnimatePresence mode="wait">
            <motion.div key={video.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
              <h2 className="display mt-4 text-balance text-[2rem] font-medium leading-[1.08] text-white">{video.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-brand-100/75">{video.description}</p>
            </motion.div>
          </AnimatePresence>
          <a href={reelUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[13.5px] font-semibold text-white ring-1 ring-inset ring-white/15 transition hover:bg-white hover:text-brand-700">
            <Instagram className="h-4 w-4" /> {video.instagramUrl ? 'Ver no Instagram' : 'Seguir no Instagram'} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>

          {videos.length > 1 && (
            <div className="mt-8 flex min-h-0 flex-1 flex-col border-t border-white/10 pt-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Playlist · {index + 1} de {videos.length}
              </span>
              <ol className="-mr-3 mt-3 flex-1 space-y-1 overflow-y-auto pr-3 scrollbar-thin [scrollbar-color:rgba(255,255,255,.2)_transparent]">
                {videos.map((v, i) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => go(i - index)}
                      className={cn('flex w-full items-center gap-3 rounded-2xl p-2 text-left transition', i === index ? 'bg-white/10 ring-1 ring-inset ring-white/15' : 'hover:bg-white/[0.06]')}
                      aria-current={i === index}
                    >
                      <span className="relative aspect-[9/16] w-11 shrink-0 overflow-hidden rounded-lg bg-white/10">
                        <img src={v.poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                        {i === index && (
                          <span className="absolute inset-0 grid place-items-center bg-brand-700/60">
                            <span className="flex h-3 items-end gap-[2px]">
                              {[0, 1, 2].map((b) => (
                                <motion.span key={b} className="w-[3px] rounded-full bg-white" animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }} transition={{ duration: 1.1, repeat: Infinity, delay: b * 0.15 }} />
                              ))}
                            </span>
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className={cn('line-clamp-2 block text-[13.5px] font-semibold leading-snug', i === index ? 'text-white' : 'text-white/75')}>{v.title}</span>
                        <span className="tabular mt-0.5 block text-[12px] text-white/45">
                          {VIDEO_TOPICS[v.topic]} · {formatDuration(v.duration)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </motion.aside>

        {/* Próximo (desktop) */}
        <NavButton side="right" disabled={!hasNext} onClick={() => go(1)} />
      </div>

      {/* Navegação mobile: áreas laterais discretas */}
      {videos.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2 sm:hidden">
          <button type="button" onClick={() => go(-1)} disabled={!hasPrev} className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition disabled:opacity-0" aria-label="Vídeo anterior">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} disabled={!hasNext} className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition disabled:opacity-0" aria-label="Próximo vídeo">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </motion.div>
  )
}

function NavButton({ side, disabled, onClick }: { side: 'left' | 'right'; disabled: boolean; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-inset ring-white/15 backdrop-blur transition hover:bg-white hover:text-brand-700 active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:grid',
        side === 'right' && 'lg:order-last',
      )}
      aria-label={side === 'left' ? 'Vídeo anterior' : 'Próximo vídeo'}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
