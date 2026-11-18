import { PageHeader } from '@/components/layout/PageHeader'
import { useStore } from '@/store'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { FavoritesGrid } from './Account'

export default function Favorites() {
  useDocumentTitle('Favoritos')
  const count = useStore((s) => s.favorites.length)
  return (
    <>
      <PageHeader title="Seus favoritos" description={count ? `${count} ${count === 1 ? 'exame salvo' : 'exames salvos'} neste navegador.` : 'Salve exames para consultar depois.'} crumbs={[{ label: 'Favoritos' }]} />
      <div className="container py-10">
        <FavoritesGrid />
      </div>
    </>
  )
}
