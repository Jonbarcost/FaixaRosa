import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface PaymentSettingsBody {
  tenantId: string;
  infinitepayHandle: string;
}

// Client de cookie, não service role: a policy "tenant self update" mais
// o grant de coluna (só infinitepay_handle) em 0002_infinitepay.sql
// garantem que só o dono do tenant altera só esse campo — mesmo que o
// corpo da requisição tente mandar outra coisa, o Postgres rejeita.
export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as PaymentSettingsBody;

  if (!body.tenantId) {
    return NextResponse.json({ error: "tenantId ausente." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("tenants")
    .update({ infinitepay_handle: body.infinitepayHandle || null })
    .eq("id", body.tenantId);

  if (error) {
    return NextResponse.json({ error: "Não foi possível salvar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
