import { redirect } from "next/navigation";
import { ProductForm } from "../ProductForm";

export default function NewProductPage({
  searchParams,
}: {
  searchParams: { tenant?: string };
}) {
  if (!searchParams.tenant) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Novo produto</h1>
      <ProductForm tenantId={searchParams.tenant} />
    </main>
  );
}
