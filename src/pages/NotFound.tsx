import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Página não encontrada')
  return (
    <div className="container py-16">
      <div className="card">
        <EmptyState
          icon={Compass}
          title="Página não encontrada"
          description="O endereço acessado não existe ou o conteúdo foi removido. Que tal voltar ao catálogo de exames?"
          action={
            <>
              <Button to="/exames">Ver exames</Button>
              <Button to="/" variant="secondary">
                Página inicial
              </Button>
            </>
          }
        />
      </div>
    </div>
  )
}
