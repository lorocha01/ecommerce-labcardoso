import type { StoreSettings } from '@/types'

/**
 * Configurações da loja.
 * Informações institucionais obtidas do site oficial do Laboratório Cardoso
 * (laboratoriocardoso.uniexames.srv.br) e de seus materiais de divulgação.
 * Itens marcados como "a confirmar" devem ser validados pelo laboratório.
 */
export const settings: StoreSettings = {
  storeName: 'Laboratório Cardoso',
  legalName: 'Laboratório Cardoso Borges Ltda.',
  logoUrl: '/brand/logo-cardoso.png',
  logoWhiteUrl: '/brand/logo-cardoso-white.png',
  phone: '(16) 3171-1123',
  whatsapp: '(16) 99167-5031',
  email: 'labcardoso@outlook.com',
  address: 'Rua Tenente Salviano, 136',
  district: 'Centro',
  city: 'Pedregulho',
  state: 'SP',
  cep: '14470-000',
  hours: 'Segunda a sexta · 7h às 17h',
  hoursSaturday: 'Sábado · 7h às 11h',
  hoursNote: 'Horários demonstrativos — confirme com o laboratório.',
  since: 1974,
  slogan: 'Dedicação e confiança desde 1974',
  tagline: 'Tradição e tecnologia perto de você',
  about:
    'Desde 1974, o Laboratório Cardoso cuida da saúde das famílias de Pedregulho e região com dedicação e confiança. Do campo até a cidade, atendemos pacientes, fábricas, fazendas e empresas, unindo a tradição de um atendimento próximo à tecnologia das análises clínicas.',
  mission:
    'Cuidar daquilo que realmente importa: a saúde e o bem-estar de cada paciente e de sua família, com a dedicação de sempre.',
  // Link "Resultados" do site oficial do laboratório
  resultsUrl: 'https://laboratoriocardoso.uniexames.srv.br/pedidos',
  social: {
    instagram: 'https://www.instagram.com/cardoso.laboratorio/',
    facebook: 'https://www.facebook.com/cardosolab',
  },
  announcement: 'Ambiente de demonstração — preços e informações são ilustrativos. Nenhum pagamento real é realizado.',
  announcementActive: true,
  homeCategoriesTitle: 'Encontre o exame pela categoria',
  homeFeaturedTitle: 'Exames mais procurados',
  homeFeaturedSubtitle: 'Uma seleção dos exames de rotina mais solicitados. Valores demonstrativos.',
  insurances: ['Unimed', 'Vivest', 'Economus', 'Correios Saúde', 'Bradesco Saúde', 'Cabesp', 'Cassi', 'Hapvida'],
}
