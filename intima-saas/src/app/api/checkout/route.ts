import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";

interface CheckoutRequestBody {
  tenantSlug: string;
  customerEmail: string;
  items: { productSlug: string; quantity: number }[];
}

// Cria o pedido a partir dos preços gravados no banco — nunca confia no
// preço mandado pelo cliente, só na quantidade e no slug do produto.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as CheckoutRequestBody;

  if (!body.tenantSlug || !body.customerEmail || !body.items?.length) {
    return NextResponse.json({ error: "Dados de checkout incompletos." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, slug, infinitepay_handle")
    .eq("slug", body.tenantSlug)
    .neq("subscription_status", "canceled")
    .maybeSingle();

  if (!tenant) {
    return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });
  }

  const slugs = body.items.map((item) => item.productSlug);
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, price_cents, stock")
    .eq("tenant_id", tenant.id)
    .in("slug", slugs);

  if (!products || products.length !== slugs.length) {
    return NextResponse.json({ error: "Produto inválido no carrinho." }, { status: 400 });
  }

  const totalCents = body.items.reduce((sum, item) => {
    const product = products.find((p) => p.slug === item.productSlug)!;
    return sum + product.price_cents * item.quantity;
  }, 0);

  const { data: customer } = await supabase
    .from("customers")
    .upsert(
      { tenant_id: tenant.id, email: body.customerEmail },
      { onConflict: "tenant_id,email" }
    )
    .select("id")
    .single();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      tenant_id: tenant.id,
      customer_id: customer?.id,
      total_cents: totalCents,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Falha ao criar pedido." }, { status: 500 });
  }

  await supabase.from("order_items").insert(
    body.items.map((item) => {
      const product = products.find((p) => p.slug === item.productSlug)!;
      return {
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity,
        unit_price_cents: product.price_cents,
      };
    })
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const paymentProvider = getPaymentProvider();

  let charge;
  try {
    charge = await paymentProvider.createCharge({
      orderId: order.id,
      amountCents: totalCents,
      currency: "BRL",
      customerEmail: body.customerEmail,
      description: `Pedido ${order.id}`,
      merchantAccountId: tenant.infinitepay_handle,
      webhookUrl: `${appUrl}/api/webhooks/${paymentProvider.name}`,
      redirectUrl: `${appUrl}/loja/${tenant.slug}/pedido/${order.id}`,
    });
  } catch {
    await supabase.from("orders").update({ status: "canceled" }).eq("id", order.id);
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento desta loja." },
      { status: 502 }
    );
  }

  // "authorized" (mock) já resolve na hora; "pending" com checkoutUrl
  // (InfinitePay) só vira "paid" quando o webhook confirmar via
  // confirmCharge() — nunca aqui, de forma otimista.
  await supabase
    .from("orders")
    .update({
      status: charge.status === "authorized" ? "paid" : charge.status === "declined" ? "canceled" : "pending",
      payment_provider: paymentProvider.name,
      payment_reference: charge.providerReference,
    })
    .eq("id", order.id);

  return NextResponse.json({
    orderId: order.id,
    status: charge.status,
    checkoutUrl: charge.checkoutUrl ?? null,
  });
}
