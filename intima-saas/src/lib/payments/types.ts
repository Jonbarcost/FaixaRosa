// Interface abstrata de pagamento. A InfinitePay (ver infinitepay-provider.ts)
// não documenta publicamente uma lista de categorias proibidas nem um
// esquema de assinatura HMAC para o webhook — por isso o contrato exige
// confirmCharge(), que reconsulta a transação direto na API da
// processadora antes de qualquer pedido ser marcado como pago. Nunca
// confiar só no corpo de um webhook recebido.

export interface PaymentChargeRequest {
  orderId: string;
  amountCents: number;
  currency: "BRL";
  customerEmail: string;
  description: string;
  // Identificador da conta do LOJISTA na processadora (ex: handle da
  // InfinitePay). O dinheiro cai direto nessa conta — a plataforma nunca
  // segura o valor do lojista.
  merchantAccountId: string | null;
  webhookUrl: string;
  redirectUrl: string;
}

export interface PaymentChargeResult {
  providerReference: string;
  status: "authorized" | "declined" | "pending";
  // Presente quando o pagamento exige que o cliente seja redirecionado
  // para uma página hospedada pela processadora (caso da InfinitePay).
  // Ausente quando o provider já resolve tudo de forma síncrona (mock).
  checkoutUrl?: string;
}

export interface PaymentConfirmation {
  paid: boolean;
  paidAmountCents: number | null;
  providerReference: string | null;
}

export interface PaymentProvider {
  readonly name: string;
  createCharge(request: PaymentChargeRequest): Promise<PaymentChargeResult>;
  // Reconsulta a transação na processadora a partir do orderId. Todo
  // webhook precisa chamar isto antes de confiar no próprio payload.
  confirmCharge(orderId: string, merchantAccountId: string | null): Promise<PaymentConfirmation>;
}
