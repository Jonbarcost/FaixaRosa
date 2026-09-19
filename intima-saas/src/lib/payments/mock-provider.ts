import type {
  PaymentChargeRequest,
  PaymentChargeResult,
  PaymentConfirmation,
  PaymentProvider,
} from "./types";

// Provider de sandbox: sempre autoriza na hora, sem redirecionamento e sem
// mover dinheiro de verdade. Existe para testar o fluxo completo de
// checkout antes de haver contrato com uma processadora real.
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createCharge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    return {
      providerReference: `mock_${request.orderId}_${Date.now()}`,
      status: "authorized",
    };
  }

  async confirmCharge(orderId: string): Promise<PaymentConfirmation> {
    return {
      paid: true,
      paidAmountCents: null,
      providerReference: `mock_confirm_${orderId}`,
    };
  }
}
