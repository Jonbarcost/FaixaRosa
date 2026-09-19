import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface OrderStatus {
  id: string;
  tenant_id: string;
  status: string;
  total_cents: number;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando confirmação do pagamento",
  paid: "Pagamento confirmado",
  canceled: "Pagamento não concluído",
  shipped: "Enviado",
  delivered: "Entregue",
  refunded: "Reembolsado",
};

// Página para onde a InfinitePay redireciona o cliente depois do checkout.
// O webhook pode chegar alguns segundos depois do redirect — por isso o
// status aqui pode aparecer "pending" por um instante mesmo com o
// pagamento já aprovado.
export default async function OrderStatusPage({
  params,
}: {
  params: { tenantSlug: string; orderId: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .rpc("get_order_status", { order_id_param: params.orderId })
    .maybeSingle();
  const order = data as OrderStatus | null;

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">
        {STATUS_LABEL[order.status] ?? order.status}
      </h1>
      <p className="mt-2 text-brand-muted">
        Pedido {order.id} · {formatBRL(order.total_cents)}
      </p>
      {order.status === "pending" && (
        <p className="mt-6 text-sm text-brand-muted">
          Se você já pagou, atualize esta página em alguns segundos.
        </p>
      )}
    </main>
  );
}
