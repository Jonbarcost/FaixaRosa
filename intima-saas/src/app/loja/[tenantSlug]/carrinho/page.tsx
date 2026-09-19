"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readCart, type CartItem } from "@/lib/cart";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CartPage({ params }: { params: { tenantSlug: string } }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart(params.tenantSlug));
  }, [params.tenantSlug]);

  const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Carrinho</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-brand-muted">Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-white/10">
            {items.map((item) => (
              <li key={item.productSlug} className="flex justify-between py-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatBRL(item.priceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatBRL(totalCents)}</span>
          </div>
          <Link
            href={`/loja/${params.tenantSlug}/checkout`}
            className="mt-6 block rounded bg-brand-accent px-5 py-2.5 text-center font-medium text-white hover:bg-brand-accentSoft"
          >
            Ir para o checkout
          </Link>
        </>
      )}
    </main>
  );
}
