import { createSupabaseServerClient } from "@/lib/supabase/server";

// Painel do lojista. Login/cadastro (Supabase Auth) ainda não tem UI própria
// — ver README.md "Gaps conhecidos". Esta página assume uma sessão já
// autenticada e lista apenas o(s) tenant(s) daquele usuário, via RLS.
export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-brand-muted">
          Login do lojista ainda não implementado nesta v1. Ver
          README.md do projeto — "Gaps conhecidos".
        </p>
      </main>
    );
  }

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, store_name, subscription_status")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Suas lojas</h1>
      <ul className="mt-6 divide-y divide-white/10">
        {(tenants ?? []).map((tenant) => (
          <li key={tenant.id} className="py-3">
            <p>{tenant.store_name}</p>
            <p className="text-sm text-brand-muted">
              Assinatura: {tenant.subscription_status}
            </p>
          </li>
        ))}
        {(tenants ?? []).length === 0 && (
          <p className="text-brand-muted">Nenhuma loja associada a este usuário.</p>
        )}
      </ul>
    </main>
  );
}
