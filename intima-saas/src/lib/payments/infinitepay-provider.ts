import type {
  PaymentChargeRequest,
  PaymentChargeResult,
  PaymentConfirmation,
  PaymentProvider,
} from "./types";

const LINKS_ENDPOINT = "https://api.checkout.infinitepay.io/links";
const PAYMENT_CHECK_ENDPOINT = "https://api.checkout.infinitepay.io/payment_check";

// Integração com o "Checkout Integrado" da InfinitePay (link de pagamento
// com Pix ou cartão). Baseado na documentação pública em
// infinitepay.io/checkout-documentacao — não há SDK oficial nem chave de
// API tradicional: a identidade do lojista na chamada é o próprio
// "handle" (a InfiniteTag dele), guardado em tenants.infinitepay_handle.
//
// Importante: a InfinitePay não documenta publicamente uma assinatura
// HMAC para o webhook. Por isso este provider nunca confia no payload do
// webhook sozinho — confirmCharge() sempre reconsulta a transação via
// /payment_check antes de qualquer pedido virar "pago" (ver
// src/app/api/webhooks/infinitepay/route.ts).
export class InfinitePayProvider implements PaymentProvider {
  readonly name = "infinitepay";

  async createCharge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    if (!request.merchantAccountId) {
      throw new Error(
        "Loja sem infinitepay_handle configurado — não é possível gerar link de pagamento."
      );
    }

    const response = await fetch(LINKS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: request.merchantAccountId,
        redirect_url: request.redirectUrl,
        webhook_url: request.webhookUrl,
        order_nsu: request.orderId,
        items: [
          {
            quantity: 1,
            price: request.amountCents,
            description: request.description,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`InfinitePay recusou a criação do link (HTTP ${response.status}).`);
    }

    const data = (await response.json()) as { url: string };

    return {
      providerReference: request.orderId,
      status: "pending",
      checkoutUrl: data.url,
    };
  }

  async confirmCharge(
    orderId: string,
    merchantAccountId: string | null
  ): Promise<PaymentConfirmation> {
    if (!merchantAccountId) {
      return { paid: false, paidAmountCents: null, providerReference: null };
    }

    const response = await fetch(PAYMENT_CHECK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: merchantAccountId,
        order_nsu: orderId,
      }),
    });

    if (!response.ok) {
      return { paid: false, paidAmountCents: null, providerReference: null };
    }

    const data = (await response.json()) as {
      success: boolean;
      paid: boolean;
      paid_amount?: number;
    };

    return {
      paid: Boolean(data.success && data.paid),
      paidAmountCents: data.paid_amount ?? null,
      providerReference: orderId,
    };
  }
}
