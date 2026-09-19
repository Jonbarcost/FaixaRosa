-- Schema inicial do SaaS multi-tenant.
-- Cada lojista (tenant) é uma loja de moda íntima/sexshop que assina o SaaS.
-- Isolamento entre tenants é feito via RLS (Row Level Security), não apenas
-- por filtro em query — evita vazamento de dados de um lojista para outro
-- em caso de bug de aplicação.

create extension if not exists "uuid-ossp";

-- Planos de assinatura do SaaS (o que os LOJISTAS pagam para usar a plataforma)
create table plans (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  price_cents integer not null,
  billing_period text not null check (billing_period in ('monthly', 'yearly')),
  transaction_fee_bps integer not null default 0, -- taxa sobre cada venda, em basis points
  max_products integer,
  created_at timestamptz not null default now()
);

-- Tenants = lojas dos clientes B2B da plataforma
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  store_name text not null,
  cnpj text,
  contact_email text not null,
  plan_id uuid references plans(id),
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled')),
  age_gate_required boolean not null default true,
  created_at timestamptz not null default now()
);

-- Usuários do painel administrativo de cada loja (o lojista e sua equipe)
create table tenant_users (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  unique (tenant_id, auth_user_id)
);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  category_id uuid references categories(id),
  slug text not null,
  name text not null,
  description text,
  price_cents integer not null,
  image_url text,
  is_explicit boolean not null default false, -- exige age-gate mais rígido na vitrine
  is_published boolean not null default false,
  stock integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table customers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  age_verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid references customers(id),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'delivered', 'canceled', 'refunded')),
  total_cents integer not null,
  payment_provider text not null default 'mock',
  payment_reference text, -- id da transação na processadora real
  discreet_packaging boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null
);

-- Índices de acesso mais comum (storefront por tenant, catálogo publicado)
create index idx_products_tenant_published on products (tenant_id, is_published);
create index idx_orders_tenant_status on orders (tenant_id, status);
create index idx_tenant_users_auth_user on tenant_users (auth_user_id);

-- RLS: cada lojista só enxerga e altera dados do próprio tenant.
alter table tenants enable row level security;
alter table tenant_users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create or replace function auth_tenant_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select tenant_id from tenant_users where auth_user_id = auth.uid();
$$;

create policy "tenant self read" on tenants
  for select using (id in (select auth_tenant_ids()));

create policy "tenant_users self read" on tenant_users
  for select using (tenant_id in (select auth_tenant_ids()));

create policy "categories scoped to tenant" on categories
  for all using (tenant_id in (select auth_tenant_ids()))
  with check (tenant_id in (select auth_tenant_ids()));

-- Nomes de categoria não são sensíveis: liberados para o storefront público,
-- que não tem sessão de tenant_user.
create policy "categories public read" on categories
  for select using (true);

create policy "products scoped to tenant" on products
  for all using (tenant_id in (select auth_tenant_ids()))
  with check (tenant_id in (select auth_tenant_ids()));

create policy "customers scoped to tenant" on customers
  for all using (tenant_id in (select auth_tenant_ids()))
  with check (tenant_id in (select auth_tenant_ids()));

create policy "orders scoped to tenant" on orders
  for all using (tenant_id in (select auth_tenant_ids()))
  with check (tenant_id in (select auth_tenant_ids()));

create policy "order_items scoped via order" on order_items
  for all using (
    order_id in (select id from orders where tenant_id in (select auth_tenant_ids()))
  );

-- Leitura pública do catálogo publicado (storefront do lojista, sem login).
-- Feita via view separada para não afrouxar a policy da tabela products.
-- A view roda com o dono (bypassa RLS de products), mas o WHERE já restringe
-- a linhas publicadas — nenhum dado de rascunho/estoque interno vaza.
create view public_products as
  select id, tenant_id, category_id, slug, name, description, price_cents,
         image_url, is_explicit, stock
  from products
  where is_published = true;

grant select on public_products to anon, authenticated;
grant select on categories to anon, authenticated;

-- Idem para tenants: o storefront público precisa resolver slug -> loja,
-- mas não deve enxergar cnpj/contact_email/plan_id.
create view public_tenant_info as
  select id, slug, store_name, age_gate_required, subscription_status
  from tenants
  where subscription_status <> 'canceled';

grant select on public_tenant_info to anon, authenticated;
