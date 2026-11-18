import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock, Eye, EyeOff, Heart, History, KeyRound, LogOut, Mail, Package, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/store'
import { useCurrentUser, useMyOrders, usePublicProducts } from '@/store/hooks'
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from '@/data/users'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PixelSquares } from '@/components/ui/PixelSquares'
import { ProductArt } from '@/components/product/ProductArt'
import { ProductCard } from '@/components/product/ProductCard'
import { formatCurrency, formatDate, formatRelative, plural } from '@/lib/format'
import { isValidEmail, isValidPhone, maskCEP, maskCPF, maskPhone } from '@/lib/masks'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn, onlyDigits } from '@/lib/utils'

export default function Account() {
  const user = useCurrentUser()
  useDocumentTitle(user ? 'Minha conta' : 'Entrar')
  return user ? <Dashboard /> : <AuthScreen />
}

/* ───────────────────────────── Autenticação demonstrativa */
type Mode = 'login' | 'register' | 'recover'

function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login')
  return (
    <div className="container py-10 lg:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[36px] border border-ink-100 bg-white shadow-card lg:grid-cols-[1fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-10 text-white lg:block">
          <div className="absolute inset-0 bg-noise opacity-60 mix-blend-overlay" />
          <PixelSquares tone="white" className="absolute -right-6 -top-6 h-40 w-40 opacity-20" />
          <div className="relative flex h-full flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-peach-200">Área do paciente</span>
            <h1 className="display mt-4 text-4xl font-medium leading-tight">
              Seus pedidos e dados <em className="italic text-peach-200">em um só lugar.</em>
            </h1>
            <ul className="mt-8 space-y-4 text-[15px] text-brand-100">
              {[
                { icon: Package, t: 'Acompanhe o status dos seus pedidos' },
                { icon: Heart, t: 'Salve exames favoritos' },
                { icon: History, t: 'Retome exames vistos recentemente' },
                { icon: Sparkles, t: 'Preencha o checkout mais rápido' },
              ].map(({ icon: Icon, t }) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
                    <Icon className="h-4 w-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-auto rounded-2xl bg-black/15 p-4 text-[13px] leading-relaxed text-brand-100 ring-1 ring-inset ring-white/10">
              <ShieldCheck className="mb-1 h-4 w-4" />
              Ambiente demonstrativo: não há autenticação real. Os dados ficam salvos somente neste navegador. Não utilize informações pessoais reais.
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              {mode === 'login' && <LoginForm onMode={setMode} />}
              {mode === 'register' && <RegisterForm onMode={setMode} />}
              {mode === 'recover' && <RecoverForm onMode={setMode} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pr-12" />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-[30px] grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function LoginForm({ onMode }: { onMode: (m: Mode) => void }) {
  const login = useStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const res = login(email, password)
      setLoading(false)
      if (!res.ok) return setError(res.error)
      toast.success(`Bem-vindo(a), ${res.data.name.split(' ')[0]}!`)
      const next = params.get('next')
      if (next) navigate(next)
    }, 500)
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="display text-3xl font-medium">Entrar</h2>
        <p className="mt-1 text-ink-500">Acesse sua área do paciente.</p>
      </div>
      <button
        type="button"
        onClick={() => (setEmail(DEMO_USER_EMAIL), setPassword(DEMO_USER_PASSWORD))}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 p-3.5 text-left text-[13px] transition hover:bg-brand-50"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
          <KeyRound className="h-4 w-4" />
        </span>
        <span>
          <strong className="block text-ink-900">Usar conta de demonstração</strong>
          <span className="text-ink-600">
            {DEMO_USER_EMAIL} · {DEMO_USER_PASSWORD}
          </span>
        </span>
      </button>
      <Input label="E-mail" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@exemplo.test" />
      <PasswordInput label="Senha" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Sua senha" />
      {error && <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800">{error}</p>}
      <div className="flex justify-end">
        <button type="button" onClick={() => onMode('recover')} className="text-sm font-semibold text-brand-700 hover:underline">
          Esqueceu sua senha?
        </button>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Entrar
      </Button>
      <p className="text-center text-sm text-ink-500">
        Ainda não tem conta?{' '}
        <button type="button" onClick={() => onMode('register')} className="font-semibold text-brand-700 hover:underline">
          Cadastre-se
        </button>
      </p>
    </form>
  )
}

function RegisterForm({ onMode }: { onMode: (m: Mode) => void }) {
  const register = useStore((s) => s.register)
  const [f, setF] = useState({ name: '', email: '', phone: '', cpf: '', birthDate: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (f.name.trim().split(/\s+/).length < 2) er.name = 'Informe nome e sobrenome.'
    if (!isValidEmail(f.email)) er.email = 'E-mail inválido.'
    if (!isValidPhone(f.phone)) er.phone = 'Telefone inválido.'
    if (onlyDigits(f.cpf).length !== 11) er.cpf = 'CPF deve ter 11 dígitos.'
    if (f.password.length < 6) er.password = 'Mínimo de 6 caracteres.'
    if (f.password !== f.confirm) er.confirm = 'As senhas não conferem.'
    setErrors(er)
    if (Object.keys(er).length) return
    const res = register({ name: f.name.trim(), email: f.email, phone: f.phone, cpf: f.cpf, birthDate: f.birthDate, password: f.password, cep: '', address: '', city: '' })
    if (!res.ok) return setErrors({ email: res.error })
    toast.success('Conta demonstrativa criada!', { description: 'Você já está conectado(a).' })
  }
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <h2 className="display text-3xl font-medium">Criar conta</h2>
        <p className="mt-1 text-ink-500">Cadastro demonstrativo — use dados fictícios.</p>
      </div>
      <Input label="Nome completo" name="name" value={f.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="E-mail" name="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
        <Input label="Telefone" name="phone" value={f.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} error={errors.phone} />
        <Input label="CPF" name="cpf" value={f.cpf} onChange={(e) => set('cpf', maskCPF(e.target.value))} error={errors.cpf} hint="Guardamos só os 2 últimos dígitos." />
        <Input label="Nascimento" name="birthDate" type="date" value={f.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
        <PasswordInput label="Senha" name="password" value={f.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
        <PasswordInput label="Confirmar senha" name="confirm" value={f.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} />
      </div>
      <Button type="submit" size="lg" className="w-full">
        Criar conta
      </Button>
      <p className="text-center text-sm text-ink-500">
        Já tem conta?{' '}
        <button type="button" onClick={() => onMode('login')} className="font-semibold text-brand-700 hover:underline">
          Entrar
        </button>
      </p>
    </form>
  )
}

function RecoverForm({ onMode }: { onMode: (m: Mode) => void }) {
  const users = useStore((s) => s.users)
  const resetPassword = useStore((s) => s.resetPassword)
  const [stage, setStage] = useState<'email' | 'code' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [demoCode] = useState(() => String(Math.floor(100000 + Math.random() * 900000)))
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="display text-3xl font-medium">Recuperar senha</h2>
        <p className="mt-1 text-ink-500">Fluxo simulado — nenhum e-mail é enviado.</p>
      </div>
      {stage === 'email' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) return setError('Não encontramos uma conta com este e-mail.')
            setError('')
            setStage('code')
          }}
        >
          <Input label="E-mail cadastrado" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {error && <p className="text-sm font-medium text-brand-700">{error}</p>}
          <Button type="submit" size="lg" className="w-full">
            <Mail className="h-4 w-4" /> Enviar código
          </Button>
        </form>
      )}
      {stage === 'code' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (code !== demoCode) return setError('Código incorreto.')
            if (pwd.length < 6) return setError('A nova senha deve ter ao menos 6 caracteres.')
            const r = resetPassword(email, pwd)
            if (!r.ok) return setError(r.error)
            setStage('done')
          }}
        >
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-inset ring-amber-200">
            <strong>Simulação:</strong> em um sistema real, o código seria enviado para {email}. Seu código demonstrativo é <code className="rounded bg-white px-1.5 py-0.5 font-bold">{demoCode}</code>
          </div>
          <Input label="Código de verificação" name="code" inputMode="numeric" value={code} onChange={(e) => setCode(onlyDigits(e.target.value).slice(0, 6))} />
          <PasswordInput label="Nova senha" name="newPassword" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          {error && <p className="text-sm font-medium text-brand-700">{error}</p>}
          <Button type="submit" size="lg" className="w-full">
            Redefinir senha
          </Button>
        </form>
      )}
      {stage === 'done' && (
        <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900 ring-1 ring-inset ring-emerald-200">
          <p className="font-bold">Senha redefinida!</p>
          <p className="mt-1 text-sm">Agora você já pode entrar com a nova senha.</p>
        </div>
      )}
      <button type="button" onClick={() => onMode('login')} className="text-sm font-semibold text-brand-700 hover:underline">
        ← Voltar para o login
      </button>
    </div>
  )
}

