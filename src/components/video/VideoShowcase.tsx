import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Clapperboard, Instagram, Play } from 'lucide-react'
import { VIDEO_TOPICS, videosFor, type LabVideo, type VideoPlacement, type VideoTopic } from '@/data/videos'
import { useStore } from '@/store'
import { buttonClass } from '@/components/ui/Button'
import { PixelSquares } from '@/components/ui/PixelSquares'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'
import { VideoCard } from './VideoCard'
import { VideoLightbox } from './VideoLightbox'
import { formatDuration } from './format'

type Props = {
  placement: VideoPlacement
  eyebrow: string
  title: ReactNode
  description: ReactNode
  className?: string
}

/**
 * Galeria de reels: texto à esquerda, trilho de miniaturas verticais à direita.
 * Não renderiza nada quando não há vídeos para o local informado.
 */
export function VideoShowcase({ placement, eyebrow, title, description, className }: Props) {
  const all = useMemo(() => videosFor(placement), [placement])
  const instagram = useStore((s) => s.settings.social.instagram)
  const [topic, setTopic] = useState<VideoTopic | 'all'>('all')
  const [open, setOpen] = useState<number | null>(null)
  const list = useMemo(() => (topic === 'all' ? all : all.filter((v) => v.topic === topic)), [all, topic])
  const topics = useMemo(() => [...new Set(all.map((v) => v.topic))], [all])
  const totalSeconds = all.reduce((n, v) => n + v.duration, 0)

  if (!all.length) return null

  return (
    <section className={cn('relative overflow-hidden py-20 lg:py-28', className)} aria-labelledby={`videos-${placement}`}>
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_80%_40%,#000_10%,transparent_60%)]" />
      <div className="absolute -right-48 top-10 h-[520px] w-[520px] rounded-full bg-peach-200/45 blur-3xl" />
      <div className="absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />

      <div className="container relative grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-14">
        <Reveal className="relative">
          <PixelSquares className="absolute -left-8 -top-10 h-20 w-20 opacity-25" />
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-brand-600" />
            {eyebrow}
          </span>
          <h2 id={`videos-${placement}`} className="display mt-4 text-balance text-4xl font-medium leading-[1.05] text-ink-900 sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-pretty text-[16px] leading-relaxed text-ink-500">{description}</p>

          <div className="mt-6 flex items-center gap-3 text-[13px] font-semibold text-ink-600">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-peach-100 text-brand-700">
              <Clapperboard className="h-4 w-4" />
            </span>
            {all.length} {all.length === 1 ? 'vídeo' : 'vídeos'} · {formatDuration(totalSeconds)} de conteúdo
          </div>

          {topics.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar vídeos por tema">
              {(['all', ...topics] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={topic === t}
                  onClick={() => setTopic(t)}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 active:scale-95',
                    topic === t ? 'bg-ink-900 text-white shadow-soft' : 'bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:text-ink-900 hover:ring-ink-300',
                  )}
                >
                  {t === 'all' ? 'Todos' : VIDEO_TOPICS[t]}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => setOpen(0)} className={buttonClass('primary', 'lg')}>
              <Play className="h-4 w-4 fill-current" /> Assistir aos vídeos
            </button>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary', 'lg')}>
              <Instagram className="h-4 w-4 text-brand-600" /> Siga no Instagram <ArrowUpRight className="h-4 w-4 text-ink-400" />
            </a>
          </div>
        </Reveal>

        <VideoRail videos={list} onOpen={setOpen} />
      </div>

      <VideoLightbox videos={list} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </section>
  )
}

function VideoRail({ videos, onOpen }: { videos: LabVideo[]; onOpen: (i: number) => void }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState({ prev: false, next: false, progress: 0, ratio: 1 })

  const measure = useCallback(() => {
    const el = railRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setState({
      prev: el.scrollLeft > 4,
      next: el.scrollLeft < max - 4,
      progress: max > 0 ? el.scrollLeft / max : 0,
      ratio: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1,
    })
  }, [])

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    el.scrollTo({ left: 0 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [videos, measure])

  const scroll = (d: number) => {
    const el = railRef.current
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.85, behavior: 'smooth' })
  }
  const scrollable = state.prev || state.next

  return (
    <div className="relative min-w-0">
      <div
        ref={railRef}
        onScroll={measure}
        className={cn(
          '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 pt-2 scrollbar-none sm:-mx-6 sm:px-6 lg:mx-0 lg:gap-5 lg:px-0',
          state.next && 'lg:[mask-image:linear-gradient(90deg,#000_82%,transparent)]',
          state.prev && state.next && 'lg:[mask-image:linear-gradient(90deg,transparent,#000_8%,#000_82%,transparent)]',
          state.prev && !state.next && 'lg:[mask-image:linear-gradient(90deg,transparent,#000_8%)]',
        )}
      >
        {videos.map((v, i) => (
          <Reveal key={v.id} delay={Math.min(i, 4) * 0.07} className="w-[62%] shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-2.5rem)/3)]">
            <VideoCard video={v} onOpen={() => onOpen(i)} priority={i < 2} />
          </Reveal>
        ))}
      </div>

      {scrollable && (
        <div className="mt-6 flex items-center gap-4">
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink-200/70" aria-hidden>
            <span
              className="absolute inset-y-0 rounded-full bg-brand-600 transition-[left] duration-150"
              style={{ width: `${Math.max(state.ratio * 100, 12)}%`, left: `${state.progress * (100 - Math.max(state.ratio * 100, 12))}%` }}
            />
          </div>
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => scroll(-1)} disabled={!state.prev} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-700 shadow-soft ring-1 ring-ink-100 transition hover:text-brand-700 active:scale-95 disabled:opacity-40" aria-label="Vídeos anteriores">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scroll(1)} disabled={!state.next} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-700 shadow-soft ring-1 ring-ink-100 transition hover:text-brand-700 active:scale-95 disabled:opacity-40" aria-label="Próximos vídeos">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Destaque compacto para encaixar um vídeo dentro de outra seção
 * (ex.: "Etapas para realizar seus exames").
 */
export function InlineVideoFeature({ placement, label, className }: { placement: VideoPlacement; label: string; className?: string }) {
  const list = useMemo(() => videosFor(placement), [placement])
  const [open, setOpen] = useState<number | null>(null)
  if (!list.length) return null
  const first = list[0]
  return (
    <>
      <div className={cn('group flex items-center gap-4 rounded-3xl bg-white/85 p-3 pr-5 shadow-soft ring-1 ring-white backdrop-blur transition hover:shadow-card', className)}>
        <VideoCard video={first} onOpen={() => setOpen(0)} size="sm" className="w-[84px] shrink-0 sm:w-24" />
        <button type="button" onClick={() => setOpen(0)} className="min-w-0 text-left">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">{label}</span>
          <span className="mt-1 block text-balance font-bold leading-snug text-ink-900">{first.title}</span>
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-500 transition group-hover:text-brand-700">
            <Play className="h-3.5 w-3.5 fill-current" /> {formatDuration(first.duration)}
            {list.length > 1 && <span className="text-ink-400"> · +{list.length - 1} {list.length === 2 ? 'vídeo' : 'vídeos'}</span>}
          </span>
        </button>
      </div>
      <VideoLightbox videos={list} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </>
  )
}
