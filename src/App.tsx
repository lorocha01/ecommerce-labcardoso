import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { storageStatus, useStore } from '@/store'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { FlyToCartLayer } from '@/components/product/FlyToCartLayer'
import { PageLoader } from '@/components/ui/PageLoader'
import Home from '@/pages/Home'
import Catalog from '@/pages/Catalog'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Account from '@/pages/Account'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import Favorites from '@/pages/Favorites'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Faq from '@/pages/Faq'
import { Privacy, Terms } from '@/pages/Legal'
import NotFound from '@/pages/NotFound'
import Results from '@/pages/Results'
import { shopUrl } from '@/lib/routes'

// Painel administrativo carregado sob demanda (chunk separado)
const AdminLogin = lazy(() => import('@/pages/admin/Login'))
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminOrders = lazy(() => import('@/pages/admin/Orders'))
const AdminOrderDetail = lazy(() => import('@/pages/admin/OrderDetail'))
const AdminProducts = lazy(() => import('@/pages/admin/Products'))
const AdminCategories = lazy(() => import('@/pages/admin/Categories'))
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'))
const AdminFinance = lazy(() => import('@/pages/admin/Finance'))
const AdminBanners = lazy(() => import('@/pages/admin/Banners'))
const AdminActivity = lazy(() => import('@/pages/admin/Activity'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))

export default function App() {
  useEffect(() => {
    if (storageStatus.recovered.length) {
      const recovered = [...storageStatus.recovered]
      // regrava imediatamente a versão saneada para não repetir o aviso
      useStore.setState({})
      storageStatus.recovered = []
      toast.warning('Alguns dados salvos estavam corrompidos', {
        description: `Restauramos os dados de demonstração para: ${recovered.join(', ')}.`,
        duration: 8000,
      })
    }
    const onQuota = () => toast.error('Armazenamento do navegador cheio', { description: 'Não foi possível salvar as últimas alterações. Remova imagens grandes ou restaure os dados de demonstração.' })
    window.addEventListener('labcardoso:quota', onQuota)
    return () => window.removeEventListener('labcardoso:quota', onQuota)
  }, [])

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="exames" element={<Catalog />} />
            <Route path="exames/:id" element={<ProductDetail />} />
            {/* Páginas de categoria antigas → página única "Comprar exames" com o filtro aplicado */}
            <Route path="categorias/:slug" element={<CategoryRedirect />} />
            <Route path="resultados" element={<Results />} />
            <Route path="carrinho" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="minha-conta" element={<Account />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="pedidos/:id" element={<OrderDetail />} />
            <Route path="favoritos" element={<Favorites />} />
            <Route path="sobre" element={<About />} />
            <Route path="contato" element={<Contact />} />
            <Route path="faq" element={<Faq />} />
            <Route path="politica-de-privacidade" element={<Privacy />} />
            <Route path="termos-de-uso" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="pedidos/:id" element={<AdminOrderDetail />} />
            <Route path="exames" element={<AdminProducts />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="clientes" element={<AdminCustomers />} />
            <Route path="financeiro" element={<AdminFinance />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="atividades" element={<AdminActivity />} />
            <Route path="configuracoes" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
      <FlyToCartLayer />
      <Toaster
        position="top-center"
        richColors={false}
        closeButton
        toastOptions={{
          classNames: {
            toast: '!rounded-2xl !border-ink-100 !shadow-lift !font-sans',
            title: '!font-semibold !text-ink-900',
            description: '!text-ink-500',
            actionButton: '!bg-brand-600 !text-white !rounded-lg !font-semibold',
          },
        }}
      />
    </>
  )
}

function CategoryRedirect() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  return <Navigate to={shopUrl(slug, params.get('q') ?? undefined)} replace />
}
