import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import type { LabVideo } from '@/data/videos'
import { cn } from '@/lib/utils'
import { formatDuration } from './format'

/** Preferência de som compartilhada entre os vídeos durante a visita. */
let preferMuted = false

type Props = {
  video: LabVideo
  autoPlay?: boolean
  className?: string
  onEnded?: () => void
}

/**
 * Player de vídeo com controles próprios, no visual da marca.
 * O arquivo só começa a ser baixado quando o player é montado (dentro do lightbox).
 */
export function VideoPlayer({ video, autoPlay = true, className, onEnded }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimer = useRef<number>()
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(preferMuted)
  const [buffering, setBuffering] = useState(autoPlay)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(video.duration || 0)
  const [buffered, setBuffered] = useState(0)
  const [controls, setControls] = useState(true)
  const [flash, setFlash] = useState<{ kind: 'play' | 'pause'; n: number } | null>(null)
  const [soundHint, setSoundHint] = useState(false)

  const showControls = useCallback(() => {
    setControls(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setControls(false), 2600)
  }, [])

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  // Reinicia ao trocar de vídeo e tenta tocar com som (gesto do usuário abriu o player).
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    setTime(0)
    setEnded(false)
    setDuration(video.duration || 0)
    setBuffered(0)
    if (!autoPlay) return
    el.muted = preferMuted
    setMuted(preferMuted)
    el.play().catch(() => {
      // Navegador bloqueou autoplay com som: toca mudo e sugere ativar o som.
      el.muted = true
      setMuted(true)
      setSoundHint(true)
      el.play().catch(() => setBuffering(false))
    })
    showControls()
  }, [video.id, video.duration, autoPlay, showControls])

  const toggle = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (el.paused || el.ended) {
      void el.play()
      setFlash((f) => ({ kind: 'play', n: (f?.n ?? 0) + 1 }))
    } else {
      el.pause()
      setFlash((f) => ({ kind: 'pause', n: (f?.n ?? 0) + 1 }))
    }
    showControls()
  }, [showControls])

  const toggleMute = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
    preferMuted = el.muted
    setMuted(el.muted)
    setSoundHint(false)
    showControls()
  }, [showControls])

  const fullscreen = useCallback(() => {
    const el = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    const wrap = wrapRef.current
    if (!el || !wrap) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else if (wrap.requestFullscreen) void wrap.requestFullscreen()
    else el.webkitEnterFullscreen?.()
  }, [])

  const seekBy = useCallback((s: number) => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + s))
    showControls()
  }, [showControls])

  // Atalhos: espaço/K play-pause · M som · F tela cheia · J/L ±5s
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t?.closest('input, textarea, select, [contenteditable]')) return
      const k = e.key.toLowerCase()
      if (k === ' ' || k === 'k') {
        e.preventDefault()
        toggle()
      } else if (k === 'm') toggleMute()
      else if (k === 'f') fullscreen()
      else if (k === 'j') seekBy(-5)
      else if (k === 'l') seekBy(5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, toggleMute, fullscreen, seekBy])

  const seekFromPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = videoRef.current
    if (!el || !el.duration) return
    const r = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    el.currentTime = ratio * el.duration
    setTime(el.currentTime)
  }

  const pct = duration ? (time / duration) * 100 : 0
  const visible = controls || !playing

  return (
    <div
      ref={wrapRef}
      className={cn('group/player relative isolate overflow-hidden bg-black', className)}
      onPointerMove={showControls}
      onPointerDown={showControls}
    >
      <video
        ref={videoRef}
        src={video.src}
        poster={video.poster}
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover [&:fullscreen]:object-contain"
        onClick={toggle}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onProgress={(e) => {
          const el = e.currentTarget
          if (el.buffered.length && el.duration) setBuffered((el.buffered.end(el.buffered.length - 1) / el.duration) * 100)
        }}
        onEnded={() => {
          setEnded(true)
          setPlaying(false)
          onEnded?.()
        }}
        aria-label={video.title}
      />

      {/* Gradientes para legibilidade dos controles */}
      <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')} />

      {/* Indicador central de play/pause */}
      <AnimatePresence>
        {flash && (
          <motion.span
            key={flash.n}
            initial={{ opacity: 0.9, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.25 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => setFlash(null)}
            className="pointer-events-none absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
          >
            {flash.kind === 'play' ? <Play className="ml-1 h-8 w-8 fill-current" /> : <Pause className="h-8 w-8 fill-current" />}
          </motion.span>
        )}
      </AnimatePresence>

      {buffering && !ended && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90">
          <Loader2 className="h-10 w-10 animate-spin" />
        </span>
      )}

      {!playing && !buffering && (
        <button
          type="button"
          onClick={toggle}
          className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-600 shadow-lift transition hover:scale-105 active:scale-95"
          aria-label={ended ? 'Assistir novamente' : 'Reproduzir'}
        >
          {ended ? <RotateCcw className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8 fill-current" />}
        </button>
      )}

      {soundHint && muted && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute left-1/2 top-4 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[13px] font-semibold text-ink-900 shadow-lift transition hover:bg-white"
        >
          <VolumeX className="h-4 w-4 text-brand-600" /> Toque para ativar o som
        </button>
      )}

      {/* Barra de controles */}
      <div className={cn('absolute inset-x-0 bottom-0 px-4 pb-4 pt-8 transition-all duration-300 sm:px-5', visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0')}>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Progresso do vídeo"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatDuration(time)} de ${formatDuration(duration)}`}
          className="group/bar relative flex h-5 cursor-pointer touch-none items-center"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            seekFromPointer(e)
          }}
          onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && seekFromPointer(e)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.preventDefault()
              e.stopPropagation()
              seekBy(e.key === 'ArrowRight' ? 5 : -5)
            }
          }}
        >
          <span className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/bar:h-1.5">
            <span className="absolute inset-y-0 left-0 rounded-full bg-white/35" style={{ width: `${buffered}%` }} />
            <span className="absolute inset-y-0 left-0 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
          </span>
          <span className="absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-soft ring-2 ring-brand-500 transition-transform group-hover/bar:scale-110" style={{ left: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center gap-1 text-white">
          <button type="button" onClick={toggle} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/15" aria-label={playing ? 'Pausar' : 'Reproduzir'}>
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
          </button>
          <button type="button" onClick={toggleMute} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/15" aria-label={muted ? 'Ativar som' : 'Silenciar'}>
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <span className="tabular ml-1 text-[12.5px] font-semibold text-white/85">
            {formatDuration(time)} <span className="text-white/45">/ {formatDuration(duration)}</span>
          </span>
          <button type="button" onClick={fullscreen} className="ml-auto grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/15" aria-label="Tela cheia">
            <Maximize2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
