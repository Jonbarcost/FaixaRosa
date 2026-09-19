"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PaymentSettingsForm({
  tenantId,
  initialHandle,
}: {
  tenantId: string;
  initialHandle: string;
}) {
  const router = useRouter();
  const [handle, setHandle] = useState(initialHandle);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");

    const response = await fetch("/api/admin/payment-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, infinitepayHandle: handle.trim() }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">
        Handle da InfinitePay (sua InfiniteTag)
        <input
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="ex: minhaloja"
          className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
        />
      </label>
      <p className="text-sm text-brand-muted">
        O pagamento cai direto na sua conta InfinitePay — a plataforma não
        chega a receber esse dinheiro.
      </p>

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded bg-brand-accent px-5 py-2.5 font-medium text-white hover:bg-brand-accentSoft disabled:opacity-50"
      >
        {status === "saving" ? "Salvando..." : "Salvar"}
      </button>

      {status === "saved" && <p className="text-sm text-green-400">Salvo.</p>}
      {status === "error" && (
        <p className="text-sm text-red-400">Não foi possível salvar.</p>
      )}
    </form>
  );
}
