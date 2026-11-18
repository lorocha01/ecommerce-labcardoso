# Laboratório Cardoso — E-commerce de exames (demonstrativo)

Loja virtual e painel administrativo **100% frontend** para o Laboratório Cardoso (Pedregulho/SP — *Dedicação e confiança desde 1974*).
Não há banco de dados, APIs externas, gateway de pagamento ou integração com sistemas laboratoriais: todos os dados são fictícios e ficam no **LocalStorage** do navegador.

> ⚠️ **Ambiente de demonstração.** Preços, prazos e orientações clínicas são ilustrativos e estão marcados como "demonstrativos" na interface. Nenhum pagamento é processado. A autenticação (paciente e admin) **não é segura para produção**.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção em dist/
npm run preview    # serve o build
```

### Acessos de demonstração

| Área | Usuário | Senha |
|---|---|---|
| Painel administrativo (`/admin/login`) | `admin` | `Cardoso@2026` |
| Área do paciente (`/minha-conta`) | `paciente@demo.test` | `demo1234` |

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Zustand (estado + persistência) · React Router · Framer Motion · Recharts · Lucide · Sonner.
Fontes (Fraunces + Plus Jakarta Sans) empacotadas localmente via `@fontsource` — nenhuma dependência externa em tempo de execução.

## Rotas

**Loja:** `/` · `/exames` · `/exames/:id` · `/categorias/:slug` · `/carrinho` · `/checkout` · `/minha-conta` · `/pedidos` · `/pedidos/:id` · `/favoritos` · `/sobre` · `/contato` · `/faq` · `/politica-de-privacidade` · `/termos-de-uso`

**Admin:** `/admin/login` · `/admin` · `/admin/pedidos` · `/admin/pedidos/:id` · `/admin/exames` · `/admin/categorias` · `/admin/clientes` · `/admin/financeiro` · `/admin/banners` · `/admin/atividades` · `/admin/configuracoes`

## Estrutura

```
src/
├── data/            ← DADOS INICIAIS EDITÁVEIS (seed)
│   ├── products.ts      catálogo de exames
│   ├── categories.ts    categorias
│   ├── orders.ts        gerador de pedidos demonstrativos
│   ├── users.ts         usuários fictícios + credenciais demo
│   ├── banners.ts       banners da home
│   ├── settings.ts      dados institucionais e de contato
│   └── faq.ts           perguntas frequentes
├── store/
│   ├── index.ts         STORE ÚNICO: carrinho, favoritos, pedidos, exames, categorias,
│   │                    banners, configurações, log — persistido no LocalStorage
│   ├── hooks.ts         seletores (catálogo público, carrinho, pedidos do paciente)
│   ├── validate.ts      saneamento de dados corrompidos/importados
│   ├── adminAuth.ts     autenticação administrativa demonstrativa
│   └── adminPrefs.ts    preferências do painel (período, sidebar)
├── lib/             utilitários (busca inteligente, analytics, CSV, máscaras, formatação)
├── components/      ui · layout · product · home · checkout · admin
└── pages/           páginas da loja e pages/admin/*
```

## Integração loja ↔ painel

Loja e painel leem e escrevem no **mesmo store** (`src/store/index.ts`):

- Compra simulada no checkout → pedido aparece em `/admin/pedidos` e nos indicadores.
- Alteração de status no admin → atualiza dashboard, histórico e a área do paciente.
- Preço/descrição/categoria editados → refletem no catálogo, detalhes e carrinho.
- Exame ou categoria desativados → deixam de aparecer na loja.
- Banners e configurações → refletem na home, cabeçalho, rodapé e páginas institucionais.
- Abas abertas são sincronizadas via evento `storage`.

## Persistência e dados

- Chave do LocalStorage: `labcardoso:store`.
- **Configurações → Dados da demonstração**: exportar JSON, importar JSON e restaurar dados de demonstração.
- Dados corrompidos ou ausentes são detectados por coleção e restaurados do seed, com aviso ao usuário.
- CPF é sempre armazenado mascarado (só os 2 últimos dígitos); dados de cartão não são armazenados.

## Substituindo pelos dados reais

1. Edite `src/data/*.ts` (ou use o painel) com os exames, preços, prazos e preparos oficiais.
2. Em cada exame validado, altere `dataStatus` para `'oficial'` — o aviso de "conteúdo demonstrativo" deixa de aparecer na página do exame.
3. Confirme horários em `src/data/settings.ts` e remova `hoursNote`.

## Preparado para backend

As ações do store têm assinaturas estáveis (`placeOrder`, `updateProduct`, `updateOrderStatus`, …). Para integrar uma API, substitua a implementação dessas ações por chamadas HTTP e o `persist` por cache/sincronização — os componentes não precisam mudar. A autenticação está isolada em `adminAuth.ts` e nas ações `login/register` do store.

## Deploy

SPA estática. Inclui `vercel.json` e `public/_redirects` (Netlify) para fallback de rotas.
