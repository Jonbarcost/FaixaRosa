import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock-provider";

// Troca de processadora é uma variável de ambiente, não um redeploy de código.
// Quando houver contrato com uma adquirente de alto risco, implemente
// PaymentProvider (ver types.ts) em um novo arquivo e registre aqui.
export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER ?? "mock";

  switch (configured) {
    case "mock":
      return new MockPaymentProvider();
    default:
      throw new Error(
        `PAYMENT_PROVIDER="${configured}" não tem implementação registrada em src/lib/payments/index.ts`
      );
  }
}