/* ───────────────────────────── Painel do paciente */
type Tab = 'resumo' | 'pedidos' | 'dados' | 'favoritos' | 'historico'

function Dashboard() {
  const user = useCurrentUser()!
  const orders = useMyOrders()
  const logout = useStore((s) => s.logout)
  const [params, setParams] = useSearchParams()
  const tab = (params.get('aba') as Tab) || 'resumo'
  const setTab = (t: Tab) => setParams(t === 'resumo' ? {} : { aba: t }, { replace: true })

  const tabs: { id: Tab; label: string; icon: typeof UserRound }[] = [
    { id: 'resumo', label: 'Visão geral', icon: Sparkles },
    { id: 'pedidos', label: 'Meus pedidos', icon: Package },
    { id: 'dados', label: 'Dados cadastrais', icon: UserRound },
    { id: 'favoritos', label: 'Favoritos', icon: Heart },
    { id: 'historico', label: 'Vistos recentemente', icon: History },
  ]

  return (
    <div className="container py-8 lg:py-12">
      <div className="relative mb-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 to-brand-900 p-6 text-white sm:p-8">
        <PixelSquares tone="white" className="absolute -right-4 -top-4 h-32 w-32 opacity-15" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="display grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl ring-1 ring-inset ring-white/25">{user.name.charAt(0)}</span>
            <div>
              <p className="text-sm text-brand-100">Olá,</p>
              <h1 className="display text-3xl font-medium">{user.name}</h1>
              <p className="text-sm text-brand-100">Paciente desde {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <Button
            variant="white"
            onClick={() => {
              logout()
              toast('Você saiu da sua conta.')
            }}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none lg:mx-0 lg:flex-col lg:gap-1 lg:px-0" aria-label="Seções da conta">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn('inline-flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition lg:w-full', tab === t.id ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-100 hover:bg-ink-50 lg:bg-transparent lg:ring-0')}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === 'resumo' && <Overview orders={orders} onTab={setTab} />}
            {tab === 'pedidos' && <OrdersList orders={orders} />}
            {tab === 'dados' && <ProfileForm />}
            {tab === 'favoritos' && <FavoritesGrid />}
            {tab === 'historico' && <ViewedList />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Overview({ orders, onTab }: { orders: ReturnType<typeof useMyOrders>; onTab: (t: Tab) => void }) {
  const favs = useStore((s) => s.favorites.length)
  const active = orders.filter((o) => !['concluido', 'cancelado'].includes(o.status))
  const spent = orders.filter((o) => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0)
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Pedidos realizados', value: orders.length, icon: Package },
          { label: 'Em andamento', value: active.length, icon: Clock },
          { label: 'Favoritos', value: favs, icon: Heart },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <Icon className="h-5 w-5 text-brand-600" />
            <p className="display tabular mt-3 text-4xl font-medium">{value}</p>
            <p className="text-sm text-ink-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Pedidos recentes</h2>
          <button type="button" onClick={() => onTab('pedidos')} className="text-sm font-semibold text-brand-700">
            Ver todos
          </button>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">
            Você ainda não fez pedidos.{' '}
            <Link to="/exames" className="link">
              Ver exames
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100">
            {orders.slice(0, 4).map((o) => (
              <li key={o.id}>
                <Link to={`/pedidos/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3.5 transition hover:opacity-80">
                  <span>
                    <span className="tabular block font-bold">{o.number}</span>
                    <span className="text-[13px] text-ink-500">
                      {formatDate(o.createdAt)} · {plural(o.items.length, 'exame', 'exames')}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <StatusBadge status={o.status} size="sm" />
                    <span className="tabular font-semibold">{formatCurrency(o.total)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {spent > 0 && <p className="mt-4 border-t border-ink-100 pt-4 text-xs text-ink-400">Total em pedidos (demonstrativo): {formatCurrency(spent)}</p>}
      </div>
    </div>
  )
}

export function OrdersList({ orders }: { orders: ReturnType<typeof useMyOrders> }) {
  if (!orders.length)
    return (
      <div className="card">
        <EmptyState icon={Package} title="Nenhum pedido ainda" description="Quando você finalizar uma compra simulada, ela aparecerá aqui com o status atualizado pelo laboratório." action={<Button to="/exames">Ver exames</Button>} />
      </div>
    )
  return (
    <div className="space-y-3">
      {orders.map((o, i) => (
        <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }}>
          <Link to={`/pedidos/${o.id}`} className="group block rounded-[24px] border border-ink-100 bg-white p-5 transition hover:border-ink-200 hover:shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="tabular text-lg font-bold">{o.number}</p>
                <p className="text-[13px] text-ink-500">Realizado em {formatDate(o.createdAt)}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <p className="line-clamp-1 max-w-xl text-[14px] text-ink-600">{o.items.map((i) => i.name).join(' · ')}</p>
              <span className="inline-flex items-center gap-2 font-bold">
                {formatCurrency(o.total)} <ArrowRight className="h-4 w-4 text-brand-600 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

function ProfileForm() {
  const user = useCurrentUser()!
  const updateProfile = useStore((s) => s.updateProfile)
  const changePassword = useStore((s) => s.changePassword)
  const [f, setF] = useState({ name: user.name, phone: user.phone, birthDate: user.birthDate, cep: user.cep, address: user.address, city: user.city })
  const [pw, setPw] = useState({ current: '', next: '' })
  return (
    <div className="space-y-6">
      <form
        className="card p-6"
        onSubmit={(e) => {
          e.preventDefault()
          updateProfile(f)
          toast.success('Dados atualizados.')
        }}
      >
        <h2 className="font-bold">Dados cadastrais</h2>
        <p className="text-sm text-ink-500">Informações demonstrativas armazenadas apenas neste navegador.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input wrapClassName="sm:col-span-2" label="Nome completo" name="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input label="E-mail" name="email" value={user.email} disabled hint="O e-mail identifica a conta e não pode ser alterado." />
          <Input label="CPF" name="cpf" value={user.cpfMasked} disabled />
          <Input label="Telefone" name="phone" value={f.phone} onChange={(e) => setF({ ...f, phone: maskPhone(e.target.value) })} />
          <Input label="Nascimento" name="birthDate" type="date" value={f.birthDate} onChange={(e) => setF({ ...f, birthDate: e.target.value })} />
          <Input label="CEP" name="cep" value={f.cep} onChange={(e) => setF({ ...f, cep: maskCEP(e.target.value) })} />
          <Input label="Cidade/UF" name="city" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          <Input wrapClassName="sm:col-span-2" label="Endereço" name="address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        </div>
        <Button type="submit" className="mt-6">
          Salvar alterações
        </Button>
      </form>
      <form
        className="card p-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (pw.next.length < 6) return toast.error('A nova senha deve ter ao menos 6 caracteres.')
          const r = changePassword(pw.current, pw.next)
          if (!r.ok) return toast.error(r.error)
          setPw({ current: '', next: '' })
          toast.success('Senha alterada.')
        }}
      >
        <h2 className="font-bold">Alterar senha</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <PasswordInput label="Senha atual" name="current" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <PasswordInput label="Nova senha" name="next" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        </div>
        <Button type="submit" variant="dark" className="mt-6">
          Atualizar senha
        </Button>
      </form>
    </div>
  )
}

export function FavoritesGrid() {
  const favorites = useStore((s) => s.favorites)
  const products = usePublicProducts()
  const items = favorites.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p)
  if (!items.length)
    return (
      <div className="card">
        <EmptyState icon={Heart} title="Nenhum favorito salvo" description="Toque no coração dos exames para salvá-los aqui e encontrá-los rapidamente depois." action={<Button to="/exames">Explorar exames</Button>} />
      </div>
    )
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ViewedList() {
  const viewed = useStore((s) => s.viewed)
  const clearViewed = useStore((s) => s.clearViewed)
  const products = usePublicProducts()
  const items = viewed.map((v) => ({ v, p: products.find((p) => p.id === v.productId) })).filter((x) => x.p)
  if (!items.length)
    return (
      <div className="card">
        <EmptyState icon={History} title="Nenhum exame visualizado" description="Os exames que você abrir aparecerão aqui. O histórico fica salvo apenas neste navegador." action={<Button to="/exames">Ver exames</Button>} />
      </div>
    )
  return (
    <div className="card p-2">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-bold">Histórico de navegação local</h2>
        <button type="button" onClick={clearViewed} className="text-sm font-semibold text-ink-500 hover:text-brand-700">
          Limpar histórico
        </button>
      </div>
      <ul className="divide-y divide-ink-100">
        {items.map(({ v, p }) => (
          <li key={v.productId}>
            <Link to={`/exames/${p!.slug}`} className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-ink-50">
              <ProductArt icon={p!.icon} tone={p!.tone} imageUrl={p!.imageUrl} alt="" size="sm" className="h-14 w-14 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{p!.name}</span>
                <span className="text-[13px] text-ink-500">Visto {formatRelative(v.at)}</span>
              </span>
              <span className="tabular font-semibold">{formatCurrency(p!.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
