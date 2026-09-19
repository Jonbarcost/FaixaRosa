"use client";

import { useEffect, useState } from "react";

interface AgeGateModalProps {
  tenantSlug: string;
  storeName: string;
}

function storageKey(tenantSlug: string) {
  return `age-verified:${tenantSlug}`;
}

// Confirmação de maioridade por loja, guardada só neste navegador. Não é
// prova de idade real (isso exigiria verificação documental), mas é a
// prática mínima esperada para vitrine de produto adulto no Brasil e
// reduz exposição de menores ao catálogo explícito.
export function AgeGateModal({ tenantSlug, storeName }: AgeGateModalProps) {
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    try {
      const confirmed = window.localStorage.getItem(storageKey(tenantSlug));
      setNeedsConfirmation(confirmed !== "true");
    } catch {
      setNeedsConfirmation(true);
    }
  }, [tenantSlug]);

  if (!needsConfirmation) {
    return null;
  }

  function confirmAge() {
    try {
      window.localStorage.setItem(storageKey(tenantSlug), "true");
    } catch {
      // localStorage indisponível: deixa passar nesta sessão sem persistir.
    }
    setNeedsConfirmation(false);
  }

  function leave() {
    window.location.href = "https://www.google.com";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-w-sm rounded-lg bg-brand-surface p-6 text-center text-brand-text shadow-xl">
        <h2 className="mb-2 text-lg font-semibold">Conteúdo para maiores de 18 anos</h2>
        <p className="mb-6 text-sm text-brand-muted">
          A loja {storeName} vende produtos de bem-estar sexual. Confirme que
          você tem 18 anos ou mais para continuar.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={confirmAge}
            className="rounded bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accentSoft"
          >
            Tenho 18 anos ou mais
          </button>
          <button
            onClick={leave}
            className="rounded border border-brand-muted px-4 py-2 text-sm text-brand-muted hover:bg-white/5"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
