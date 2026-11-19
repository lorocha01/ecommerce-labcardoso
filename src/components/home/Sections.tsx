import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  FlaskConical,
  HeartHandshake,
  Mail,
  MapPin,
  Microscope,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Tractor,
  Users,
} from 'lucide-react'
import { useStore } from '@/store'
import { usePublicCategories, usePublicProducts } from '@/store/hooks'
import { faq } from '@/data/faq'
import { Accordion } from '@/components/ui/Accordion'
import { buttonClass } from '@/components/ui/Button'
import { DynamicIcon } from '@/components/ui/Icon'
import { PixelSquares } from '@/components/ui/PixelSquares'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { ProductCard } from '@/components/product/ProductCard'
import { TONES } from '@/components/product/ProductArt'
import { InlineVideoFeature } from '@/components/video/VideoShowcase'
import { cn, telLink, whatsappLink } from '@/lib/utils'
import { shopUrl } from '@/lib/routes'

/* ───────────────────────────── Faixa de confiança */
export function TrustStrip() {
  const s = useStore((st) => st.settings)
  const items = [
    { icon: HeartHandshake, title: `Desde ${s.since}`, text: 'Tradição em análises clínicas' },
    { icon: FlaskConical, title: 'Preparo detalhado', text: 'Orientações em cada exame' },
    { icon: CreditCard, title: 'PIX, cartão ou presencial', text: 'Pagamento simulado' },
    { icon: MapPin, title: `${s.city}/${s.state}`, text: `${s.address}` },
  ]
  return (
    <section className="relative z-10 -mt-2">
      <div className="container">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink-100 bg-ink-100 shadow-soft lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.05} className="flex flex-col items-start gap-2.5 bg-white p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
              <span className="grid h-10 w-10 shrink-0 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-peach-100 text-brand-700">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold leading-snug text-ink-900 sm:text-sm">{title}</span>
                <span className="line-clamp-2 block text-[12px] leading-snug text-ink-500 sm:text-[13px]">{text}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Categorias */
export function CategoriesSection() {
  const categories = usePublicCategories()
  const products = usePublicProducts()
  const title = useStore((s) => s.settings.homeCategoriesTitle)
  return (
    <section className="py-20 lg:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Categorias"
          title={title}
          description="Navegue pelos principais grupos de exames e encontre rapidamente o que o seu médico solicitou."
          action={
            <Link to="/exames" className={buttonClass('secondary', 'md')}>
              Comprar exames <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((c, i) => {
            const count = products.filter((p) => p.categoryId === c.id).length
            const tone = TONES[c.tone] ?? TONES.red
            const featured = i === 0
            return (
              <Reveal key={c.id} delay={(i % 5) * 0.05} className={cn(featured && 'col-span-2 row-span-2 sm:col-span-1 lg:col-span-1')}>
                <Link
                  to={shopUrl(c.slug)}
                  className={cn(
                    'group relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-card sm:p-5',
                    featured ? 'min-h-[220px] border-transparent bg-gradient-to-br text-white sm:min-h-0 ' + tone.bg : 'min-h-[150px] border-ink-100 bg-white',
                  )}
                >
                  {featured && <PixelSquares tone="white" className="absolute -right-4 -top-4 h-24 w-24 opacity-20" />}
                  <span className={cn('grid h-12 w-12 place-items-center rounded-2xl transition-all duration-300 group-hover:scale-110', featured ? 'bg-white/15 text-white ring-1 ring-inset ring-white/25' : 'bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white')}>
                    <DynamicIcon name={c.icon} className="h-6 w-6" />
                  </span>
                  <span className="mt-6 block">
                    <span className={cn('block text-[15px] font-bold leading-tight sm:text-base', featured ? 'text-white' : 'text-ink-900')}>{c.name}</span>
                    <span className={cn('mt-1 flex items-center justify-between text-[12.5px]', featured ? 'text-white/75' : 'text-ink-500')}>
                      {count} {count === 1 ? 'exame' : 'exames'}
                      <ArrowUpRight className={cn('h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5', featured ? 'text-white' : 'text-brand-600')} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Destaques */
export function FeaturedSection() {
  const products = usePublicProducts()
  const s = useStore((st) => st.settings)
  const featured = products.filter((p) => p.featured).slice(0, 8)
  if (!featured.length) return null
  return (
    <section className="relative py-20 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white to-canvas" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Em destaque"
          title={s.homeFeaturedTitle}
          description={s.homeFeaturedSubtitle}
          action={
            <Link to="/exames" className={buttonClass('primary', 'md')}>
              Confira nossos exames <ArrowRight className="arrow h-4 w-4" />
            </Link>
          }
        />
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {featured.map((p) => (
            <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <ProductCard product={p} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Diferenciais */
export function Differentials() {
  const s = useStore((st) => st.settings)
  const years = new Date().getFullYear() - s.since
  const items = [
    { icon: HeartHandshake, title: 'Tradição e experiência', text: `Há ${years} anos cuidando da saúde das famílias de ${s.city} e região, com a dedicação de sempre.` },
    { icon: Users, title: 'Atendimento humanizado', text: 'Uma equipe próxima, que conhece os pacientes pelo nome e acolhe cada pessoa com atenção.' },
    { icon: ShieldCheck, title: 'Qualidade nos serviços', text: 'Processos cuidadosos em todas as etapas, da coleta à liberação do resultado.' },
    { icon: Microscope, title: 'Tecnologia laboratorial', text: 'Tradição e tecnologia perto de você: estrutura de análises clínicas atualizada.' },
    { icon: Stethoscope, title: 'Compromisso com a saúde', text: 'Cuidar daquilo que realmente importa: o bem-estar e a qualidade de vida de quem confia em nós.' },
  ]
  return (
    <section className="relative overflow-hidden bg-[#1F0C0D] py-20 text-white lg:py-28">
      <div className="absolute inset-0 bg-noise opacity-50" />
      <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-brand-700/40 blur-3xl" />
      <PixelSquares tone="white" className="absolute right-10 top-12 h-28 w-28 opacity-10" />
      <div className="container relative grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <Reveal>
          <span className="eyebrow text-peach-200">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-peach-200" />
            Por que o Cardoso
          </span>
          <h2 className="display mt-4 text-balance text-4xl font-medium leading-[1.05] text-white sm:text-5xl">
            Dedicação e confiança <em className="italic text-peach-200">desde {s.since}.</em>
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-brand-100/75">{s.about}</p>
          <div className="mt-8 flex items-end gap-6">
            <div>
              <span className="display tabular block text-6xl font-medium text-white">{years}</span>
              <span className="text-sm text-brand-100/70">anos de história</span>
            </div>
            <div className="h-14 w-px bg-white/15" />
            <div>
              <span className="display block text-6xl font-medium text-white">{s.since}</span>
              <span className="text-sm text-brand-100/70">ano de fundação</span>
            </div>
          </div>
          <Link to="/sobre" className={cn(buttonClass('white', 'lg'), 'mt-10')}>
            Conheça o laboratório <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06} className={cn('group rounded-3xl bg-white/[0.04] p-6 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.07]', i === 4 && 'sm:col-span-2')}>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-brand transition group-hover:scale-105">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-brand-100/70">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Como funciona a compra */
export function HowItWorks() {
  const steps = [
    { icon: Search, title: 'Escolha', text: 'Encontre os exames pelo nome, categoria ou preparo e consulte todas as informações.' },
    { icon: ShoppingBag, title: 'Adicione ao carrinho', text: 'Monte seu pedido com um ou vários exames e ajuste as quantidades.' },
    { icon: CreditCard, title: 'Finalize', text: 'Informe os dados do paciente e simule o pagamento por PIX, cartão ou presencial.' },
    { icon: FileText, title: 'Receba o protocolo', text: 'Guarde o número do pedido e apresente-o no laboratório no dia da coleta.' },
  ]
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <SectionHeading align="center" eyebrow="Como funciona" title="Comprar seus exames é simples" description="Uma experiência de compra pensada para ser rápida no celular e no computador." />
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-[52px] hidden h-px bg-[repeating-linear-gradient(90deg,#E0D9D6_0_6px,transparent_6px_12px)] lg:block" />
          {steps.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="relative rounded-3xl border border-ink-100 bg-white p-6 text-center shadow-soft">
              <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
                <Icon className="h-7 w-7" strokeWidth={1.7} />
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-extrabold text-brand-700 shadow-soft ring-1 ring-ink-100">{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Etapas para realizar os exames */
export function ExamJourney() {
  const steps = [
    { icon: ClipboardCheck, title: 'Confira o preparo', text: 'Verifique jejum, horário e orientações na página do exame. Em caso de dúvida, fale conosco.' },
    { icon: CalendarCheck, title: 'Vá ao laboratório', text: 'Leve documento com foto, pedido médico (quando houver) e o número do seu pedido.' },
    { icon: FlaskConical, title: 'Coleta', text: 'Nossa equipe realiza a coleta com cuidado, conforto e material descartável.' },
    { icon: Sparkles, title: 'Resultado', text: 'Acompanhe o prazo estimado de cada exame e retire seu resultado pelos canais oficiais.' },
  ]
  return (
    <section className="pb-20 lg:pb-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-peach-100 via-peach-50 to-white p-6 ring-1 ring-inset ring-peach-200 sm:p-10 lg:p-14">
          <PixelSquares className="absolute -right-4 -top-4 h-32 w-32 opacity-20" />
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
            <Reveal>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-[2px] bg-brand-600" />
                Dia do exame
              </span>
              <h2 className="display mt-4 text-balance text-4xl font-medium leading-[1.05] sm:text-[2.75rem]">Etapas para realizar seus exames</h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-600">Depois de concluir a compra, siga estes passos. As orientações exibidas no site são demonstrativas e devem ser confirmadas com a equipe do laboratório.</p>
              <Link to="/faq" className="link mt-6 inline-flex items-center gap-1.5">
                Ver dúvidas sobre preparo <ArrowRight className="h-4 w-4" />
              </Link>
              <InlineVideoFeature placement="journey" label="Também atendemos pelo SUS" className="mt-8 max-w-md" />
            </Reveal>
            <ol className="grid gap-4 sm:grid-cols-2">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <Reveal as="li" key={title} delay={i * 0.06} className="flex gap-4 rounded-3xl bg-white/80 p-5 shadow-soft ring-1 ring-white backdrop-blur">
                  <span className="display tabular text-4xl font-medium leading-none text-brand-200">0{i + 1}</span>
                  <span>
                    <span className="flex items-center gap-2 font-bold text-ink-900">
                      <Icon className="h-4 w-4 text-brand-600" /> {title}
                    </span>
                    <span className="mt-1.5 block text-[14px] leading-relaxed text-ink-600">{text}</span>
                  </span>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Empresas / Convênios */
export function CompaniesAndInsurances() {
  const s = useStore((st) => st.settings)
  return (
    <section className="pb-20 lg:pb-28">
      <div className="container grid gap-4 lg:grid-cols-2">
        <Reveal className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-10">
          <PixelSquares tone="white" className="absolute -bottom-6 -right-6 h-36 w-36 opacity-15" />
          <div className="flex gap-2">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
              <Tractor className="h-5 w-5" />
            </span>
          </div>
          <h3 className="display mt-6 text-3xl font-medium leading-tight">Do campo até a cidade.</h3>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-brand-100">Análises clínicas para fábricas, fazendas e empresas: rotinas admissionais, demissionais e preventivas.</p>
          <a href={whatsappLink(s.whatsapp, 'Olá! Gostaria de informações sobre exames ocupacionais para empresas.')} target="_blank" rel="noopener noreferrer" className={cn(buttonClass('white', 'md'), 'mt-7')}>
            Atendimento para empresas <ArrowUpRight className="h-4 w-4" />
          </a>
        </Reveal>
        <Reveal delay={0.08} className="rounded-[32px] border border-ink-100 bg-white p-8 sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-peach-100 text-brand-700">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h3 className="display mt-6 text-3xl font-medium leading-tight">Faça exames pelo seu convênio.</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-500">Convênios divulgados nos materiais do laboratório. Confirme a cobertura do seu plano antes da coleta.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {s.insurances.map((ins) => (
              <span key={ins} className="rounded-full bg-ink-50 px-3.5 py-2 text-[13px] font-semibold text-ink-700 ring-1 ring-inset ring-ink-100">
                {ins}
              </span>
            ))}
          </div>
          <InlineVideoFeature placement="insurance" tone="subtle" className="mt-7" />
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────────── FAQ */
export function FaqSection() {
  const s = useStore((st) => st.settings)
  const items = faq.filter((f) => ['compra', 'preparo'].includes(f.group)).slice(0, 6)
  return (
    <section className="pb-20 lg:pb-28">
      <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-brand-600" />
            Perguntas frequentes
          </span>
          <h2 className="display mt-4 text-4xl font-medium leading-[1.05] sm:text-[2.75rem]">Ficou com alguma dúvida?</h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-500">Reunimos as dúvidas mais comuns sobre compra, preparo e coleta. Se preferir, fale com a nossa equipe.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/faq" className={buttonClass('dark', 'md')}>
              Todas as perguntas
            </Link>
            <a href={whatsappLink(s.whatsapp, 'Olá! Tenho uma dúvida sobre exames.')} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary', 'md')}>
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Perguntar no WhatsApp
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <Accordion items={items} />
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────────── Atendimento + localização */
export function LocationSection() {
  const s = useStore((st) => st.settings)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.address}, ${s.district}, ${s.city} - ${s.state}, ${s.cep}`)}`
  return (
    <section>
      <div className="container">
        <Reveal className="grid overflow-hidden rounded-[36px] border border-ink-100 bg-white shadow-soft lg:grid-cols-2">
          <div className="p-7 sm:p-10 lg:p-12">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-[2px] bg-brand-600" />
              Atendimento
            </span>
            <h2 className="display mt-4 text-4xl font-medium leading-[1.05]">Venha nos visitar</h2>
            <dl className="mt-8 space-y-6">
              {[
                { icon: MapPin, label: 'Endereço', value: `${s.address} – ${s.district}`, extra: `${s.city}/${s.state} · CEP ${s.cep}` },
                { icon: Clock, label: 'Horário de atendimento', value: s.hours, extra: `${s.hoursSaturday}${s.hoursNote ? ` · ${s.hoursNote}` : ''}` },
                { icon: Phone, label: 'Telefone e WhatsApp', value: `${s.phone} · ${s.whatsapp}`, extra: 'Atendimento por telefone ou mensagem' },
                { icon: Mail, label: 'E-mail', value: s.email, extra: 'Respondemos em horário comercial' },
              ].map(({ icon: Icon, label, value, extra }) => (
                <div key={label} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-400">{label}</dt>
                    <dd className="mt-1 break-words font-semibold text-ink-900">{value}</dd>
                    <dd className="text-[13.5px] text-ink-500">{extra}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('primary', 'md')}>
                <Navigation className="h-4 w-4" /> Como chegar
              </a>
              <a href={telLink(s.phone)} className={buttonClass('secondary', 'md')}>
                <Phone className="h-4 w-4" /> Ligar agora
              </a>
            </div>
          </div>
          <StylizedMap />
        </Reveal>
      </div>
    </section>
  )
}

/** Mapa ilustrativo local (sem dependência de serviços externos). */
export function StylizedMap() {
  const s = useStore((st) => st.settings)
  return (
    <div className="relative min-h-[320px] overflow-hidden bg-[#F3ECE6]">
      <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width="600" height="600" fill="#F3ECE6" />
        <g fill="#EAE0D7">
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 6 }).map((__, c) => <rect key={`${r}-${c}`} x={20 + c * 100} y={20 + r * 100} width="80" height="80" rx="10" transform={`rotate(-8 300 300)`} />),
          )}
        </g>
        <path d="M-40 380 C 120 330, 260 420, 640 300" stroke="#fff" strokeWidth="22" fill="none" />
        <path d="M220 -40 C 260 160, 300 360, 260 640" stroke="#fff" strokeWidth="16" fill="none" />
        <path d="M-20 160 L 640 120" stroke="#fff" strokeWidth="12" fill="none" />
        <path d="M420 -20 L 470 640" stroke="#fff" strokeWidth="10" fill="none" />
        <circle cx="120" cy="500" r="60" fill="#DCE8D2" />
        <circle cx="500" cy="80" r="44" fill="#DCE8D2" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.2 }} className="flex flex-col items-center">
          <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-lift">
            <p className="text-sm font-bold text-ink-900">{s.storeName}</p>
            <p className="text-xs text-ink-500">
              {s.address} · {s.city}/{s.state}
            </p>
          </div>
          <div className="h-3 w-3 -translate-y-1.5 rotate-45 bg-white" />
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white shadow-brand ring-4 ring-white">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-30" />
            <MapPin className="relative h-5 w-5" />
          </span>
        </motion.div>
      </div>
      <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-ink-500 backdrop-blur">Mapa ilustrativo</span>
    </div>
  )
}
