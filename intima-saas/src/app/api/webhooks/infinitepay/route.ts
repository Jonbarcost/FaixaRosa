import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";

interface InfinitePayWebhookBody {
  order_nsu: string;
  invoice_slug?: string;
  transaction_nsu?: string;
}

// A InfinitePay não documenta publicamente uma assinatura HMAC para este
// webhook — então o payload em si NUNCA é tratado como prova de
// pagamento. O único fato que decide se o pedido vira "paid" é a
// resposta de paymentProvider.confirmCharge(), que reconsulta a
// transação direto na API da InfinitePay usando o handle do lojista
// gravado no nosso banco (não o que viria no corpo da requisição).
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as InfinitePayWebhookBody | null;

  if (!body?.order_nsu) {
    return NextResponse.json({ success: false, message: "order_nsu ausente" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, tenant_id, total_cents, status")
    .eq("id", body.order_nsu)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ success: false, message: "pedido não encontrado" }, { status: 400 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ success: true, message: null });
  }

  const { data: tenant } = await admin
    .from("tenants")
    .select("infinitepay_handle")
    .eq("id", order.tenant_id)
    .maybeSingle();

  const paymentProvider = getPaymentProvider();
  const confirmation = await paymentProvider.confirmCharge(order.id, tenant?.infinitepay_handle ?? null);

  if (!confirmation.paid) {
    return NextResponse.json({ success: false, message: "pagamento não confirmado" }, { status: 400 });
  }

  // Aceita valor pago igual ou maior (juros de parcelamento podem elevar o
  // total); nunca aceita valor pago menor que o pedido.
  if (confirmation.paidAmountCents !== null && confirmation.paidAmountCents < order.total_cents) {
    return NextResponse.json({ success: false, message: "valor pago divergente" }, { status: 400 });
  }

  await admin
    .from("orders")
    .update({
      status: "paid",
      payment_reference: confirmation.providerReference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  return NextResponse.json({ success: true, message: null });
}
