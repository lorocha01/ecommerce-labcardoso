/**
 * Perguntas frequentes — conteúdo editável.
 * Respostas com caráter informativo geral; orientações específicas devem ser
 * confirmadas com a equipe do laboratório.
 */
export interface FaqItem {
  q: string
  a: string
  group: 'compra' | 'preparo' | 'resultados' | 'atendimento'
}

export const faqGroups: Record<FaqItem['group'], string> = {
  compra: 'Compra e pagamento',
  preparo: 'Preparo e coleta',
  resultados: 'Resultados',
  atendimento: 'Atendimento',
}

export const faq: FaqItem[] = [
  {
    group: 'compra',
    q: 'Esta loja realiza vendas reais?',
    a: 'Não. Esta é uma versão demonstrativa da loja virtual do Laboratório Cardoso. Os preços são ilustrativos, nenhum pagamento é processado e nenhum dado é enviado a servidores — tudo fica salvo apenas no seu navegador.',
  },
  {
    group: 'compra',
    q: 'Como funciona a compra de exames pelo site?',
    a: 'Você escolhe os exames, adiciona ao carrinho, informa os dados do paciente, revisa o pedido e escolhe a forma de pagamento. Ao final, recebe um número de pedido para apresentar no laboratório no dia da coleta.',
  },
  {
    group: 'compra',
    q: 'Preciso de pedido médico?',
    a: 'Recomendamos sempre a orientação de um médico para a realização e interpretação dos exames. Leve seu pedido médico, quando houver, no dia da coleta.',
  },
  {
    group: 'compra',
    q: 'Quais formas de pagamento estão disponíveis?',
    a: 'Nesta demonstração você pode simular PIX, cartão de crédito ou pagamento presencial no laboratório. Nenhuma cobrança real é realizada.',
  },
  {
    group: 'compra',
    q: 'Posso usar meu convênio?',
    a: 'O laboratório atende diversos convênios médicos. A compra pelo site é voltada a exames particulares; para usar o convênio, entre em contato pelo telefone ou WhatsApp para confirmar a cobertura.',
  },
  {
    group: 'preparo',
    q: 'Exame de sangue precisa sempre de jejum?',
    a: 'Não. Muitos exames não exigem jejum, enquanto outros, como glicemia, podem exigir. Consulte o preparo indicado na página de cada exame e confirme com a equipe do laboratório.',
  },
  {
    group: 'preparo',
    q: 'Posso tomar água durante o jejum?',
    a: 'Em geral, a ingestão de água é permitida durante o jejum, salvo orientação específica. Em caso de dúvida, fale com o laboratório.',
  },
  {
    group: 'preparo',
    q: 'Devo suspender meus medicamentos antes da coleta?',
    a: 'Não suspenda medicamentos por conta própria. Converse com seu médico e informe à equipe de coleta quais medicamentos você utiliza.',
  },
  {
    group: 'preparo',
    q: 'O que levar no dia da coleta?',
    a: 'Documento oficial com foto, pedido médico (quando houver), o número do seu pedido e, se aplicável, a carteirinha do convênio.',
  },
  {
    group: 'resultados',
    q: 'Como acesso meus resultados?',
    a: 'Pelo portal oficial do laboratório: use o botão “Resultados de Exames” no menu do site ou “Acessar meus resultados” na página inicial. O prazo estimado de cada exame aparece na página do exame.',
  },
  {
    group: 'resultados',
    q: 'Em quanto tempo os resultados ficam prontos?',
    a: 'O prazo varia conforme o exame. Os prazos exibidos na loja são demonstrativos e devem ser confirmados pelo laboratório.',
  },
  {
    group: 'atendimento',
    q: 'Onde fica o laboratório?',
    a: 'Rua Tenente Salviano, 136 – Centro, Pedregulho/SP, CEP 14470-000.',
  },
  {
    group: 'atendimento',
    q: 'O laboratório atende empresas?',
    a: 'Sim. O Laboratório Cardoso realiza análises clínicas para rotinas admissionais, demissionais e preventivas de fábricas, fazendas e empresas. Entre em contato para mais informações.',
  },
]
