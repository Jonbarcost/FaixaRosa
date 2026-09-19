// Interface abstrata de pagamento. Nenhuma processadora real está integrada
// ainda porque produtos de sexshop são categoria de alto risco: Stripe e
// Shopify Payments recusam o segmento, e a aprovação de uma adquirente de
// alto risco (ou de uma gateway nichada como a Livexa Pay) depende de
// contrato/CNPJ do lojista, não de código. Ver README.md desta pasta.

export interface PaymentChargeRequest {
  orderId: string;
  amountCents: number;
  currency: "BRL";
  customerEmail: string;
  description: string;
}

export interface PaymentChargeResult {
  providerReference: string;
  status: "authorized" | "declined" | "pending";
}

export interface PaymentProvider {
  readonly name: string;
  createCharge(request: PaymentChargeRequest): Promise<PaymentChargeResult>;
  verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean;
}
