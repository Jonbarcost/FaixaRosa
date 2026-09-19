"use client";

import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";

export function AddToCartButton({
  tenantSlug,
  productSlug,
  name,
  priceCents,
}: {
  tenantSlug: string;
  productSlug: string;
  name: string;
  priceCents: number;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        addToCart(tenantSlug, { productSlug, name, priceCents, quantity: 1 });
        router.push(`/loja/${tenantSlug}/carrinho`);
      }}
      className="rounded bg-brand-accent px-5 py-2.5 font-medium text-white hover:bg-brand-accentSoft"
    >
      Adicionar ao carrinho
    </button>
  );
}
