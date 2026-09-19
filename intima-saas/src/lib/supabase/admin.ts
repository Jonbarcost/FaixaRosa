import { createClient } from "@supabase/supabase-js";

// Service role: bypassa RLS. Só pode ser importado por código que roda no
// servidor (Route Handlers / Server Actions) — nunca em Client Components,
// nunca com prefixo NEXT_PUBLIC_. Usado para escrever pedidos de clientes
// finais, que não são tenant_users e por isso não passariam pelas policies
// de RLS de "orders"/"customers".
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
