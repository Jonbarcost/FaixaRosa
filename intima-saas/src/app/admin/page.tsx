import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

// Login é garantido pelo middleware (src/middleware.ts) para todo /admin/*.
// Aqui só falta checar se o usuário já tem loja — se não tiver, ainda não
// passou pelo onboarding.
export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, slug, store_name, subscription_status")
    .order("created_at", { ascending: false });

  if (!tenants || tenants.length === 0) {
    redirect("/admin/onboarding");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suas lojas</h1>
        <LogoutButton />
      </div>

      <ul className="mt-6 divide-y divide-white/10">
        {tenants.map((tenant) => (
          <li key={tenant.id} className="flex items-center justify-between py-3">
            <div>
              <p>{tenant.store_name}</p>
              <p className="text-sm text-brand-muted">
                Assinatura: {tenant.subscription_status} · Vitrine:{" "}
                <Link href={`/loja/${tenant.slug}`} className="underline">
                  /loja/{tenant.slug}
                </Link>
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/pagamento?tenant=${tenant.id}`}
                className="rounded border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
              >
                Pagamento
              </Link>
              <Link
                href={`/admin/produtos?tenant=${tenant.id}`}
                className="rounded bg-brand-accent px-3 py-1.5 text-sm text-white hover:bg-brand-accentSoft"
              >
                Produtos
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
