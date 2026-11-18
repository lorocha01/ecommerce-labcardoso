import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react'
import { useStore } from '@/store'
import { buttonClass } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { HeroArt } from './HeroArt'

const DURATION = 8000

export function Hero() {
  const allBanners = useStore((s) => s.banners)
  const banners = useMemo(() => allBanners.filter((b) => b.active).sort((a, b) => a.order - b.order), [allBanners])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = banners[Math.min(index, banners.length - 1)]

  useEffect(() => {
    if (banners.length < 2 || paused) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % banners.length), DURATION)
    return () => clearTimeout(t)
  }, [index, banners.length, paused])

  useEffect(() => {
    if (index >= banners.length) setIndex(0)
  }, [banners.length, index])

  if (!current) return null
  const go = (d: number) => setIndex((i) => (i + d + banners.length) % banners.length)
  const isExternal = (l: string) => /^https?:/.test(l)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-canvas to-canvas" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carrossel" aria-label="Destaques">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_70%_30%,#000_20%,transparent_70%)]" />
      <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-peach-200/50 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />

      <div className="container relative grid items-center gap-10 pb-14 pt-8 sm:pt-12 lg:min-h-[620px] lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-20 lg:pt-14">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className="relative z-10 order-1">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 text-[12.5px] font-semibold text-ink-700 shadow-soft ring-1 ring-ink-100">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              {current.eyebrow}
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="display mt-6 text-balance text-[2.6rem] font-medium leading-[1.02] text-ink-900 sm:text-6xl lg:text-[4.1rem]">
              {current.title} <em className="font-normal italic text-brand-600">{current.highlight}</em>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }} className="mt-6 max-w-xl text-pretty text-[16.5px] leading-relaxed text-ink-600 sm:text-lg">
              {current.subtitle}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
              {current.primaryText &&
                (isExternal(current.primaryLink) ? (
                  <a href={current.primaryLink} target="_blank" rel="noopener noreferrer" className={buttonClass('primary', 'lg')}>
                    {current.primaryText} <ArrowRight className="arrow h-4 w-4" />
                  </a>
                ) : (
                  <Link to={current.primaryLink || '/exames'} className={buttonClass('primary', 'lg')}>
                    {current.primaryText} <ArrowRight className="arrow h-4 w-4" />
                  </Link>
                ))}
              {current.secondaryText && (
                <Link to={current.secondaryLink || '/sobre'} className={buttonClass('secondary', 'lg')}>
                  {current.secondaryText}
                </Link>
              )}
            </motion.div>
            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-8 flex flex-wrap gap-x-6 sm:mt-10 gap-y-3 text-[13px] font-medium text-ink-600">
              <li className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-600" /> Compra 100% simulada e segura
              </li>
              <li className="inline-flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-brand-600" /> Atendimento humanizado
              </li>
            </motion.ul>
          </motion.div>
        </AnimatePresence>

        <div className="relative order-2 mx-auto w-full max-w-[380px] px-4 sm:max-w-[460px] sm:px-10 lg:max-w-none lg:px-0">
          <AnimatePresence mode="wait">
            <motion.div key={current.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <HeroArt banner={current} />
            </motion.div>
          </AnimatePresence>
        </div>

        {banners.length > 1 && (
          <div className="order-3 flex items-center gap-4 lg:col-span-2">
            <div className="flex flex-1 gap-2">
              {banners.map((b, i) => (
                <button key={b.id} type="button" onClick={() => setIndex(i)} className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink-200/70 sm:max-w-24" aria-label={`Ir para destaque ${i + 1}`} aria-current={i === index}>
                  {i === index && (
                    <motion.span
                      key={`${b.id}-${paused}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-brand-600"
                      initial={{ width: paused ? '100%' : '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: paused ? 0 : DURATION / 1000, ease: 'linear' }}
                    />
                  )}
                  {i < index && <span className="absolute inset-0 bg-brand-300" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} className={cn('grid h-11 w-11 place-items-center rounded-full bg-white text-ink-700 shadow-soft ring-1 ring-ink-100 transition hover:text-brand-700 active:scale-95')} aria-label="Destaque anterior">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-700 shadow-soft ring-1 ring-ink-100 transition hover:text-brand-700 active:scale-95" aria-label="Próximo destaque">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
