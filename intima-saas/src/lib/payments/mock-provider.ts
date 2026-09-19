import type { PaymentChargeRequest, PaymentChargeResult, PaymentProvider } from "./types";

// Provider de sandbox: sempre autoriza, nunca move dinheiro de verdade.
// Existe para permitir testar o fluxo completo de checkout (carrinho →
// pedido → confirmação) antes de haver contrato com uma processadora real.
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createCharge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    return {
      providerReference: `mock_${request.orderId}_${Date.now()}`,
      status: "authorized",
    };
  }

  verifyWebhookSignature(): boolean {
    return true;
  }
}
