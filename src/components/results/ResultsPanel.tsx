import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, FileCheck2, FlaskConical, Lock, ShieldCheck, Smartphone, Timer } from 'lucide-react'
import { useStore } from '@/store'
import { PixelSquares } from '@/components/ui/PixelSquares'
import { Reveal } from '@/components/ui/Reveal'
import { RESULTS_PATH } from '@/lib/routes'
import { cn } from '@/lib/utils'

const FEATURES = [
  { icon: Timer, title: 'Rápido', text: 'Consulte assim que o resultado for liberado.' },
  { icon: ShieldCheck, title: 'Seguro', text: 'Acesso pelo portal oficial do laboratório.' },
  { icon: Smartphone, title: 'Prático', text: 'No celular ou no computador.' },
]

/** Link externo para o portal oficial de resultados. */
export function ResultsLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const url = useStore((s) => s.settings.resultsUrl)
  return (
    <a href={url || RESULTS_PATH} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

/**
 * Painel de destaque "Resultados de Exames".
 * `home`: exibido logo no início da página inicial, com atalho para a página de instruções.
 */
export function ResultsPanel({ variant = 'home', className }: { variant?: 'home' | 'page'; className?: string }) {
  const Heading = variant === 'page' ? 'h1' : 'h2'
  return (
    <Reveal
      as="section"
      aria-labelledby={`resultados-${variant}`}
      className={cn('relative isolate overflow-hidden rounded-[32px] bg-[#1F0C0D] text-white shadow-lift sm:rounded-[40px]', className)}
    >
      {/* Fundo */}
      <div className="absolute inset-0 -z-10 bg-noise opacity-50" />
      <div className="absolute -left-32 -top-40 -z-10 h-[460px] w-[460px] rounded-full bg-brand-700/45 blur-3xl" />
      <div className="absolute -bottom-48 right-0 -z-10 h-[420px] w-[420px] rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_75%_50%,#000_10%,transparent_65%)]" />
      <PixelSquares tone="white" className="absolute -right-3 -top-3 -z-10 h-28 w-28 opacity-10" />

      <div className="grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:p-14">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand ring-1 ring-inset ring-white/20 sm:h-16 sm:w-16">
              <FileCheck2 className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.6} />
              <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-brand-700 shadow-soft">
                <Lock className="h-3 w-3" strokeWidth={2.5} />
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-peach-200 ring-1 ring-inset ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-peach-200 shadow-[0_0_0_3px_rgba(255,213,191,.18)]" />
              Área do paciente
            </span>
          </div>

          <Heading id={`resultados-${variant}`} className="display mt-6 text-balance text-[2.5rem] font-medium leading-[1.02] text-white sm:text-5xl lg:text-[3.6rem]">
            Resultados de <em className="font-normal italic text-peach-200">Exames</em>
          </Heading>
          <p className="mt-4 max-w-md text-pretty text-[16.5px] leading-relaxed text-brand-100/80 sm:text-lg">Consulte seus resultados de exames de forma rápida, segura e prática.</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ResultsLink className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-white px-7 text-[15.5px] font-bold text-brand-700 shadow-[0_18px_40px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:bg-peach-50 active:scale-[0.97]">
              <FileCheck2 className="h-5 w-5" strokeWidth={2} />
              Acessar meus resultados
              <ArrowUpRight className="h-4 w-4 text-brand-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </ResultsLink>
            {variant === 'home' && (
              <Link to={RESULTS_PATH} className="inline-flex h-14 items-center justify-center rounded-2xl px-5 text-[14.5px] font-semibold text-white/85 ring-1 ring-inset ring-white/15 transition hover:bg-white/[0.06] hover:text-white">
                Como consultar
              </Link>
            )}
          </div>

          <ul className="mt-9 grid gap-4 border-t border-white/10 pt-7 sm:grid-cols-3 sm:gap-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3 sm:block">
                <Icon className="h-5 w-5 shrink-0 text-peach-200" strokeWidth={1.7} />
                <span className="sm:mt-3 sm:block">
                  <span className="block text-[14px] font-bold text-white">{title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-brand-100/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <ReportIllustration />
      </div>
    </Reveal>
  )
}

/** Ilustração de um laudo (sem dados reais), com selos de confiança. */
function ReportIllustration() {
  return (
    <div className="relative mx-auto hidden w-full max-w-[420px] py-6 sm:block" aria-hidden>
      <div className="absolute inset-x-10 inset-y-2 rotate-[-7deg] rounded-[28px] bg-white/[0.06] ring-1 ring-inset ring-white/10" />
      <div className="absolute inset-x-6 inset-y-4 rotate-[4deg] rounded-[28px] bg-brand-600/30 ring-1 ring-inset ring-white/10" />

      <div className="relative animate-float-y-slow rounded-[28px] bg-white p-6 text-ink-900 shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <FlaskConical className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">Laudo laboratorial</span>
              <span className="mt-1 block h-2.5 w-28 rounded-full bg-ink-100" />
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-peach-100 px-2.5 py-1 text-[11px] font-bold text-brand-700">
            <Check className="h-3 w-3" strokeWidth={3} /> Liberado
          </span>
        </div>

        <div className="mt-6 space-y-3.5">
          {[78, 62, 88, 54].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="h-2 w-16 shrink-0 rounded-full bg-ink-100" />
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-50">
                <span className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-200 to-brand-400" style={{ width: `${w}%` }} />
              </span>
              <span className="h-2 w-8 shrink-0 rounded-full bg-ink-100" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-dashed border-ink-200 pt-4">
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink-500">
            <Lock className="h-3.5 w-3.5 text-brand-600" /> Acesso protegido
          </span>
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className={cn('h-1.5 rounded-full', i === 0 ? 'w-5 bg-brand-600' : 'w-1.5 bg-ink-200')} />
            ))}
          </span>
        </div>
      </div>

      <span className="absolute -right-2 top-0 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-white shadow-lift ring-1 ring-inset ring-white/15 backdrop-blur-md lg:-right-6">
        <ShieldCheck className="h-4 w-4 text-peach-200" /> Portal oficial
      </span>
      <span className="absolute -left-2 bottom-1 inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-800 shadow-lift lg:-left-8">
        <Smartphone className="h-4 w-4 text-brand-600" /> Consulte de onde estiver
      </span>
    </div>
  )
}
