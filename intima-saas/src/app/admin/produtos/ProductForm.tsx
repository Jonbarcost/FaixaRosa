"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ProductFormValues {
  id?: string;
  name: string;
  description: string;
  price_cents: number;
  stock: number;
  image_url: string;
  is_explicit: boolean;
  is_published: boolean;
}

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  price_cents: 0,
  stock: 0,
  image_url: "",
  is_explicit: false,
  is_published: false,
};

export function ProductForm({
  tenantId,
  initialValues,
}: {
  tenantId: string;
  initialValues?: ProductFormValues;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? emptyValues);
  const [priceInput, setPriceInput] = useState(
    initialValues ? (initialValues.price_cents / 100).toFixed(2) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...values,
      tenantId,
      price_cents: Math.round(parseFloat(priceInput.replace(",", ".")) * 100) || 0,
    };

    const url = isEditing ? `/api/admin/products/${initialValues!.id}` : "/api/admin/products";
    const response = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Falha ao salvar produto.");
      return;
    }

    router.push(`/admin/produtos?tenant=${tenantId}`);
    router.refresh();
  }

  async function remove() {
    if (!initialValues?.id) return;
    if (!window.confirm("Excluir este produto?")) return;

    setLoading(true);
    const response = await fetch(`/api/admin/products/${initialValues.id}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (!response.ok) {
      setError("Falha ao excluir produto.");
      return;
    }

    router.push(`/admin/produtos?tenant=${tenantId}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">
        Nome
        <input
          required
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
        />
      </label>

      <label className="block text-sm">
        Descrição
        <textarea
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
          rows={3}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          Preço (R$)
          <input
            required
            inputMode="decimal"
            value={priceInput}
            onChange={(event) => setPriceInput(event.target.value)}
            placeholder="0,00"
            className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
          />
        </label>
        <label className="block text-sm">
          Estoque
          <input
            type="number"
            min={0}
            required
            value={values.stock}
            onChange={(event) => setValues({ ...values, stock: Number(event.target.value) })}
            className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
          />
        </label>
      </div>

      <label className="block text-sm">
        URL da imagem
        <input
          value={values.image_url}
          onChange={(event) => setValues({ ...values, image_url: event.target.value })}
          className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.is_explicit}
          onChange={(event) => setValues({ ...values, is_explicit: event.target.checked })}
        />
        Conteúdo explícito (reforça o age-gate na vitrine)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.is_published}
          onChange={(event) => setValues({ ...values, is_published: event.target.checked })}
        />
        Publicado (visível na vitrine)
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-brand-accent px-5 py-2.5 font-medium text-white hover:bg-brand-accentSoft disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={remove}
            disabled={loading}
            className="rounded border border-red-400/50 px-5 py-2.5 text-red-400 hover:bg-red-400/10"
          >
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}
