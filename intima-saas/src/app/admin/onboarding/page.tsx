"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeName }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível criar a loja.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Crie sua loja</h1>
      <p className="mt-2 text-sm text-brand-muted">
        É o nome que vai aparecer na sua vitrine pública.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">
          Nome da loja
          <input
            required
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand-accent px-5 py-2.5 font-medium text-white hover:bg-brand-accentSoft disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar loja"}
        </button>
      </form>
    </main>
  );
}
