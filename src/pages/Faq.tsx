import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { faq, faqGroups, type FaqItem } from '@/data/faq'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn, normalize, whatsappLink } from '@/lib/utils'

export default function Faq() {
  useDocumentTitle('Perguntas frequentes')
  const s = useStore((st) => st.settings)
  const [group, setGroup] = useState<FaqItem['group'] | 'all'>('all')
  const [q, setQ] = useState('')
  const items = useMemo(() => faq.filter((f) => (group === 'all' || f.group === group) && (!q || normalize(f.q + f.a).includes(normalize(q)))), [group, q])
  return (
    <>
      <PageHeader title="Perguntas frequentes" description="Tire suas dúvidas sobre compra, preparo, coleta e resultados." crumbs={[{ label: 'Perguntas frequentes' }]}>
        <div className="mt-6 max-w-xl">
          <label className="flex h-12 items-center gap-3 rounded-2xl bg-white px-4 shadow-soft ring-1 ring-ink-100 focus-within:ring-2 focus-within:ring-brand-500/60">
            <Search className="h-4 w-4 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar uma dúvida…" className="h-full flex-1 bg-transparent text-[15px] focus:outline-none" aria-label="Buscar dúvidas" />
          </label>
        </div>
      </PageHeader>
      <div className="container grid gap-8 py-12 lg:grid-cols-[240px_1fr]">
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none lg:mx-0 lg:flex-col lg:px-0" aria-label="Categorias de dúvidas">
          {(['all', ...Object.keys(faqGroups)] as (FaqItem['group'] | 'all')[]).map((g) => (
            <button key={g} type="button" onClick={() => setGroup(g)} className={cn('shrink-0 rounded-xl px-4 py-2.5 text-left text-[14px] font-semibold transition', group === g ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-100 hover:bg-ink-50')}>
              {g === 'all' ? 'Todas' : faqGroups[g]}
            </button>
          ))}
        </nav>
        <div>
          {items.length ? <Accordion key={group + q} items={items} defaultOpen={0} /> : <p className="card p-8 text-center text-ink-500">Nenhuma pergunta encontrada para “{q}”.</p>}
          <div className="mt-8 flex flex-col items-start gap-4 rounded-[28px] bg-gradient-to-br from-peach-100 to-peach-50 p-6 ring-1 ring-inset ring-peach-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">Não encontrou sua resposta?</p>
              <p className="text-sm text-ink-600">Nossa equipe responde pelo WhatsApp.</p>
            </div>
            <Button href={whatsappLink(s.whatsapp, 'Olá! Tenho uma dúvida.')} external>
              <WhatsAppIcon className="h-4 w-4" /> Falar com a equipe
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
