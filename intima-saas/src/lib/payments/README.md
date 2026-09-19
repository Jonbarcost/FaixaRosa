# Pagamento

Produtos de sexshop são tratados como categoria de alto risco pelas
principais processadoras. Pesquisa feita antes de codar esta camada:

- **Stripe / Shopify Payments**: não aceitam sex toys. Mesmo negócios já
  aprovados foram descredenciados depois que o banco parceiro da
  processadora revisou a conta.
- **Livexa (Pay)**: plataforma brasileira especializada em sexshop/moda
  íntima, com gateway próprio construído para o segmento.
- **InfinitePay**: pesquisei os Termos de Uso públicos e não encontrei uma
  lista publicada de categorias/MCC proibidos (diferente de outras
  adquirentes que publicam essa lista, ex: Entrepay). Não achei nem
  confirmação nem proibição explícita de produtos de sexshop/moda íntima.
  **Isso não é uma aprovação** — é ausência de informação pública. Antes
  de depender só disso para o negócio, confirme direto com o suporte da
  InfinitePay (o padrão de reclamações no Reclame Aqui mostra bloqueio de
  conta sem explicação detalhada, o que é um risco genérico de qualquer
  adquirente para categoria sensível, não algo específico deste nicho).

## Por que cada lojista recebe na própria conta

A plataforma **não segura o dinheiro do lojista**. Cada tenant conecta o
próprio handle da InfinitePay (a "InfiniteTag" dele) em
`/admin/pagamento`, e o link de checkout gerado credita direto nessa
conta. Se a plataforma tentasse centralizar o recebimento e repassar
depois para cada lojista, isso a caracterizaria como instituição de
pagamento perante o Banco Central — um problema regulatório bem maior do
que este SaaS se propõe a resolver.

## Como funciona a integração com a InfinitePay

Baseado na documentação pública (`infinitepay.io/checkout-documentacao`):

1. `createCharge()` faz `POST https://api.checkout.infinitepay.io/links`
   com `handle` (o `infinitepay_handle` do tenant), `redirect_url`,
   `webhook_url` e os itens do pedido. A resposta traz um `url` de
   checkout hospedado pela InfinitePay (Pix ou cartão) — o cliente é
   redirecionado para lá.
2. O pedido fica com `status = "pending"` até a confirmação — nunca é
   marcado como pago no momento da criação do link, porque nesse ponto
   ninguém pagou nada ainda.
3. A InfinitePay chama `webhook_url`
   (`/api/webhooks/infinitepay`) quando o pagamento é concluído.

## Por que o webhook nunca é confiado sozinho

A documentação pública não descreve um esquema de assinatura HMAC para
esse webhook. Sem isso, qualquer um que descobrisse a URL do webhook
poderia, em tese, forjar uma notificação de "pago". Por isso
`confirmCharge()` sempre **reconsulta a transação diretamente na API da
InfinitePay** (`POST /payment_check`, usando o `handle` gravado no nosso
banco, não o que viria no corpo da requisição) antes de qualquer pedido
virar `"paid"`. O webhook só dispara essa reconsulta — ele não é, por si
só, prova de pagamento. Esse é o mesmo padrão que integrações
de terceiros documentam para essa API ("double check").

## Para plugar uma processadora diferente

1. Implemente `PaymentProvider` (`types.ts`) em `<nome>-provider.ts`.
2. Registre no `switch` de `index.ts`.
3. Configure `PAYMENT_PROVIDER=<nome>`.
4. Se a credencial for por lojista (como o handle da InfinitePay), grave
   numa coluna de `tenants` — nunca em variável de ambiente global — e
   passe via `merchantAccountId` em `PaymentChargeRequest`.
