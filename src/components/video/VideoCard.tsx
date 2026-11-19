import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { VIDEO_TOPICS, type LabVideo } from '@/data/videos'
import { cn } from '@/lib/utils'
import { formatDuration } from './format'

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Miniatura vertical (9:16) de um reel.
 * Só a imagem do poster é carregada; a prévia muda é baixada apenas no hover (desktop).
 */
export function VideoCard({ video, onOpen, className, size = 'md', priority }: { video: LabVideo; onOpen: () => void; className?: string; size?: 'sm' | 'md'; priority?: boolean }) {
  const previewRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)

  const start = () => {
    if (!video.preview || !canHover() || reducedMotion()) return
    setPreviewing(true)
    requestAnimationFrame(() => previewRef.current?.play().catch(() => {}))
  }
  const stop = () => {
    const el = previewRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
    }
    setPreviewReady(false)
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      className={cn(
        'group relative block aspect-[9/16] w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-[#2A1112] to-ink-900 text-left shadow-card ring-1 ring-ink-900/5 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:shadow-lift focus-visible:-translate-y-1.5',
        size === 'sm' && 'rounded-[20px]',
        className,
      )}
      aria-label={`Assistir: ${video.title} (${formatDuration(video.duration)})`}
    >
      <img
        src={video.poster}
        alt=""
        width={540}
        height={960}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn('absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]', loaded ? 'opacity-100' : 'opacity-0')}
      />
      {!loaded && <span className="absolute inset-0 animate-pulse bg-white/[0.04]" />}

      {previewing && video.preview && (
        <video
          ref={previewRef}
          src={video.preview}
          muted
          loop
          playsInline
          preload="none"
          onPlaying={() => setPreviewReady(true)}
          className={cn('absolute inset-0 h-full w-full scale-[1.06] object-cover transition-opacity duration-500', previewReady ? 'opacity-100' : 'opacity-0')}
          aria-hidden
        />
      )}

      <span className="absolute inset-0 bg-gradient-to-t from-[#1F0C0D]/90 via-[#1F0C0D]/10 to-[#1F0C0D]/30" />

      {size === 'md' && (
        <span className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white ring-1 ring-inset ring-white/20 backdrop-blur-md">{VIDEO_TOPICS[video.topic]}</span>
          <span className="tabular rounded-full bg-black/35 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-md">{formatDuration(video.duration)}</span>
        </span>
      )}

      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className={cn('absolute inset-0 rounded-full bg-white/40 opacity-0 transition-opacity group-hover:animate-ping group-hover:opacity-100', size === 'sm' && 'hidden')} />
        <span className={cn('relative grid place-items-center rounded-full bg-white/95 text-brand-600 shadow-lift transition-transform duration-300 group-hover:scale-110', size === 'md' ? 'h-14 w-14' : 'h-10 w-10')}>
          <Play className={cn('ml-0.5 fill-current', size === 'md' ? 'h-5 w-5' : 'h-4 w-4')} />
        </span>
      </span>

      {size === 'md' && (
        <span className="absolute inset-x-4 bottom-4">
          <span className="display line-clamp-2 block text-balance text-[1.3rem] font-medium leading-[1.15] text-white">{video.title}</span>
          <span className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-peach-200 transition-colors group-hover:text-white">
            Assistir agora
            <span className="h-px w-5 bg-current transition-all duration-300 group-hover:w-8" />
          </span>
        </span>
      )}
    </button>
  )
}
