import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: { tenant?: string };
}) {
  if (!searchParams.tenant) {
    redirect("/admin");
  }

  const supabase = createSupabaseServerClient();

  // RLS ("products scoped to tenant") garante que só voltam linhas do
  // tenant do usuário logado, mesmo que o query param seja adulterado.
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_cents, stock, is_published")
    .eq("tenant_id", searchParams.tenant)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Link
          href={`/admin/produtos/novo?tenant=${searchParams.tenant}`}
          className="rounded bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accentSoft"
        >
          + Novo produto
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-white/10">
        {(products ?? []).map((product) => (
          <li key={product.id} className="flex items-center justify-between py-3">
            <div>
              <p>{product.name}</p>
              <p className="text-sm text-brand-muted">
                {formatBRL(product.price_cents)} · estoque {product.stock} ·{" "}
                {product.is_published ? "publicado" : "rascunho"}
              </p>
            </div>
            <Link href={`/admin/produtos/${product.id}`} className="text-sm underline">
              Editar
            </Link>
          </li>
        ))}
        {(products ?? []).length === 0 && (
          <p className="py-6 text-brand-muted">Nenhum produto cadastrado ainda.</p>
        )}
      </ul>
    </main>
  );
}
