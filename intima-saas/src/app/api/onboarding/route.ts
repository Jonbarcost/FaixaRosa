import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

interface OnboardingRequestBody {
  storeName: string;
}

// Cria a primeira loja (tenant) de um usuário recém-autenticado. Roda com
// a service role porque "tenants" e "tenant_users" não têm policy de
// INSERT para o usuário comum — só o dono (via auth_tenant_ids()) pode ler
// depois de já existir o vínculo, então o vínculo em si tem que ser
// criado num contexto que bypassa RLS. O auth.uid() vem da sessão do
// cookie, nunca do corpo da requisição — o cliente não escolhe por quem
// está criando a loja.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as OnboardingRequestBody;

  if (!body.storeName?.trim()) {
    return NextResponse.json({ error: "Nome da loja é obrigatório." }, { status: 400 });
  }

  const supabaseAuth = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: existingLink } = await admin
    .from("tenant_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existingLink) {
    return NextResponse.json({ error: "Usuário já tem uma loja." }, { status: 409 });
  }

  const baseSlug = slugify(body.storeName) || "loja";
  let slug = baseSlug;
  let tenantId: string | null = null;

  for (let attempt = 0; attempt < 5 && !tenantId; attempt++) {
    const candidateSlug = attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: tenant, error: tenantError } = await admin
      .from("tenants")
      .insert({
        slug: candidateSlug,
        store_name: body.storeName.trim(),
        contact_email: user.email,
      })
      .select("id, slug")
      .single();

    if (!tenantError && tenant) {
      tenantId = tenant.id;
      slug = tenant.slug;
    } else if (tenantError?.code !== "23505") {
      // Erro que não é "slug duplicado": não adianta tentar de novo.
      return NextResponse.json({ error: "Falha ao criar loja." }, { status: 500 });
    }
  }

  if (!tenantId) {
    return NextResponse.json({ error: "Não foi possível gerar um slug único." }, { status: 500 });
  }

  const { error: linkError } = await admin.from("tenant_users").insert({
    tenant_id: tenantId,
    auth_user_id: user.id,
    role: "owner",
  });

  if (linkError) {
    return NextResponse.json({ error: "Falha ao vincular usuário à loja." }, { status: 500 });
  }

  return NextResponse.json({ slug });
}
