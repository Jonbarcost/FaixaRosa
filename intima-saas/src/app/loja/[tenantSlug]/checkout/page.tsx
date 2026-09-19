"use client";

import { useEffect, useState } from "react";
import { readCart, clearCart, type CartItem } from "@/lib/cart";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CheckoutPage({ params }: { params: { tenantSlug: string } }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setItems(readCart(params.tenantSlug));
  }, [params.tenantSlug]);

  const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: params.tenantSlug,
          customerEmail: email,
          items: items.map((item) => ({
            productSlug: item.productSlug,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error("checkout failed");

      const data = await response.json();
      setOrderId(data.orderId);
      clearCart(params.tenantSlug);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Pedido confirmado</h1>
        <p className="mt-2 text-brand-muted">
          Número do pedido: <span className="text-brand-text">{orderId}</span>
        </p>
        <p className="mt-4 text-sm text-brand-muted">
          Pagamento em modo de teste (sandbox) — nenhum valor real foi cobrado.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <div className="mt-4 flex justify-between text-sm text-brand-muted">
        <span>{items.length} item(ns)</span>
        <span>{formatBRL(totalCents)}</span>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">
          E-mail para confirmação do pedido
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
          />
        </label>

        <button
          type="submit"
          disabled={status === "submitting" || items.length === 0}
          className="w-full rounded bg-brand-accent px-5 py-2.5 font-medium text-white hover:bg-brand-accentSoft disabled:opacity-50"
        >
          {status === "submitting" ? "Processando..." : "Finalizar pedido"}
        </button>

        {status === "error" && (
          <p className="text-sm text-red-400">
            Não foi possível concluir o pedido. Tente novamente.
          </p>
        )}
      </form>
    </main>
  );
}
