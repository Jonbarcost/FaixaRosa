import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface UpdateProductBody {
  name: string;
  description: string;
  price_cents: number;
  stock: number;
  image_url: string;
  is_explicit: boolean;
  is_published: boolean;
}

// PATCH/DELETE também rodam com o client de cookie: a policy RLS filtra
// por tenant_id in auth_tenant_ids(), então tentar editar/excluir produto
// de outro lojista simplesmente não afeta nenhuma linha (RLS silenciosa,
// sem vazar se o id existe em outro tenant).
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const body = (await request.json()) as UpdateProductBody;
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: body.name.trim(),
      description: body.description || null,
      price_cents: body.price_cents,
      stock: body.stock,
      image_url: body.image_url || null,
      is_explicit: body.is_explicit,
      is_published: body.is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.productId);

  if (error) {
    return NextResponse.json({ error: "Não foi possível salvar o produto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("products").delete().eq("id", params.productId);

  if (error) {
    return NextResponse.json({ error: "Não foi possível excluir o produto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
