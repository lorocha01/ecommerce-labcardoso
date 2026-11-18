import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Search } from 'lucide-react'
import { useStore } from '@/store'
import { useCurrentUser, useMyOrders } from '@/store/hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { OrdersList } from './Account'

export const LOOKUP_KEY = 'labcardoso:order-lookup'

export default function Orders() {
  useDocumentTitle('Meus pedidos')
  const user = useCurrentUser()
  const orders = useMyOrders()
  return (
    <>
      <PageHeader title="Meus pedidos" description="Acompanhe o status dos seus pedidos demonstrativos. As atualizações feitas pelo laboratório no painel administrativo aparecem aqui." crumbs={[{ label: 'Meus pedidos' }]} />
      <div className="container py-10">{user ? <div className="mx-auto max-w-4xl"><OrdersList orders={orders} /></div> : <Lookup />}</div>
    </>
  )
}

function Lookup() {
  const ordersAll = useStore((s) => s.orders)
  const navigate = useNavigate()
  const [number, setNumber] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  return (
    <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
      <div className="card p-6 sm:p-8">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <LogIn className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-xl font-bold">Entre na sua conta</h2>
        <p className="mt-1 text-[14.5px] text-ink-500">Veja todos os seus pedidos, favoritos e dados em um só lugar.</p>
        <Button to="/minha-conta?next=/pedidos" className="mt-6">
          Entrar ou cadastrar
        </Button>
      </div>
      <form
        className="card p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault()
          const n = number.trim().toUpperCase().replace(/^(\d)/, 'LC-$1')
          const o = ordersAll.find((x) => x.number.toUpperCase() === n && x.customer.email.toLowerCase() === email.trim().toLowerCase())
          if (!o) return setError('Pedido não encontrado. Confira o número e o e-mail informado na compra.')
          try {
            sessionStorage.setItem(LOOKUP_KEY, o.id)
          } catch {
            /* ignore */
          }
          navigate(`/pedidos/${o.id}`)
        }}
      >
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-peach-100 text-brand-700">
          <Search className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-xl font-bold">Consultar um pedido</h2>
        <p className="mt-1 text-[14.5px] text-ink-500">Comprou sem conta? Informe o número do pedido e o e-mail usado na compra.</p>
        <div className="mt-5 space-y-3">
          <Input label="Número do pedido" name="number" placeholder="LC-1234" value={number} onChange={(e) => setNumber(e.target.value)} required />
          <Input label="E-mail" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {error && <p className="mt-3 text-sm font-medium text-brand-700">{error}</p>}
        <Button type="submit" variant="dark" className="mt-5 w-full">
          Consultar
        </Button>
      </form>
    </div>
  )
}
