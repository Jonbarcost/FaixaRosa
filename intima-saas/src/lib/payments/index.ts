import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock-provider";
import { InfinitePayProvider } from "./infinitepay-provider";

// Troca de processadora é uma variável de ambiente, não um redeploy de
// código. A credencial específica de cada lojista (ex: handle da
// InfinitePay) não vive aqui — vive em tenants.<coluna>, porque cada
// tenant recebe na própria conta.
export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER ?? "mock";

  switch (configured) {
    case "mock":
      return new MockPaymentProvider();
    case "infinitepay":
      return new InfinitePayProvider();
    default:
      throw new Error(
        `PAYMENT_PROVIDER="${configured}" não tem implementação registrada em src/lib/payments/index.ts`
      );
  }
}
