import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Eye, Heart, HeartHandshake, Microscope, ShieldCheck, Sparkles, Tractor, Users } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { buttonClass } from '@/components/ui/Button'
import { PixelSquares } from '@/components/ui/PixelSquares'
import { LocationSection } from '@/components/home/Sections'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function About() {
  useDocumentTitle('Sobre o laboratório')
  const s = useStore((st) => st.settings)
  const years = new Date().getFullYear() - s.since
  const values = [
    { icon: Heart, title: 'Dedicação', text: 'Cuidar de cada paciente com atenção, como cuidamos da nossa própria família.' },
    { icon: ShieldCheck, title: 'Confiança', text: 'Construída ao longo de décadas de relacionamento com a comunidade.' },
    { icon: Users, title: 'Proximidade', text: 'Atendimento humanizado e acolhedor, perto de você.' },
    { icon: Microscope, title: 'Tecnologia', text: 'Tradição aliada à atualização constante das análises clínicas.' },
  ]
  return (
    <>
      <PageHeader eyebrow="Institucional" title={<>Dedicação e confiança <em className="italic text-brand-600">desde {s.since}.</em></>} description={s.tagline + '.'} crumbs={[{ label: 'Sobre o laboratório' }]} />

      <section className="container py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Nossa história</span>
            <h2 className="display mt-4 text-4xl font-medium leading-[1.05] sm:text-5xl">Uma trajetória de {years} anos cuidando do que realmente importa.</h2>
            <div className="prose-lab mt-6">
              <p>{s.about}</p>
              <p>
                Ao longo de mais de cinco décadas, o laboratório se consolidou como referência em análises clínicas em {s.city} e região, mantendo o compromisso que marca sua história: cuidar de você e da sua família, com a dedicação de sempre.
              </p>
              <p className="text-sm text-ink-400">Texto institucional baseado na comunicação pública do laboratório. Detalhes históricos adicionais podem ser incluídos pelo painel administrativo.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="relative">
            <PixelSquares className="absolute -left-6 -top-6 h-24 w-24" />
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-brand-600 to-brand-900 p-10 text-white shadow-lift">
              <div className="absolute inset-0 bg-noise opacity-60 mix-blend-overlay" />
              <img src={s.logoWhiteUrl} alt={s.storeName} className="relative h-16 w-auto" />
              <div className="relative mt-16 grid grid-cols-2 gap-6">
                <div>
                  <span className="display tabular block text-6xl font-medium">{s.since}</span>
                  <span className="text-sm text-brand-100">ano de fundação</span>
                </div>
                <div>
                  <span className="display tabular block text-6xl font-medium">{years}</span>
                  <span className="text-sm text-brand-100">anos de história</span>
                </div>
              </div>
              <p className="display relative mt-10 text-2xl italic text-peach-200">“Cuidando daquilo que realmente importa.”</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="container grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-[32px] border border-ink-100 bg-canvas p-8 sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="display mt-6 text-3xl font-medium">Missão</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-600">{s.mission}</p>
          </Reveal>
          <Reveal delay={0.08} className="rounded-[32px] border border-ink-100 bg-canvas p-8 sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-900 text-white">
              <Eye className="h-5 w-5" />
            </span>
            <h2 className="display mt-6 text-3xl font-medium">Compromisso com os pacientes</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-600">Oferecer um atendimento humanizado, com informações claras sobre cada exame, orientação de preparo e respeito à privacidade de cada paciente — do campo até a cidade.</p>
          </Reveal>
        </div>
        <div className="container mt-16">
          <Reveal>
            <span className="eyebrow">Valores</span>
            <h2 className="display mt-3 text-4xl font-medium">O que nos guia</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.06} className="rounded-[28px] border border-ink-100 p-6">
                <Icon className="h-6 w-6 text-brand-600" strokeWidth={1.8} />
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-1">
            <span className="eyebrow">Estrutura e tecnologia</span>
            <h2 className="display mt-3 text-4xl font-medium leading-[1.05]">Tradição e tecnologia perto de você.</h2>
            <p className="mt-4 text-ink-500">Uma estrutura preparada para atender pacientes particulares, convênios e empresas da região.</p>
          </Reveal>
          {[
            { icon: HeartHandshake, title: 'Atendimento ao paciente', text: 'Coleta realizada por profissionais capacitados, com orientação sobre o preparo de cada exame.' },
            { icon: Building2, title: 'Empresas e indústrias', text: 'Análises clínicas para rotinas admissionais, demissionais e preventivas.' },
            { icon: Tractor, title: 'Do campo até a cidade', text: 'Atendimento a fazendas e trabalhadores rurais de Pedregulho e região.' },
            { icon: ShieldCheck, title: 'Convênios', text: `Atendimento a convênios como ${s.insurances.slice(0, 4).join(', ')} e outros. Consulte a cobertura.` },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.05} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-ink-100">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-peach-100 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-500">{text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex flex-wrap gap-3">
          <Link to="/exames" className={buttonClass('primary', 'lg')}>
            Confira nossos exames <ArrowRight className="arrow h-4 w-4" />
          </Link>
          <Link to="/contato" className={buttonClass('secondary', 'lg')}>
            Fale conosco
          </Link>
        </Reveal>
      </section>

      <LocationSection />
    </>
  )
}
