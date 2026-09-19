# Pagamento

Produtos de sexshop são tratados como categoria de alto risco pelas
principais processadoras. Pesquisa feita antes de codar esta camada:

- **Stripe / Shopify Payments**: não aceitam sex toys. Mesmo negócios já
  aprovados foram descredenciados depois que o banco parceiro da
  processadora revisou a conta (caso documentado: loja processando milhões
  foi cortada pela Wells Fargo, banco por trás da Stripe).
- **Mercado Pago / PagSeguro**: não encontrei política pública específica
  para o nicho — precisa validar diretamente com eles antes de assumir que
  aceitam.
- **Livexa (Pay)**: plataforma brasileira especializada em sexshop/moda
  íntima, com gateway próprio construído para o segmento — é a referência
  direta de mercado para esse problema.

## Consequência para a arquitetura

Este diretório expõe uma interface (`PaymentProvider`) em vez de uma
integração fixa. O motivo: aprovação de processadora de alto risco é um
processo de negócio (KYC, contrato, CNPJ do lojista) que roda em paralelo
ao desenvolvimento, não algo que se resolve escrevendo código. Até lá, o
app roda com `MockPaymentProvider` (autoriza tudo, não move dinheiro) para
permitir testar e demonstrar o fluxo de checkout.

## Para plugar uma processadora real

1. Implemente `PaymentProvider` (`types.ts`) em `<nome>-provider.ts`.
2. Registre no `switch` de `index.ts`.
3. Configure `PAYMENT_PROVIDER=<nome>` e as credenciais no `.env`.
4. Nunca commitar chave/segredo real — usar apenas variável de ambiente.
