import { createSupabaseServerClient } from "./supabase/server";

export interface Tenant {
  id: string;
  slug: string;
  store_name: string;
  age_gate_required: boolean;
  subscription_status: string;
}

// Resolve a loja pelo slug na URL (/loja/[tenantSlug]/...). Lojas com
// assinatura cancelada não aparecem — a vitrine cai fora do ar junto com
// o pagamento do SaaS, por desenho.
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("public_tenant_info")
    .select("id, slug, store_name, age_gate_required, subscription_status")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
