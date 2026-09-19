import Link from "next/link";

export interface ProductCardData {
  slug: string;
  name: string;
  price_cents: number;
  image_url: string | null;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProductCard({
  tenantSlug,
  product,
}: {
  tenantSlug: string;
  product: ProductCardData;
}) {
  return (
    <Link
      href={`/loja/${tenantSlug}/produto/${product.slug}`}
      className="group block overflow-hidden rounded-lg bg-brand-surface transition hover:ring-1 hover:ring-brand-accentSoft"
    >
      <div className="aspect-square bg-black/30">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-brand-muted">
            Sem imagem
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm text-brand-text">{product.name}</p>
        <p className="mt-1 text-sm font-semibold text-brand-accentSoft">
          {formatBRL(product.price_cents)}
        </p>
      </div>
    </Link>
  );
}
