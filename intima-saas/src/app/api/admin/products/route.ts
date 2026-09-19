import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

interface CreateProductBody {
  tenantId: string;
  name: string;
  description: string;
  price_cents: number;
  stock: number;
  image_url: string;
  is_explicit: boolean;
  is_published: boolean;
}

// Usa o client autenticado por cookie (não a service role): a policy RLS
// "products scoped to tenant" já garante que o insert só funciona se
// tenantId pertencer ao usuário logado — não precisa revalidar isso aqui.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateProductBody;

  if (!body.tenantId || !body.name?.trim()) {
    return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const baseSlug = slugify(body.name) || "produto";

  const { error } = await supabase.from("products").insert({
    tenant_id: body.tenantId,
    slug: `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`,
    name: body.name.trim(),
    description: body.description || null,
    price_cents: body.price_cents,
    stock: body.stock,
    image_url: body.image_url || null,
    is_explicit: body.is_explicit,
    is_published: body.is_published,
  });

  if (error) {
    return NextResponse.json({ error: "Não foi possível criar o produto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
