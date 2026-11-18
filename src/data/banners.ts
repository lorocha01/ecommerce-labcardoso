import type { Banner } from '@/types'

/** Banners da página inicial (editáveis em /admin/banners). */
export const banners: Banner[] = [
  {
    id: 'banner-principal',
    eyebrow: 'Dedicação e confiança desde 1974',
    title: 'Cuide da sua saúde com',
    highlight: 'praticidade e confiança.',
    subtitle:
      'Encontre seus exames laboratoriais, consulte informações de preparo e tenha mais facilidade para cuidar de você e da sua família.',
    art: 'lab',
    primaryText: 'Confira nossos exames',
    primaryLink: '/exames',
    secondaryText: 'Conheça o laboratório',
    secondaryLink: '/sobre',
    active: true,
    order: 1,
  },
  {
    id: 'banner-checkup',
    eyebrow: 'Check-ups demonstrativos',
    title: 'Sua rotina de exames em',
    highlight: 'um só pedido.',
    subtitle:
      'Combinações práticas para acompanhar a saúde com o seu médico. Escolha, simule a compra e leve o pedido no dia da coleta.',
    art: 'checkup',
    primaryText: 'Ver check-ups',
    primaryLink: '/categorias/check-ups',
    secondaryText: 'Como funciona',
    secondaryLink: '/faq',
    active: true,
    order: 2,
  },
  {
    id: 'banner-familia',
    eyebrow: 'Do campo até a cidade',
    title: 'Cuidando daquilo que',
    highlight: 'realmente importa.',
    subtitle:
      'Análises clínicas para pacientes, fábricas, fazendas e empresas — rotinas admissionais, demissionais e preventivas.',
    art: 'family',
    primaryText: 'Exames ocupacionais',
    primaryLink: '/exames/check-up-admissional',
    secondaryText: 'Fale conosco',
    secondaryLink: '/contato',
    active: true,
    order: 3,
  },
]
