import { ArrowRight, FileSearch, MousePointerClick, Phone, UserRoundCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { faq } from '@/data/faq'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ResultsPanel } from '@/components/results/ResultsPanel'
import { Accordion } from '@/components/ui/Accordion'
import { Reveal } from '@/components/ui/Reveal'
import { buttonClass } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { SHOP_PATH } from '@/lib/routes'
import { telLink, whatsappLink } from '@/lib/utils'

const STEPS = [
  { icon: MousePointerClick, title: 'Abra o portal', text: 'Toque em “Acessar meus resultados” para abrir o portal oficial do Laboratório Cardoso.' },
  { icon: UserRoundCheck, title: 'Identifique-se', text: 'Informe os dados de acesso solicitados pelo portal para localizar o seu atendimento.' },
  { icon: FileSearch, title: 'Consulte o resultado', text: 'Visualize seus resultados assim que forem liberados. O prazo estimado aparece na página de cada exame.' },
]

export default function Results() {
  useDocumentTitle('Resultados de exames')
  const s = useStore((st) => st.settings)
  const items = faq.filter((f) => f.group === 'resultados')

  return (
    <>
      <div className="container pb-10 pt-6 lg:pb-14 lg:pt-8">
        <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Resultados de exames' }]} />
        <ResultsPanel variant="page" className="mt-6" />

        <section className="mt-16 lg:mt-20" aria-labelledby="como-consultar">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-[2px] bg-brand-600" />
              Passo a passo
            </span>
            <h2 id="como-consultar" className="display mt-3 text-balance text-[1.85rem] font-medium leading-[1.1] sm:text-4xl">
              Como consultar seus resultados
            </h2>
          </Reveal>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 0.07} className="relative rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
                <span className="display tabular absolute right-6 top-5 text-4xl font-medium leading-none text-brand-100">0{i + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-peach-100 text-brand-700">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">{text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-[2px] bg-brand-600" />
              Dúvidas
            </span>
            <h2 className="display mt-3 text-[1.85rem] font-medium leading-[1.1] sm:text-4xl">Precisa de ajuda para acessar?</h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-ink-500">Nossa equipe orienta você no acesso ao portal e tira dúvidas sobre prazos e retirada de resultados.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={whatsappLink(s.whatsapp, 'Olá! Preciso de ajuda para acessar o resultado dos meus exames.')} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary', 'md')}>
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Falar no WhatsApp
              </a>
              <a href={telLink(s.phone)} className={buttonClass('secondary', 'md')}>
                <Phone className="h-4 w-4" /> {s.phone}
              </a>
            </div>
            <Link to={SHOP_PATH} className="link mt-8 inline-flex items-center gap-1.5 text-sm">
              Ainda não fez seus exames? Comprar exames <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <Accordion items={items} />
          </Reveal>
        </section>
      </div>
    </>
  )
}
