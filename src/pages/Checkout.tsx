import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarCheck,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  FlaskConical,
  Info,
  Lock,
  Pencil,
  Printer,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Order, PaymentMethod } from '@/types'
import { useStore } from '@/store'
import { useCart, useCurrentUser } from '@/store/hooks'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/Badge'
import { ProductArt } from '@/components/product/ProductArt'
import { Steps } from '@/components/checkout/Steps'
import { FakeQr } from '@/components/checkout/FakeQr'
import { formatCurrency, formatDateTime, plural } from '@/lib/format'
import { isValidCPFFormat, isValidEmail, isValidPhone, maskCard, maskCEP, maskCPF, maskExpiry, maskPhone } from '@/lib/masks'
import { PAYMENT_META } from '@/lib/status'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn, onlyDigits } from '@/lib/utils'

interface PatientForm {
  name: string
  cpf: string
  birthDate: string
  email: string
  phone: string
  cep: string
  address: string
  city: string
}

const EMPTY: PatientForm = { name: '', cpf: '', birthDate: '', email: '', phone: '', cep: '', address: '', city: '' }
const FICTITIOUS: PatientForm = {
  name: 'Maria Exemplo da Silva',
  cpf: '000.000.000-00',
  birthDate: '1990-03-15',
  email: 'maria.exemplo@paciente.test',
  phone: '(16) 90000-1234',
  cep: '14470-000',
  address: 'Rua Exemplo, 123 – Centro',
  city: 'Pedregulho/SP',
}

function validate(f: PatientForm) {
  const e: Partial<Record<keyof PatientForm, string>> = {}
  if (f.name.trim().split(/\s+/).length < 2) e.name = 'Informe nome e sobrenome.'
  if (!isValidCPFFormat(f.cpf)) e.cpf = 'CPF deve ter 11 dígitos.'
  if (!f.birthDate) e.birthDate = 'Informe a data de nascimento.'
  else if (new Date(f.birthDate) > new Date()) e.birthDate = 'Data inválida.'
  if (!isValidEmail(f.email)) e.email = 'E-mail inválido.'
  if (!isValidPhone(f.phone)) e.phone = 'Telefone inválido.'
  if (onlyDigits(f.cep).length !== 8) e.cep = 'CEP deve ter 8 dígitos.'
  if (f.address.trim().length < 5) e.address = 'Informe o endereço.'
  if (f.city.trim().length < 2) e.city = 'Informe a cidade.'
  return e
}

