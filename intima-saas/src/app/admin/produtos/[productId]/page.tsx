import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const supabase = createSupabaseServerClient();

  // RLS já restringe a leitura ao tenant do usuário logado — se o produto
  // não for dele, a query volta vazia e cai no notFound(), não num erro
  // de permissão que vazaria a existência do registro.
  const { data: product } = await supabase
    .from("products")
    .select("id, tenant_id, name, description, price_cents, stock, image_url, is_explicit, is_published")
    .eq("id", params.productId)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Editar produto</h1>
      <ProductForm
        tenantId={product.tenant_id}
        initialValues={{
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          price_cents: product.price_cents,
          stock: product.stock,
          image_url: product.image_url ?? "",
          is_explicit: product.is_explicit,
          is_published: product.is_published,
        }}
      />
    </main>
  );
}
