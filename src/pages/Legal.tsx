import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function Privacy() {
  useDocumentTitle('Política de privacidade')
  const s = useStore((st) => st.settings)
  return (
    <>
      <PageHeader title="Política de privacidade" description="Como esta loja demonstrativa trata as informações inseridas no navegador." crumbs={[{ label: 'Política de privacidade' }]} />
      <article className="container max-w-3xl py-12">
        <div className="card prose-lab p-6 sm:p-10">
          <p className="!text-sm !text-ink-400">Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · Documento demonstrativo, sujeito à revisão jurídica do laboratório.</p>
          <h2>1. Sobre esta loja</h2>
          <p>Esta é uma versão demonstrativa da loja virtual do {s.storeName} ({s.legalName}). Ela foi desenvolvida para apresentar a experiência de navegação e compra de exames e <strong>não realiza vendas, cobranças ou atendimentos reais</strong>.</p>
          <h2>2. Quais dados são coletados</h2>
          <p>As informações digitadas (como nome, e-mail, telefone, endereço e dados de pedidos) são armazenadas exclusivamente no <strong>LocalStorage do seu navegador</strong>. Nenhum dado é transmitido para servidores, sistemas laboratoriais, gateways de pagamento ou terceiros.</p>
          <ul>
            <li>O CPF é armazenado apenas de forma mascarada (somente os dois últimos dígitos).</li>
            <li>Dados de cartão de crédito não são armazenados — apenas os quatro últimos dígitos do número fictício informado.</li>
            <li>Não coletamos nem exibimos resultados de exames ou informações de saúde.</li>
          </ul>
          <h2>3. Recomendações</h2>
          <p>Utilize somente dados fictícios durante a demonstração. Qualquer pessoa com acesso a este dispositivo e navegador pode visualizar as informações armazenadas localmente.</p>
          <h2>4. Como apagar seus dados</h2>
          <p>Você pode remover todas as informações limpando os dados de navegação do site no seu navegador. O painel administrativo também permite restaurar os dados de demonstração.</p>
          <h2>5. LGPD</h2>
          <p>Na versão de produção, o tratamento de dados pessoais seguirá a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), com a definição de bases legais, finalidades, prazos de retenção e canais para exercício dos direitos dos titulares.</p>
          <h2>6. Contato</h2>
          <p>
            Dúvidas sobre privacidade: {s.email} · {s.phone}. Veja também os <Link to="/termos-de-uso" className="link">termos de uso</Link>.
          </p>
        </div>
      </article>
    </>
  )
}

export function Terms() {
  useDocumentTitle('Termos de uso')
  const s = useStore((st) => st.settings)
  return (
    <>
      <PageHeader title="Termos de uso" description="Condições de uso da loja virtual demonstrativa." crumbs={[{ label: 'Termos de uso' }]} />
      <article className="container max-w-3xl py-12">
        <div className="card prose-lab p-6 sm:p-10">
          <p className="!text-sm !text-ink-400">Documento demonstrativo, sujeito à revisão jurídica do laboratório.</p>
          <h2>1. Natureza demonstrativa</h2>
          <p>Esta plataforma é um protótipo navegável. Preços, prazos, orientações de preparo e demais informações clínicas exibidas são <strong>ilustrativos</strong> e não substituem as informações oficiais do {s.storeName}.</p>
          <h2>2. Pedidos e pagamentos</h2>
          <p>Os pedidos realizados são simulações. Nenhum pagamento é processado, nenhum QR Code PIX é válido e nenhum dado de cartão é transmitido. Os números de pedido não têm validade para atendimento.</p>
          <h2>3. Orientação médica</h2>
          <p>As informações sobre exames têm caráter informativo. A solicitação e a interpretação de exames devem ser feitas por profissional de saúde habilitado.</p>
          <h2>4. Área do paciente e painel administrativo</h2>
          <p>A autenticação é apenas demonstrativa e não oferece segurança adequada para uso em produção. Os dados ficam restritos ao navegador e dispositivo utilizados, sem sincronização entre usuários.</p>
          <h2>5. Propriedade</h2>
          <p>A marca e o logotipo pertencem ao {s.legalName}. Veja também a <Link to="/politica-de-privacidade" className="link">política de privacidade</Link>.</p>
        </div>
      </article>
    </>
  )
}
