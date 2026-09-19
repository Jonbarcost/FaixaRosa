import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaymentSettingsForm } from "./PaymentSettingsForm";

export default async function PaymentSettingsPage({
  searchParams,
}: {
  searchParams: { tenant?: string };
}) {
  if (!searchParams.tenant) {
    redirect("/admin");
  }

  const supabase = createSupabaseServerClient();

  // RLS ("tenant self read") garante que só volta se o tenant pedido for
  // do usuário logado.
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, infinitepay_handle")
    .eq("id", searchParams.tenant)
    .maybeSingle();

  if (!tenant) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-semibold">Pagamento</h1>
      <PaymentSettingsForm
        tenantId={tenant.id}
        initialHandle={tenant.infinitepay_handle ?? ""}
      />
    </main>
  );
}
