import { useState } from 'react'
import { CheckCircle2, Clock, Facebook, Instagram, Mail, MapPin, Phone, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { StylizedMap } from '@/components/home/Sections'
import { isValidEmail, maskPhone } from '@/lib/masks'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { telLink, whatsappLink } from '@/lib/utils'

export default function Contact() {
  useDocumentTitle('Contato')
  const s = useStore((st) => st.settings)
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: 'Dúvida sobre exames', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (f.name.trim().length < 3) er.name = 'Informe seu nome.'
    if (!isValidEmail(f.email)) er.email = 'E-mail inválido.'
    if (f.message.trim().length < 10) er.message = 'Escreva uma mensagem com pelo menos 10 caracteres.'
    setErrors(er)
    if (Object.keys(er).length) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
      toast.success('Mensagem registrada (simulação).')
    }, 800)
  }

  const channels = [
    { icon: Phone, label: 'Telefone', value: s.phone, href: telLink(s.phone) },
    { icon: WhatsAppIcon, label: 'WhatsApp', value: s.whatsapp, href: whatsappLink(s.whatsapp, 'Olá! Vim pelo site e gostaria de atendimento.'), external: true },
    { icon: Mail, label: 'E-mail', value: s.email, href: `mailto:${s.email}` },
  ]

  return (
    <>
      <PageHeader title="Fale com o Laboratório Cardoso" description="Estamos prontos para tirar suas dúvidas sobre exames, preparo, convênios e atendimento a empresas." crumbs={[{ label: 'Contato' }]} />
      <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {channels.map(({ icon: Icon, label, value, href, external }) => (
            <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="group flex items-center gap-4 rounded-[24px] border border-ink-100 bg-white p-5 transition hover:border-brand-200 hover:shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-ink-400">{label}</span>
                <span className="block break-all font-semibold text-ink-900">{value}</span>
              </span>
            </a>
          ))}
          <div className="rounded-[24px] border border-ink-100 bg-white p-5">
            <div className="flex gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="text-[14.5px]">
                <strong className="block">Unidade Central</strong>
                {s.address} – {s.district}, {s.city}/{s.state} · CEP {s.cep}
              </p>
            </div>
            <div className="mt-4 flex gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="text-[14.5px]">
                {s.hours}
                <br />
                {s.hoursSaturday}
                <span className="block text-xs text-ink-400">{s.hoursNote}</span>
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <a href={s.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink-50 px-3 text-sm font-semibold text-ink-700 hover:bg-ink-100">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a href={s.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink-50 px-3 text-sm font-semibold text-ink-700 hover:bg-ink-100">
                <Facebook className="h-4 w-4" /> Facebook
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-ink-100">
            <StylizedMap />
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" strokeWidth={1.5} />
              <h2 className="display mt-5 text-3xl font-medium">Mensagem registrada!</h2>
              <p className="mt-2 max-w-sm text-ink-500">Esta é uma simulação: nenhuma mensagem foi enviada. Para atendimento real, utilize o telefone ou o WhatsApp do laboratório.</p>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" onClick={() => (setSent(false), setF({ ...f, message: '' }))}>
                  Nova mensagem
                </Button>
                <Button href={whatsappLink(s.whatsapp)} external>
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <h2 className="text-xl font-bold">Envie uma mensagem</h2>
              <p className="-mt-2 text-sm text-ink-500">Formulário demonstrativo — os dados não são enviados nem armazenados.</p>
              <Input label="Nome" name="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="E-mail" name="email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={errors.email} required />
                <Input label="Telefone" name="phone" value={f.phone} onChange={(e) => setF({ ...f, phone: maskPhone(e.target.value) })} />
              </div>
              <Select label="Assunto" name="subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>
                {['Dúvida sobre exames', 'Preparo e coleta', 'Convênios', 'Atendimento a empresas', 'Pedidos da loja virtual', 'Outros'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
              <Textarea label="Mensagem" name="message" rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} error={errors.message} required />
              <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
                <Send className="h-4 w-4" /> Enviar mensagem
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