export default function Checkout() {
  useDocumentTitle('Finalizar compra')
  const { lines, subtotal, total, count, savings } = useCart()
  const user = useCurrentUser()
  const placeOrder = useStore((s) => s.placeOrder)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PatientForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof PatientForm, string>>>({})
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '', installments: '1' })
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        email: f.email || user.email,
        phone: f.phone || user.phone,
        birthDate: f.birthDate || user.birthDate,
        cep: f.cep || user.cep,
        address: f.address || user.address,
        city: f.city || user.city,
      }))
    }
  }, [user])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const set = (k: keyof PatientForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const goReview = () => {
    const e = validate(form)
    setErrors(e)
    if (Object.keys(e).length) {
      toast.error('Confira os campos destacados.')
      document.querySelector<HTMLInputElement>(`[name="${Object.keys(e)[0]}"]`)?.focus()
      return
    }
    setStep(2)
  }

  const finish = () => {
    if (method === 'cartao') {
      const ce: Record<string, string> = {}
      if (onlyDigits(card.number).length < 16) ce.number = 'Número do cartão incompleto.'
      if (card.name.trim().length < 3) ce.name = 'Informe o nome impresso.'
      if (!/^\d{2}\/\d{2}$/.test(card.expiry) || Number(card.expiry.slice(0, 2)) > 12 || Number(card.expiry.slice(0, 2)) < 1) ce.expiry = 'Validade inválida.'
      if (onlyDigits(card.cvv).length < 3) ce.cvv = 'CVV inválido.'
      setCardErrors(ce)
      if (Object.keys(ce).length) return
    }
    if (!accepted) {
      toast.error('Confirme que está ciente de que esta é uma compra simulada.')
      return
    }
    setProcessing(true)
    setTimeout(() => {
      const res = placeOrder({
        customer: form,
        paymentMethod: method,
        paymentDetail:
          method === 'cartao'
            ? `Cartão final ${onlyDigits(card.number).slice(-4)} · ${card.installments}x (simulado)`
            : method === 'pix'
              ? 'PIX gerado (simulado)'
              : 'Pagamento no laboratório',
      })
      setProcessing(false)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setOrder(res.data)
      setStep(4)
      toast.success('Pedido simulado com sucesso!', { description: `Número ${res.data.number}` })
    }, 1400)
  }

  if (!order && lines.length === 0) {
    return (
      <div className="container py-16">
        <div className="card">
          <EmptyState icon={ShoppingBag} title="Não há exames para finalizar" description="Adicione exames ao carrinho para iniciar a finalização da compra." action={<Button to="/exames">Ver exames</Button>} />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 lg:py-12">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
            <Info className="h-3.5 w-3.5" /> Simulação — nenhum pagamento real
          </span>
          <h1 className="display mt-3 text-4xl font-medium sm:text-5xl">{step === 4 ? 'Pedido realizado' : 'Finalizar compra'}</h1>
        </div>
        <div className="lg:w-[520px] xl:w-[640px]">
          <Steps current={step === 4 ? 5 : step} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 4 && order ? (
          <Confirmation key="done" order={order} />
        ) : (
          <motion.div key="flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <StepCard key="s1" icon={UserRound} title="Dados do paciente" subtitle="Use apenas dados fictícios nesta demonstração.">
                    <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-ink-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[13.5px] text-ink-600">
                        {user ? (
                          <>
                            Dados preenchidos a partir da conta de <strong>{user.name}</strong>.
                          </>
                        ) : (
                          <>
                            Já tem conta?{' '}
                            <Link to="/minha-conta" className="link">
                              Entre
                            </Link>{' '}
                            para preencher automaticamente.
                          </>
                        )}
                      </p>
                      <Button variant="secondary" size="sm" onClick={() => (setForm(FICTITIOUS), setErrors({}))}>
                        <Wand2 className="h-4 w-4" /> Preencher com dados fictícios
                      </Button>
                    </div>
                    <form
                      className="grid gap-4 sm:grid-cols-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        goReview()
                      }}
                      noValidate
                    >
                      <Input wrapClassName="sm:col-span-2" label="Nome completo" name="name" required autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="Nome e sobrenome do paciente" />
                      <Input label="CPF" name="cpf" required inputMode="numeric" value={form.cpf} onChange={(e) => set('cpf', maskCPF(e.target.value))} error={errors.cpf} placeholder="000.000.000-00" hint="Armazenamos apenas os 2 últimos dígitos." />
                      <Input label="Data de nascimento" name="birthDate" required type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} error={errors.birthDate} max={new Date().toISOString().slice(0, 10)} />
                      <Input label="E-mail" name="email" required type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} placeholder="voce@exemplo.test" />
                      <Input label="Telefone" name="phone" required inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} error={errors.phone} placeholder="(16) 90000-0000" />
                      <Input label="CEP" name="cep" required inputMode="numeric" value={form.cep} onChange={(e) => set('cep', maskCEP(e.target.value))} error={errors.cep} placeholder="00000-000" />
                      <Input label="Cidade/UF" name="city" required value={form.city} onChange={(e) => set('city', e.target.value)} error={errors.city} placeholder="Pedregulho/SP" />
                      <Input wrapClassName="sm:col-span-2" label="Endereço" name="address" required autoComplete="street-address" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} placeholder="Rua, número e bairro" />
                      <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-between">
                        <Button to="/carrinho" variant="ghost">
                          <ArrowLeft className="h-4 w-4" /> Voltar ao carrinho
                        </Button>
                        <Button type="submit" size="lg">
                          Revisar pedido <ArrowRight className="arrow h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </StepCard>
                )}

                {step === 2 && (
                  <StepCard key="s2" icon={FileText} title="Revisão do pedido" subtitle="Confira os exames e os dados antes de seguir para o pagamento.">
                    <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
                      {lines.map(({ product, quantity, lineTotal }) => (
                        <li key={product.id} className="flex items-center gap-4 p-4">
                          <ProductArt icon={product.icon} tone={product.tone} imageUrl={product.imageUrl} alt="" size="sm" className="h-14 w-14 shrink-0 rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-ink-900">{product.name}</p>
                            <p className="tabular text-[13px] text-ink-500">
                              {quantity} × {formatCurrency(product.price)}
                            </p>
                          </div>
                          <span className="tabular font-bold">{formatCurrency(lineTotal)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-ink-50 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">Paciente</p>
                          <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                            <Pencil className="h-3 w-3" /> Editar
                          </button>
                        </div>
                        <p className="mt-2 font-semibold">{form.name}</p>
                        <p className="text-[13.5px] text-ink-600">{form.email}</p>
                        <p className="text-[13.5px] text-ink-600">{form.phone}</p>
                        <p className="text-[13.5px] text-ink-600">CPF ***.***.***-{onlyDigits(form.cpf).slice(-2)}</p>
                      </div>
                      <div className="rounded-2xl bg-ink-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">Local da coleta</p>
                        <p className="mt-2 font-semibold">Laboratório Cardoso</p>
                        <p className="text-[13.5px] text-ink-600">Rua Tenente Salviano, 136 – Centro</p>
                        <p className="text-[13.5px] text-ink-600">Pedregulho/SP</p>
                      </div>
                    </div>
                    {lines.some((l) => l.product.requiresPreparation) && (
                      <div className="mt-4 flex gap-3 rounded-2xl border border-peach-300 bg-peach-50 p-4 text-[13.5px] text-ink-700">
                        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        <span>Alguns exames exigem preparo. Consulte as orientações na página de cada exame e confirme com o laboratório.</span>
                      </div>
                    )}
                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                      <Button variant="ghost" onClick={() => setStep(1)}>
                        <ArrowLeft className="h-4 w-4" /> Voltar
                      </Button>
                      <Button size="lg" onClick={() => setStep(3)}>
                        Ir para pagamento <ArrowRight className="arrow h-4 w-4" />
                      </Button>
                    </div>
                  </StepCard>
                )}

                {step === 3 && (
                  <StepCard key="s3" icon={CreditCard} title="Forma de pagamento" subtitle="Escolha uma opção demonstrativa. Nenhuma cobrança será feita.">
                    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Forma de pagamento">
                      {(
                        [
                          { id: 'pix', icon: QrCode, title: 'PIX', text: 'QR Code ilustrativo' },
                          { id: 'cartao', icon: CreditCard, title: 'Cartão de crédito', text: 'Até 3x sem juros (demo)' },
                          { id: 'presencial', icon: Store, title: 'No laboratório', text: 'Pague no dia da coleta' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={method === m.id}
                          onClick={() => setMethod(m.id)}
                          className={cn('relative rounded-2xl border-2 p-4 text-left transition', method === m.id ? 'border-brand-600 bg-brand-50/50' : 'border-ink-100 bg-white hover:border-ink-200')}
                        >
                          <span className={cn('grid h-10 w-10 place-items-center rounded-xl', method === m.id ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600')}>
                            <m.icon className="h-5 w-5" />
                          </span>
                          <span className="mt-3 block font-bold text-ink-900">{m.title}</span>
                          <span className="block text-[12.5px] text-ink-500">{m.text}</span>
                          {method === m.id && (
                            <motion.span layoutId="pay-check" className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </motion.span>
                          )}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div key={method} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6">
                        {method === 'pix' && (
                          <div className="flex gap-4 rounded-2xl bg-ink-50 p-5">
                            <QrCode className="h-6 w-6 shrink-0 text-brand-600" />
                            <div className="text-[14px] text-ink-600">
                              <p className="font-semibold text-ink-900">Pagamento instantâneo (simulado)</p>
                              <p className="mt-1">Ao finalizar, exibiremos um QR Code e um código “copia e cola” <strong>ilustrativos</strong>. Eles não têm valor de pagamento.</p>
                            </div>
                          </div>
                        )}
                        {method === 'presencial' && (
                          <div className="flex gap-4 rounded-2xl bg-ink-50 p-5">
                            <Banknote className="h-6 w-6 shrink-0 text-brand-600" />
                            <div className="text-[14px] text-ink-600">
                              <p className="font-semibold text-ink-900">Pague no laboratório</p>
                              <p className="mt-1">Seu pedido fica registrado e o pagamento é feito no dia da coleta, diretamente na recepção.</p>
                            </div>
                          </div>
                        )}
                        {method === 'cartao' && <CardForm card={card} setCard={setCard} errors={cardErrors} total={total} />}
                      </motion.div>
                    </AnimatePresence>

                    <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-100 p-4 text-[13.5px] text-ink-600">
                      <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand-600" />
                      <span>
                        Estou ciente de que esta é uma <strong>compra simulada</strong>, que nenhum pagamento será processado e que os dados ficam salvos apenas neste navegador. Li os{' '}
                        <Link to="/termos-de-uso" className="link" target="_blank">
                          termos de uso
                        </Link>{' '}
                        e a{' '}
                        <Link to="/politica-de-privacidade" className="link" target="_blank">
                          política de privacidade
                        </Link>
                        .
                      </span>
                    </label>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                      <Button variant="ghost" onClick={() => setStep(2)} disabled={processing}>
                        <ArrowLeft className="h-4 w-4" /> Voltar
                      </Button>
                      <Button size="lg" onClick={finish} loading={processing}>
                        {processing ? 'Processando simulação…' : <>Finalizar pedido · {formatCurrency(total)}</>}
                      </Button>
                    </div>
                  </StepCard>
                )}
              </AnimatePresence>
            </div>

            <aside className="lg:sticky lg:top-[150px] lg:self-start">
              <div className="rounded-[28px] border border-ink-100 bg-white p-6 shadow-soft">
                <h2 className="flex items-center justify-between font-bold">
                  Resumo <span className="text-sm font-medium text-ink-500">{plural(count, 'item', 'itens')}</span>
                </h2>
                <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                  {lines.map(({ product, quantity, lineTotal }) => (
                    <li key={product.id} className="flex items-center gap-3 text-sm">
                      <span className="relative">
                        <ProductArt icon={product.icon} tone={product.tone} imageUrl={product.imageUrl} alt="" size="sm" className="h-11 w-11 rounded-lg" />
                        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink-900 px-1 text-[10px] font-bold text-white">{quantity}</span>
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">{product.name}</span>
                      <span className="tabular font-semibold">{formatCurrency(lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Subtotal</dt>
                    <dd className="tabular">{formatCurrency(subtotal)}</dd>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <dt>Economia em combos</dt>
                      <dd className="tabular">− {formatCurrency(savings)}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4 flex items-end justify-between border-t border-dashed border-ink-200 pt-4">
                  <span className="font-bold">Total</span>
                  <span className="tabular display text-3xl font-semibold">{formatCurrency(total)}</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2 px-2 text-[13px] text-ink-500">
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Nenhum dado é enviado a servidores
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> CPF armazenado de forma mascarada
                </li>
              </ul>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StepCard({ icon: Icon, title, subtitle, children }: { icon: typeof UserRound; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="rounded-[28px] border border-ink-100 bg-white p-5 shadow-soft sm:p-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-[13.5px] text-ink-500">{subtitle}</p>
        </div>
      </header>
      {children}
    </motion.section>
  )
}

type CardState = { number: string; name: string; expiry: string; cvv: string; installments: string }

function CardForm({ card, setCard, errors, total }: { card: CardState; setCard: React.Dispatch<React.SetStateAction<CardState>>; errors: Record<string, string>; total: number }) {
  const [flipped, setFlipped] = useState(false)
  const brand = useMemo(() => {
    const d = onlyDigits(card.number)
    if (/^4/.test(d)) return 'VISA'
    if (/^5[1-5]/.test(d)) return 'MASTERCARD'
    if (/^(4011|4312|4389|5041|6277|6362|6363|650|6516|6550)/.test(d)) return 'ELO'
    return 'CARTÃO'
  }, [card.number])
  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div className="[perspective:1000px]">
        <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5 }} className="relative aspect-[1.586] w-full [transform-style:preserve-3d]">
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-[#2a0a0c] p-5 text-white shadow-lift [backface-visibility:hidden]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="flex items-start justify-between">
              <span className="h-8 w-11 rounded-md bg-gradient-to-br from-peach-200 to-peach-400" />
              <span className="text-xs font-extrabold tracking-widest">{brand}</span>
            </div>
            <p className="tabular mt-6 font-mono text-lg tracking-[0.12em]">{card.number || '•••• •••• •••• ••••'}</p>
            <div className="mt-4 flex justify-between text-[10px] uppercase tracking-wider text-white/70">
              <span className="max-w-[70%] truncate">{card.name || 'Nome impresso'}</span>
              <span>{card.expiry || 'MM/AA'}</span>
            </div>
            <span className="absolute bottom-2 left-5 text-[9px] font-bold uppercase tracking-widest text-white/50">Demonstrativo</span>
          </div>
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-ink-800 text-white shadow-lift [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="mt-6 h-10 bg-ink-900" />
            <div className="mx-5 mt-4 flex h-9 items-center justify-end rounded bg-white px-3 font-mono text-sm text-ink-900">{card.cvv || '•••'}</div>
          </div>
        </motion.div>
        <p className="mt-3 text-center text-xs text-ink-500">Use um número fictício, ex.: 4111 1111 1111 1111</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input wrapClassName="sm:col-span-2" label="Número do cartão" name="cardNumber" inputMode="numeric" autoComplete="off" value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: maskCard(e.target.value) }))} error={errors.number} placeholder="0000 0000 0000 0000" />
        <Input wrapClassName="sm:col-span-2" label="Nome impresso" name="cardName" autoComplete="off" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value.toUpperCase() }))} error={errors.name} placeholder="COMO NO CARTÃO" />
        <Input label="Validade" name="cardExpiry" inputMode="numeric" autoComplete="off" value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: maskExpiry(e.target.value) }))} error={errors.expiry} placeholder="MM/AA" />
        <Input label="CVV" name="cardCvv" inputMode="numeric" autoComplete="off" value={card.cvv} onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} onChange={(e) => setCard((c) => ({ ...c, cvv: onlyDigits(e.target.value).slice(0, 4) }))} error={errors.cvv} placeholder="123" />
        <Select wrapClassName="sm:col-span-2" label="Parcelamento" name="installments" value={card.installments} onChange={(e) => setCard((c) => ({ ...c, installments: e.target.value }))}>
          {[1, 2, 3].map((n) => (
            <option key={n} value={n}>
              {n}x de {formatCurrency(total / n)} sem juros (demonstrativo)
            </option>
          ))}
        </Select>
        <p className="flex items-center gap-1.5 text-xs text-ink-500 sm:col-span-2">
          <Lock className="h-3.5 w-3.5" /> Os dados do cartão não são armazenados — guardamos apenas os 4 últimos dígitos fictícios.
        </p>
      </div>
    </div>
  )
}

function Confirmation({ order }: { order: Order }) {
  const user = useCurrentUser()
  const pixCode = `00020126DEMONSTRATIVO-LABCARDOSO-${order.number}-SEM-VALOR-DE-PAGAMENTO5204000053039865802BR`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      toast.success('Código copiado', { description: 'Lembre-se: é apenas ilustrativo.' })
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className="overflow-hidden rounded-[32px] border border-ink-100 bg-white shadow-card">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 p-7 text-white sm:p-10">
          <div className="absolute inset-0 bg-noise opacity-60 mix-blend-overlay" />
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-2.5 w-2.5 rounded-[3px] bg-peach-200"
              style={{ left: '50%', top: '45%' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{ x: Math.cos((i / 14) * Math.PI * 2) * (120 + (i % 3) * 40), y: Math.sin((i / 14) * Math.PI * 2) * (80 + (i % 4) * 20), opacity: 0, scale: 1, rotate: 180 }}
              transition={{ duration: 1.2, delay: 0.25, ease: 'easeOut' }}
            />
          ))}
          <div className="relative flex flex-col items-center text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="grid h-20 w-20 place-items-center rounded-full bg-white text-brand-600 shadow-lift">
              <CheckCircle2 className="h-11 w-11" strokeWidth={1.8} />
            </motion.span>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-peach-200">Pedido simulado com sucesso</p>
            <p className="display tabular mt-2 text-5xl font-medium">{order.number}</p>
            <p className="mt-2 text-sm text-brand-100">{formatDateTime(order.createdAt)}</p>
            <StatusBadge status={order.status} className="mt-4 bg-white" />
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="font-bold">Exames selecionados</h2>
          <ul className="mt-3 divide-y divide-ink-100">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-4 py-3 text-[14.5px]">
                <span>
                  {i.name} <span className="text-ink-400">× {i.quantity}</span>
                </span>
                <span className="tabular font-semibold">{formatCurrency(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-end justify-between border-t border-dashed border-ink-200 pt-4">
            <span className="font-bold">Valor total (demonstrativo)</span>
            <span className="tabular display text-3xl font-semibold">{formatCurrency(order.total)}</span>
          </div>
          <dl className="mt-6 grid gap-4 rounded-2xl bg-ink-50 p-4 text-[13.5px] sm:grid-cols-2">
            <div>
              <dt className="text-ink-400">Paciente</dt>
              <dd className="font-semibold text-ink-900">{order.customer.name}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Pagamento</dt>
              <dd className="font-semibold text-ink-900">{PAYMENT_META[order.paymentMethod].label}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button to={user ? `/pedidos/${order.id}` : '/pedidos'}>Acompanhar pedido</Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
            <Button variant="ghost" to="/exames">
              Continuar navegando
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {order.paymentMethod === 'pix' && (
          <section className="rounded-[28px] border border-ink-100 bg-white p-6 text-center shadow-soft">
            <h2 className="font-bold">PIX ilustrativo</h2>
            <p className="mt-1 text-[13px] text-ink-500">Este QR Code não possui valor de pagamento.</p>
            <div className="mt-5 flex justify-center">
              <FakeQr seed={order.number} size={210} />
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-ink-50 p-2 pl-3">
              <code className="min-w-0 flex-1 truncate text-left text-xs text-ink-600">{pixCode}</code>
              <Button size="sm" variant="secondary" onClick={copy}>
                <Copy className="h-3.5 w-3.5" /> Copiar
              </Button>
            </div>
          </section>
        )}
        <section className="rounded-[28px] border border-ink-100 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-brand-600" /> Próximos passos
          </h2>
          <ol className="mt-4 space-y-4">
            {[
              { icon: FlaskConical, title: 'Confira o preparo', text: 'Revise jejum e orientações de cada exame antes de ir ao laboratório.' },
              { icon: CalendarCheck, title: 'Compareça ao laboratório', text: 'Rua Tenente Salviano, 136 – Centro, Pedregulho/SP.' },
              { icon: FileText, title: 'Leve seus documentos', text: `Documento com foto, pedido médico (se houver) e o número ${order.number}.` },
            ].map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-semibold">
                    {i + 1}. {title}
                  </span>
                  <span className="text-[13.5px] text-ink-500">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        <p className="flex gap-2 rounded-2xl bg-amber-50 p-4 text-[13px] text-amber-900 ring-1 ring-inset ring-amber-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> Este pedido é uma simulação. Ele aparece no painel administrativo deste navegador para fins de demonstração.
        </p>
      </div>
    </motion.div>
  )
}
