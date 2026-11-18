import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, BarChart3, Eye, EyeOff, KeyRound, Lock, ShieldAlert, User } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/store'
import { useAdminAuth } from '@/store/adminAuth'
import { Button } from '@/components/ui/Button'
import { PixelSquares } from '@/components/ui/PixelSquares'
import { cn } from '@/lib/utils'

export default function AdminLogin() {
  const session = useAdminAuth((s) => s.session)
  const login = useAdminAuth((s) => s.login)
  const logActivity = useStore((s) => s.logActivity)
  const settings = useStore((s) => s.settings)
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(0)

  if (session) return <Navigate to="/admin" replace />

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!user || !password) {
      setError('Informe usuário e senha.')
      setShake((s) => s + 1)
      return
    }
    setLoading(true)
    setTimeout(() => {
      const ok = login(user, password, remember)
      setLoading(false)
      if (!ok) {
        setError('Usuário ou senha inválidos.')
        setShake((s) => s + 1)
        return
      }
      logActivity('login', `Login realizado no painel administrativo${remember ? ' (lembrar acesso)' : ''}.`, 'admin')
      toast.success('Login realizado com sucesso', { description: 'Bem-vindo ao painel administrativo.' })
      navigate((location.state as { from?: string })?.from ?? '/admin', { replace: true })
    }, 600)
  }

  return (
    <div className="grid min-h-dvh bg-[#F6F3F1] lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#1F0C0D] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-noise opacity-50" />
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-700/50 blur-3xl" />
        <PixelSquares tone="white" className="absolute bottom-12 right-12 h-40 w-40 opacity-10" />
        <img src={settings.logoWhiteUrl} alt={settings.storeName} className="relative h-12 w-auto self-start" />
        <div className="relative mt-auto max-w-md">
          <h1 className="display text-5xl font-medium leading-[1.05]">
            Gestão da loja <em className="italic text-peach-200">em tempo real.</em>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-brand-100/70">Acompanhe pedidos, gerencie exames e categorias, edite banners e visualize indicadores de vendas — tudo integrado à loja virtual.</p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: BarChart3, t: 'Indicadores' },
              { icon: KeyRound, t: 'Acesso restrito' },
              { icon: Lock, t: 'Dados locais' },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="rounded-2xl bg-white/5 p-4 ring-1 ring-inset ring-white/10">
                <Icon className="h-5 w-5 text-peach-200" />
                <p className="mt-2 text-sm font-semibold">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col p-6 sm:p-10">
        <Link to="/" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Voltar para a loja
        </Link>
        <div className="mx-auto my-auto w-full max-w-md py-10">
          <img src={settings.logoUrl} alt={settings.storeName} className="h-12 w-auto lg:hidden" />
          <h2 className="mt-8 text-3xl font-bold tracking-tight lg:mt-0">Painel Administrativo</h2>
          <p className="mt-2 text-ink-500">Entre com suas credenciais para continuar.</p>

          <motion.form key={shake} animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="admin-user" className="field-label">
                Usuário ou e-mail
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input id="admin-user" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" className={cn('field pl-11', error && 'field-error')} placeholder="admin" autoFocus />
              </div>
            </div>
            <div>
              <label htmlFor="admin-pass" className="field-label">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input id="admin-pass" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={cn('field pl-11 pr-12', error && 'field-error')} placeholder="••••••••" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              Lembrar acesso <span className="text-xs text-ink-400">(demonstração)</span>
            </label>
            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800" role="alert">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Entrar
            </Button>
          </motion.form>

          <div className="mt-8 rounded-2xl border border-dashed border-ink-300 bg-white p-4 text-sm">
            <p className="font-semibold text-ink-900">Credenciais de demonstração</p>
            <p className="mt-1 text-ink-600">
              Usuário: <code className="rounded bg-ink-100 px-1.5 py-0.5 font-semibold">admin</code> · Senha: <code className="rounded bg-ink-100 px-1.5 py-0.5 font-semibold">Cardoso@2026</code>
            </p>
            <button type="button" onClick={() => (setUser('admin'), setPassword('Cardoso@2026'))} className="mt-2 text-xs font-semibold text-brand-700 hover:underline">
              Preencher automaticamente
            </button>
          </div>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-ink-500">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            Autenticação apenas demonstrativa. Não é adequada para produção: credenciais e dados ficam acessíveis no navegador deste dispositivo.
          </p>
        </div>
      </div>
    </div>
  )
}
