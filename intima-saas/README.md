# Plataforma SaaS — Moda Íntima & Sexshop (nome provisório)

SaaS multi-tenant (B2B): lojistas de moda íntima e bem-estar sexual assinam
a plataforma para ter loja online própria (vitrine, catálogo, pedidos),
sem depender de plataformas genéricas que restringem esse tipo de produto.
Projeto separado do Espaço Faixa Rosa (que é um site de afiliado Amazon
para cosméticos) — compartilha o repositório por conveniência, mas não
tem nenhuma relação de código ou domínio com ele.

## Por que este modelo (e não outro)

Pesquisa feita antes de decidir a arquitetura:

- **Existe concorrência direta validada no Brasil**: a Livexa é uma
  plataforma SaaS multi-lojista feita especificamente para sexshop/moda
  íntima, com 14 anos de mercado e gateway de pagamento próprio
  (LivexaPay) — prova que o modelo funciona e mostra o que os lojistas
  desse nicho já esperam de uma plataforma.
- **Plataformas genéricas não servem para este nicho**: Shopify Payments e
  Nuvemshop restringem ou recusam produtos de sexshop. É por isso que o
  Livexa e a Live eCommerce existem como alternativas especializadas.
- **Pagamento é o obstáculo real, não o código**: sex toys são categoria de
  alto risco. Stripe não tem caminho de aprovação geral para o segmento em
  2026; há caso documentado de loja aprovada e depois descredenciada
  quando o banco por trás da processadora revisou a conta. Isso significa
  que aprovar uma adquirente de alto risco é um processo de negócio
  (KYC, contrato, CNPJ) — não algo que se resolve só escrevendo código.

Por isso a v1 do checkout roda com `PAYMENT_PROVIDER=mock` (sandbox, não
move dinheiro real) — ver `src/lib/payments/README.md`. A interface já é
plugável para não exigir reescrever o checkout quando o contrato real
existir.

## Arquitetura

- **Next.js (App Router) + TypeScript + Tailwind.**
- **Supabase (Postgres) com Row Level Security real**: cada lojista
  (`tenant`) só acessa dados do próprio tenant via policy de RLS
  (`auth_tenant_ids()`), não por filtro manual em query — reduz risco de um
  bug de aplicação vazar pedido/cliente de um lojista para outro.
- **Catálogo público via views** (`public_products`, `public_tenant_info`,
  `categories` com policy pública): a vitrine não-autenticada só enxerga
  produtos publicados e dados não sensíveis da loja — nunca estoque
  interno, CNPJ ou e-mail de contato do lojista.
- **Checkout via Route Handler com service role**: cliente final não é um
  `tenant_user`, então a escrita de pedido roda em `/api/checkout` com a
  service role key (nunca exposta ao navegador), recalculando o preço a
  partir do banco — nunca confia no valor mandado pelo cliente.
- **Age-gate por loja**: confirmação de maioridade salva em
  `localStorage`, por tenant. Não é verificação documental de idade — é a
  prática mínima esperada nesse tipo de vitrine, não uma barreira legal
  robusta.

## Rodando localmente

```bash
cd intima-saas
npm install
cp .env.example .env.local   # preencher com um projeto Supabase próprio
# aplicar supabase/migrations/0001_init.sql no projeto Supabase
npm run dev
```

## Gaps conhecidos (não construído ainda)

- **Login/cadastro do lojista**: `/admin` assume sessão Supabase Auth já
  existente; não há tela de login/signup nem fluxo de convite de equipe.
- **Cobrança da própria assinatura SaaS** (o lojista pagando a
  plataforma): a tabela `plans` existe no schema, mas não há integração de
  cobrança recorrente nem enforcement de `max_products`/bloqueio por
  inadimplência.
- **Gateway de pagamento real**: nenhuma processadora de verdade
  integrada — decisão de negócio pendente (ver acima).
- **Frete e embalagem discreta**: coluna `discreet_packaging` existe no
  pedido, mas não há integração com transportadora (Melhor Envio é citado
  como usado no setor, mas não avaliado a fundo ainda).
- **CRUD de produto no painel do lojista**: só existe leitura hoje
  (`/admin`); cadastro/edição de produto ainda não tem tela.
- **Sem testes automatizados.**

## Sobre "monetização rápida"

Este projeto resolve um problema real de nicho (falta de plataforma
especializada + fricção de pagamento), o que é a base legítima de
monetização aqui — não existe atalho que substitua fechar contrato com
uma processadora de alto risco e conquistar os primeiros lojistas pagantes.
