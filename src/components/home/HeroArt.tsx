import { motion } from 'framer-motion'
import { CalendarCheck, Check, ClipboardList, Clock, FlaskConical, HeartHandshake, MapPin, ShieldCheck } from 'lucide-react'
import type { Banner } from '@/types'
import { useStore } from '@/store'
import { PixelSquares } from '@/components/ui/PixelSquares'

const float = (delay = 0, distance = 8) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration: 6 + delay, repeat: Infinity, ease: 'easeInOut' as const, delay },
})

function Chip({ icon: Icon, title, text, className, delay = 0 }: { icon: typeof Clock; title: string; text: string; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35 + delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute z-20 ${className}`}
    >
      <motion.div {...float(delay * 2, 6)} className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 pr-4 shadow-lift ring-1 ring-ink-100 backdrop-blur">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="leading-tight">
          <span className="block text-[13px] font-bold text-ink-900">{title}</span>
          <span className="block text-[11.5px] text-ink-500">{text}</span>
        </span>
      </motion.div>
    </motion.div>
  )
}

/** Ilustração vetorial de tubos de ensaio — sem dependência de imagens externas. */
function TubesIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="glass" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#fff" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id="liq1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD5BF" />
          <stop offset="1" stopColor="#FDBB98" />
        </linearGradient>
        <linearGradient id="liq2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#FBE4E2" />
        </linearGradient>
        <linearGradient id="liq3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7E7C6" />
          <stop offset="1" stopColor="#EBCF96" />
        </linearGradient>
      </defs>
      {/* rack */}
      <rect x="62" y="248" width="276" height="22" rx="8" fill="#fff" fillOpacity=".22" />
      <rect x="72" y="312" width="256" height="16" rx="7" fill="#fff" fillOpacity=".16" />
      <rect x="84" y="262" width="8" height="66" rx="3" fill="#fff" fillOpacity=".2" />
      <rect x="308" y="262" width="8" height="66" rx="3" fill="#fff" fillOpacity=".2" />
      {[
        { x: 112, h: 190, fill: 'url(#liq1)', level: 0.5, cap: '#FFD5BF' },
        { x: 182, h: 220, fill: 'url(#liq2)', level: 0.58, cap: '#ffffff' },
        { x: 252, h: 175, fill: 'url(#liq3)', level: 0.45, cap: '#F7E7C6' },
      ].map((t, i) => {
        const top = 300 - t.h
        const liqTop = 300 - t.h * t.level
        return (
          <g key={i}>
            <rect x={t.x - 4} y={top - 18} width="44" height="22" rx="7" fill={t.cap} />
            <path d={`M${t.x} ${top} h36 v${t.h - 18} a18 18 0 0 1 -36 0z`} fill="url(#glass)" stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
            <path d={`M${t.x + 3} ${liqTop} h30 v${300 - liqTop - 18} a15 15 0 0 1 -30 0z`} fill={t.fill} />
            <rect x={t.x + 8} y={top + 12} width="5" height={t.h - 50} rx="2.5" fill="#fff" fillOpacity=".45" />
          </g>
        )
      })}
      {/* bolhas */}
      <circle cx="200" cy="140" r="5" fill="#fff" fillOpacity=".6" />
      <circle cx="132" cy="196" r="3.5" fill="#fff" fillOpacity=".55" />
      <circle cx="270" cy="204" r="4" fill="#fff" fillOpacity=".5" />
    </svg>
  )
}

function FieldToCity() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <circle cx="292" cy="112" r="38" fill="#FFD5BF" fillOpacity=".9" />
      <rect x="0" y="0" width="400" height="400" fill="url(#sky)" />
      {/* cidade */}
      <g fill="#fff" fillOpacity=".22">
        <rect x="214" y="188" width="34" height="96" rx="4" />
        <rect x="254" y="160" width="40" height="124" rx="4" />
        <rect x="300" y="200" width="30" height="84" rx="4" />
        <rect x="336" y="176" width="36" height="108" rx="4" />
      </g>
      {/* igreja estilizada */}
      <g fill="#fff" fillOpacity=".32">
        <rect x="150" y="196" width="46" height="88" rx="3" />
        <path d="M150 196 l23 -26 l23 26z" />
        <rect x="166" y="132" width="14" height="44" rx="2" />
        <path d="M166 132 l7 -14 l7 14z" />
      </g>
      {/* campo */}
      <path d="M0 290 C 90 262, 170 300, 400 270 L400 400 L0 400z" fill="#fff" fillOpacity=".14" />
      <path d="M0 320 C 120 292, 220 336, 400 304 L400 400 L0 400z" fill="#fff" fillOpacity=".18" />
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M${-20 + i * 50} 400 C ${10 + i * 50} 360, ${30 + i * 48} 340, ${60 + i * 46} 322`} stroke="#FFD5BF" strokeOpacity=".5" strokeWidth="2" fill="none" />
      ))}
    </svg>
  )
}

