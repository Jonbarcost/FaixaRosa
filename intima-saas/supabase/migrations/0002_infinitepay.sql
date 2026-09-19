-- Cada lojista recebe direto na própria conta InfinitePay (handle/"infinite
-- tag" dele) — a plataforma nunca segura o dinheiro do lojista. Isso evita
-- que o SaaS precise virar uma instituição de pagamento (autorização do
-- Bacen) só para repassar valor entre contas.

alter table tenants add column infinitepay_handle text;

-- Só o dono/staff do próprio tenant pode alterar os dados da loja
-- (inclusive o handle de pagamento). Não existia policy de UPDATE em
-- "tenants" até aqui — só "tenant self read".
create policy "tenant self update" on tenants
  for update using (id in (select auth_tenant_ids()))
  with check (id in (select auth_tenant_ids()));

-- Restrição extra por coluna: mesmo com a policy de RLS acima, o usuário
-- comum só pode de fato escrever em infinitepay_handle — não em cnpj,
-- plan_id, subscription_status etc via essa mesma rota. Isso é reforçado
-- pelo grant, não só pela policy (RLS não distingue coluna).
revoke update on tenants from authenticated;
grant update (infinitepay_handle) on tenants to authenticated;

-- Página pública de status do pedido (link de retorno do checkout).
-- Deliberadamente uma FUNÇÃO, não uma view: uma view pública seria
-- consultável via PostgREST sem filtro nenhum (?select=*), vazando
-- status/valor de todos os pedidos de todos os tenants. A função só
-- devolve linha para quem já sabe o UUID exato do pedido — sem forma de
-- listar ou varrer os demais.
create or replace function get_order_status(order_id_param uuid)
returns table (id uuid, tenant_id uuid, status text, total_cents integer, created_at timestamptz)
language sql
security definer
stable
as $$
  select id, tenant_id, status, total_cents, created_at
  from orders
  where id = order_id_param;
$$;

grant execute on function get_order_status(uuid) to anon, authenticated;
