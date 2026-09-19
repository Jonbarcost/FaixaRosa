import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { AgeGateModal } from "@/components/AgeGateModal";

export default async function TenantStorefront({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const tenant = await getTenantBySlug(params.tenantSlug);

  if (!tenant) {
    notFound();
  }

  const supabase = createSupabaseServerClient();
  const { data: products } = await supabase
    .from("public_products")
    .select("slug, name, price_cents, image_url")
    .eq("tenant_id", tenant.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {tenant.age_gate_required && (
        <AgeGateModal tenantSlug={tenant.slug} storeName={tenant.store_name} />
      )}

      <h1 className="text-2xl font-semibold">{tenant.store_name}</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {(products ?? []).map((product) => (
          <ProductCard key={product.slug} tenantSlug={tenant.slug} product={product} />
        ))}
        {(products ?? []).length === 0 && (
          <p className="col-span-full text-brand-muted">
            Esta loja ainda não publicou produtos.
          </p>
        )}
      </div>
    </main>
  );
}
