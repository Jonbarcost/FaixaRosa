"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Se o projeto Supabase exige confirmação de e-mail, não há sessão
    // ainda — o cadastro da loja acontece no primeiro login (ver
    // /admin/onboarding, disparado pelo dashboard quando não há tenant).
    if (!data.session) {
      setNeedsEmailConfirmation(true);
      return;
    }

    router.push("/admin/onboarding");
  }

  if (needsEmailConfirmation) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16">
        <h1 className="text-2xl font-semibold">Confirme seu e-mail</h1>
        <p className="mt-4 text-brand-muted">
          Enviamos um link de confirmação para {email}. Depois de confirmar,
          faça login para criar sua loja.
        </p>
        <Link href="/admin/login" className="mt-4 inline-block text-brand-accentSoft underline">
          Ir para o login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Criar conta</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
          />
        </label>
        <label className="block text-sm">
          Senha
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-white/10 bg-brand-surface px-3 py-2 text-brand-text"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand-accent px-5 py-2.5 font-medium text-white hover:bg-brand-accentSoft disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-4 text-sm text-brand-muted">
        Já tem conta?{" "}
        <Link href="/admin/login" className="text-brand-accentSoft underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