export function HeroArt({ banner }: { banner: Banner }) {
  const settings = useStore((s) => s.settings)
  const years = new Date().getFullYear() - settings.since

  if (banner.imageUrl) {
    return (
      <div className="relative mx-auto aspect-[5/4] w-full max-w-xl">
        <div className="absolute inset-0 overflow-hidden rounded-[36px] shadow-lift">
          <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <PixelSquares className="absolute -left-6 -top-6 h-20 w-20" />
        <Chip icon={ShieldCheck} title={`Desde ${settings.since}`} text={`${years} anos cuidando de você`} className="-bottom-5 left-4 sm:-left-6" />
      </div>
    )
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <PixelSquares className="absolute -left-4 -top-2 z-10 h-20 w-20 sm:-left-8 sm:h-24 sm:w-24" />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-[6%] overflow-hidden rounded-[44px] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-900 shadow-[0_40px_80px_-30px_rgba(124,22,27,.6)]"
      >
        <div className="absolute inset-0 bg-noise opacity-70 mix-blend-overlay" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_100%,rgba(255,213,191,.35),transparent_55%)]" />
        {banner.art === 'family' ? (
          <FieldToCity />
        ) : banner.art === 'checkup' ? (
          <div className="absolute inset-0 grid place-items-center p-[12%]">
            <motion.div {...float(0, 6)} className="w-full max-w-[290px] rounded-3xl bg-white p-5 shadow-lift">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-ink-900">
                  <ClipboardList className="h-4 w-4 text-brand-600" /> Check-up Essencial
                </span>
                <span className="rounded-full bg-peach-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">6 exames</span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {['Hemograma completo', 'Glicemia de jejum', 'Colesterol e frações', 'Triglicérides', 'Ureia e creatinina', 'Urina tipo I'].map((e, i) => (
                  <motion.li key={e} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} className="flex items-center gap-2.5 text-[13px] text-ink-700">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-50 text-emerald-600">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {e}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-4 flex items-end justify-between border-t border-dashed border-ink-200 pt-3">
                <span className="text-[11px] text-ink-500">Valor demonstrativo</span>
                <span className="tabular text-lg font-extrabold text-ink-900">R$ 119,90</span>
              </div>
            </motion.div>
          </div>
        ) : banner.art === 'heritage' ? (
          <div className="absolute inset-0 grid place-items-center">
            <span className="display text-[9rem] font-semibold italic leading-none text-white/90 sm:text-[11rem]">{settings.since}</span>
          </div>
        ) : (
          <div className="absolute inset-x-[8%] bottom-0 top-[6%]">
            <TubesIllustration />
          </div>
        )}
      </motion.div>

      <Chip icon={HeartHandshake} title={`Desde ${settings.since}`} text={`${years} anos de dedicação`} className={banner.art === 'checkup' ? '-left-2 top-[2%] sm:-left-10' : 'left-0 top-[16%] sm:-left-6'} delay={0} />
      {banner.art === 'family' ? (
        <Chip icon={MapPin} title={`${settings.city}/${settings.state}`} text="Do campo até a cidade" className="bottom-[10%] right-0 sm:-right-4" delay={0.15} />
      ) : banner.art === 'checkup' ? (
        <Chip icon={CalendarCheck} title="Uma visita" text="Coleta de todos os exames" className="bottom-[8%] right-0 sm:-right-4" delay={0.15} />
      ) : (
        <Chip icon={FlaskConical} title="Preparo explicado" text="Orientações em cada exame" className="bottom-[10%] right-0 sm:-right-6" delay={0.15} />
      )}
      <Chip icon={Clock} title="Prazos estimados" text="Informados por exame" className="bottom-[-2%] left-[10%] hidden sm:block" delay={0.3} />
    </div>
  )
}
