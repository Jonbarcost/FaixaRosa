import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddToCartButton } from "./AddToCartButton";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProductPage({
  params,
}: {
  params: { tenantSlug: string; productSlug: string };
}) {
  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) notFound();

  const supabase = createSupabaseServerClient();
  const { data: product } = await supabase
    .from("public_products")
    .select("slug, name, description, price_cents, image_url")
    .eq("tenant_id", tenant.id)
    .eq("slug", params.productSlug)
    .maybeSingle();

  if (!product) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="aspect-square rounded-lg bg-brand-surface">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-xl text-brand-accentSoft">
            {formatBRL(product.price_cents)}
          </p>
          {product.description && (
            <p className="mt-4 text-brand-muted">{product.description}</p>
          )}
          <div className="mt-6">
            <AddToCartButton
              tenantSlug={tenant.slug}
              productSlug={product.slug}
              name={product.name}
              priceCents={product.price_cents}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
