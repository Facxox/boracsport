-- =============================================================================
-- Borac Sport — FULL RESET & REBUILD
-- Borra TODO el schema boracsport (incluyendo profiles y orders) y lo
-- reconstruye desde cero aplicando TODAS las migraciones en orden:
--   - 20260716_admin_extensibility.sql
--   - 20260722_products_onsale_and_categories_reorder.sql
--   - 20260723_orders_payment_receipt.sql
--   - 20260724_sprint1_variants_stock_orders_history.sql
--   - 20260724b_fix_products_rls_and_variants_hardening.sql
--   - 20260725_admin_actions_hardening.sql
-- Después carga los seeds originales.
--
-- ⚠️ DESTRUCTIVO. NO es idempotente — correr UNA sola vez.
-- ⚠️ Después de esto, los usuarios y roles se PIERDEN. Vas a tener que
--    re-crear tu cuenta admin desde cero (signup → promote via SQL).
-- =============================================================================

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1) DROP TODO — primero policies, después tablas, después schema.
--------------------------------------------------------------------------------

-- Policies de storage.objects (las dropeamos antes de tirar tablas).
drop policy if exists orders_receipt_admin_read  on storage.objects;
drop policy if exists orders_receipt_admin_write on storage.objects;
drop policy if exists hero_public_read           on storage.objects;
drop policy if exists hero_admin_write           on storage.objects;
drop policy if exists templates_public_read      on storage.objects;
drop policy if exists storage_admin_write        on storage.objects;
drop policy if exists customization_owner_write  on storage.objects;
drop policy if exists customization_owner_read   on storage.objects;
drop policy if exists customization_owner_delete on storage.objects;

-- Triggers.
drop trigger if exists orders_set_updated_at            on boracsport.orders;
drop trigger if exists designs_set_updated_at           on boracsport.designs;
drop trigger if exists profiles_set_updated_at          on boracsport.profiles;
drop trigger if exists sections_set_updated_at          on boracsport.sections;
drop trigger if exists products_set_updated_at          on boracsport.products;
drop trigger if exists templates_set_updated_at         on boracsport.templates;
drop trigger if exists categories_set_updated_at       on boracsport.categories;
drop trigger if exists hero_slides_set_updated_at       on boracsport.hero_slides;
drop trigger if exists product_variants_set_updated_at  on boracsport.product_variants;
drop trigger if exists on_auth_user_created             on auth.users;

-- Funciones (cascade para arrastrar las policies que dependen de get_my_role).
drop function if exists boracsport.set_updated_at() cascade;
drop function if exists boracsport.handle_new_user() cascade;
drop function if exists boracsport.get_my_role() cascade;

-- Tablas en orden (FK → cascade). product_variants primero porque depende de products.
drop table if exists boracsport.product_variants cascade;
drop table if exists boracsport.orders            cascade;
drop table if exists boracsport.designs           cascade;
drop table if exists boracsport.templates         cascade;
drop table if exists boracsport.hero_slides       cascade;
drop table if exists boracsport.products          cascade;
drop table if exists boracsport.sections          cascade;
drop table if exists boracsport.categories        cascade;
drop table if exists boracsport.profiles          cascade;

-- Enums.
drop type if exists boracsport.user_role;
drop type if exists boracsport.order_status;
drop type if exists boracsport.payment_status;

-- Buckets: Postgres no permite borrarlos directo desde SQL (es por seguridad,
-- se manejan via Storage API). Dejamos los buckets viejos en su lugar — no
-- molestan porque no tienen contenido (los archivos viejos se borraron con
-- el truncate cascade, y los buckets sin policies no son accesibles).
-- Los recreamos abajo con `on conflict do update` para refrescar el flag
-- `public` por si cambió.

-- Schema completo (al final del drop).
drop schema if exists boracsport cascade;

--------------------------------------------------------------------------------
-- 2) RECREAR SCHEMA DESDE CERO.
--------------------------------------------------------------------------------

create schema if not exists boracsport;
create extension if not exists pgcrypto;

create type boracsport.user_role     as enum ('user', 'admin', 'superadmin');
create type boracsport.order_status as enum ('pendiente', 'confirmado', 'en_produccion', 'enviado', 'entregado', 'cancelado');
create type boracsport.payment_status as enum ('pendiente', 'aprobado', 'rechazado', 'reembolsado');

--------------------------------------------------------------------------------
-- 2.1) profiles
--------------------------------------------------------------------------------
create table boracsport.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  address text,
  role boracsport.user_role not null default 'user',
  intereses jsonb not null default '[]'::jsonb,
  theme_preference text not null default 'dark' check (theme_preference in ('light', 'dark', 'system')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

--------------------------------------------------------------------------------
-- 2.2) sections
--------------------------------------------------------------------------------
create table boracsport.sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

--------------------------------------------------------------------------------
-- 2.3) categories
--------------------------------------------------------------------------------
create table boracsport.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  emoji text not null default '',
  description text not null default '',
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index categories_active_order_idx on boracsport.categories (active, display_order);

--------------------------------------------------------------------------------
-- 2.4) products (con category_id FK + on_sale + backfill)
--------------------------------------------------------------------------------
create table boracsport.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12,2) not null default 0 check (price >= 0),
  category text not null,
  category_id uuid references boracsport.categories(id) on delete set null,
  images text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  featured boolean not null default false,
  on_sale boolean not null default false,
  section_id uuid references boracsport.sections(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index products_active_category_idx on boracsport.products (active, category);
create index products_featured_idx        on boracsport.products (featured) where active;
create index products_category_id_idx     on boracsport.products (category_id);
create index products_on_sale_idx         on boracsport.products (on_sale);

--------------------------------------------------------------------------------
-- 2.5) product_variants (Sprint 1)
--------------------------------------------------------------------------------
create table boracsport.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references boracsport.products(id) on delete cascade,
  size text not null default '',
  color text not null default '',
  sku text,
  stock integer not null default 0 check (stock >= 0),
  price_override numeric(12,2) check (price_override is null or price_override >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, size, color)
);

create index product_variants_product_idx on boracsport.product_variants (product_id, active);

--------------------------------------------------------------------------------
-- 2.6) templates
--------------------------------------------------------------------------------
create table boracsport.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mockup_url_front text not null default '',
  mockup_url_back text not null default '',
  model_url text,
  model_format text check (model_format is null or model_format in ('glb', 'gltf')),
  scene_config jsonb not null default '{}'::jsonb,
  editable_zones jsonb not null default '[]'::jsonb,
  default_config jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  price numeric(12,2) not null default 0 check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

--------------------------------------------------------------------------------
-- 2.7) designs
--------------------------------------------------------------------------------
create table boracsport.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index designs_user_created_idx on boracsport.designs(user_id, created_at desc);

--------------------------------------------------------------------------------
-- 2.8) orders (con payment_receipt_url desde migración 20260723)
--------------------------------------------------------------------------------
create table boracsport.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  status boracsport.order_status not null default 'pendiente',
  payment_method text not null default 'whatsapp',
  payment_status boracsport.payment_status not null default 'pendiente',
  payment_receipt_url text,
  shipping_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index orders_user_created_idx      on boracsport.orders (user_id, created_at desc);
create index orders_analytics_period_idx on boracsport.orders (created_at desc, status, payment_status);
create index orders_status_created_idx    on boracsport.orders (status, created_at desc);
create index orders_payment_created_idx  on boracsport.orders (payment_status, created_at desc);
create index orders_items_gin_idx        on boracsport.orders using gin (items jsonb_path_ops);

--------------------------------------------------------------------------------
-- 2.9) hero_slides
--------------------------------------------------------------------------------
create table boracsport.hero_slides (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  url text not null,
  poster_url text,
  heading text not null default '',
  subheading text not null default '',
  cta_label text not null default 'Diseñá tu equipo',
  cta_href text not null default '/personalizar',
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index hero_slides_active_order_idx on boracsport.hero_slides (active, display_order);

--------------------------------------------------------------------------------
-- 3) FUNCIONES
--------------------------------------------------------------------------------
create or replace function boracsport.set_updated_at()
returns trigger
language plpgsql
set search_path = boracsport, public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create or replace function boracsport.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = boracsport, public
as $$
begin
  insert into boracsport.profiles (id, full_name, intereses)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data -> 'intereses', '[]'::jsonb)
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    intereses = excluded.intereses;
  return new;
end;
$$;

create or replace function boracsport.get_my_role()
returns boracsport.user_role
language sql
stable
security definer
set search_path = boracsport, public
as $$
  select role from boracsport.profiles where id = auth.uid();
$$;

revoke all on function boracsport.get_my_role() from public;
grant execute on function boracsport.get_my_role() to authenticated;

--------------------------------------------------------------------------------
-- 4) TRIGGERS
--------------------------------------------------------------------------------
create trigger profiles_set_updated_at          before update on boracsport.profiles         for each row execute function boracsport.set_updated_at();
create trigger sections_set_updated_at          before update on boracsport.sections         for each row execute function boracsport.set_updated_at();
create trigger categories_set_updated_at       before update on boracsport.categories       for each row execute function boracsport.set_updated_at();
create trigger products_set_updated_at          before update on boracsport.products         for each row execute function boracsport.set_updated_at();
create trigger product_variants_set_updated_at  before update on boracsport.product_variants for each row execute function boracsport.set_updated_at();
create trigger templates_set_updated_at         before update on boracsport.templates        for each row execute function boracsport.set_updated_at();
create trigger designs_set_updated_at           before update on boracsport.designs          for each row execute function boracsport.set_updated_at();
create trigger orders_set_updated_at            before update on boracsport.orders           for each row execute function boracsport.set_updated_at();
create trigger hero_slides_set_updated_at       before update on boracsport.hero_slides      for each row execute function boracsport.set_updated_at();
create trigger on_auth_user_created             after  insert on auth.users                 for each row execute function boracsport.handle_new_user();

--------------------------------------------------------------------------------
-- 5) RLS — habilitar en todas las tablas.
--------------------------------------------------------------------------------
alter table boracsport.profiles         enable row level security;
alter table boracsport.sections         enable row level security;
alter table boracsport.categories       enable row level security;
alter table boracsport.products         enable row level security;
alter table boracsport.product_variants enable row level security;
alter table boracsport.templates        enable row level security;
alter table boracsport.designs          enable row level security;
alter table boracsport.orders           enable row level security;

--------------------------------------------------------------------------------
-- 5.1) profiles
--------------------------------------------------------------------------------
create policy profiles_self_select    on boracsport.profiles for select to authenticated using (id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy profiles_self_update    on boracsport.profiles for update to authenticated using (id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin')) with check (id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy profiles_admin_insert   on boracsport.profiles for insert to authenticated with check (boracsport.get_my_role() in ('admin', 'superadmin'));
create policy profiles_admin_delete   on boracsport.profiles for delete to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5.2) sections
--------------------------------------------------------------------------------
create policy sections_public_active  on boracsport.sections for select using (active or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy sections_admin_write    on boracsport.sections for all to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5.3) categories
--------------------------------------------------------------------------------
create policy categories_public_active on boracsport.categories for select using (active or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy categories_admin_write   on boracsport.categories for all to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5.4) products
--------------------------------------------------------------------------------
create policy products_public_active  on boracsport.products for select using (active or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy products_admin_write    on boracsport.products for all to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5.5) product_variants
--------------------------------------------------------------------------------
create policy variants_public_active  on boracsport.product_variants for select
  using (
    active
    and exists (
      select 1 from boracsport.products p
      where p.id = product_variants.product_id
        and (p.active or boracsport.get_my_role() in ('admin', 'superadmin'))
    )
  );
create policy variants_admin_write    on boracsport.product_variants for all to authenticated
  using (boracsport.get_my_role() in ('admin', 'superadmin'))
  with check (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5.6) templates
--------------------------------------------------------------------------------
create policy templates_public_active on boracsport.templates for select using (active or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy templates_admin_write   on boracsport.templates for all to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5.7) designs
--------------------------------------------------------------------------------
create policy designs_owner_select on boracsport.designs for select to authenticated using (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy designs_owner_insert on boracsport.designs for insert to authenticated with check (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy designs_owner_update on boracsport.designs for update to authenticated using (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin')) with check (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy designs_owner_delete on boracsport.designs for delete to authenticated using (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5.8) orders
--------------------------------------------------------------------------------
create policy orders_guest_insert  on boracsport.orders for insert to anon        with check (user_id is null and status = 'pendiente' and payment_status = 'pendiente');
create policy orders_owner_select  on boracsport.orders for select to authenticated using (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy orders_owner_insert  on boracsport.orders for insert to authenticated with check (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
create policy orders_admin_update  on boracsport.orders for update to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));
create policy orders_admin_delete  on boracsport.orders for delete to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 6) GRANTS
--------------------------------------------------------------------------------
grant usage on schema boracsport to anon, authenticated;

grant select on boracsport.products,          boracsport.sections,
              boracsport.templates,         boracsport.categories,
              boracsport.product_variants,  boracsport.hero_slides
              to anon, authenticated;

grant select on boracsport.orders, boracsport.profiles, boracsport.designs to authenticated;

grant select, insert, update, delete on boracsport.profiles         to authenticated;
grant select, insert, update, delete on boracsport.designs           to authenticated;
grant select, insert, update, delete on boracsport.orders            to authenticated;
grant select, insert, update, delete on boracsport.sections          to authenticated;
grant select, insert, update, delete on boracsport.products          to authenticated;
grant select, insert, update, delete on boracsport.product_variants  to authenticated;
grant select, insert, update, delete on boracsport.categories        to authenticated;
grant select, insert, update, delete on boracsport.templates         to authenticated;
grant select, insert, update, delete on boracsport.hero_slides       to authenticated;

grant insert on boracsport.orders to anon;

--------------------------------------------------------------------------------
-- 7) BUCKETS DE STORAGE
--------------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('boracsport_templates',       'boracsport_templates',       true),
  ('boracsport_products',        'boracsport_products',        true),
  ('boracsport_customizations',  'boracsport_customizations',  false),
  ('boracsport_hero',            'boracsport_hero',            true),
  ('boracsport_orders',          'boracsport_orders',          false)
on conflict (id) do update set public = excluded.public;

--------------------------------------------------------------------------------
-- 7.1) Storage policies
--------------------------------------------------------------------------------
create policy templates_public_read      on storage.objects for select using (bucket_id in ('boracsport_templates', 'boracsport_products'));
create policy storage_admin_write        on storage.objects for all to authenticated using (bucket_id in ('boracsport_templates', 'boracsport_products') and boracsport.get_my_role() in ('admin', 'superadmin')) with check (bucket_id in ('boracsport_templates', 'boracsport_products') and boracsport.get_my_role() in ('admin', 'superadmin'));
create policy customization_owner_write  on storage.objects for insert to authenticated with check (bucket_id = 'boracsport_customizations' and (storage.foldername(name))[1] = auth.uid()::text);
create policy customization_owner_read   on storage.objects for select to authenticated using (bucket_id = 'boracsport_customizations' and ((storage.foldername(name))[1] = auth.uid()::text or boracsport.get_my_role() in ('admin', 'superadmin')));
create policy customization_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'boracsport_customizations' and ((storage.foldername(name))[1] = auth.uid()::text or boracsport.get_my_role() in ('admin', 'superadmin')));
create policy hero_public_read           on storage.objects for select using (bucket_id = 'boracsport_hero');
create policy hero_admin_write           on storage.objects for all to authenticated using (bucket_id = 'boracsport_hero' and boracsport.get_my_role() in ('admin', 'superadmin')) with check (bucket_id = 'boracsport_hero' and boracsport.get_my_role() in ('admin', 'superadmin'));
create policy orders_receipt_admin_read  on storage.objects for select to authenticated using (bucket_id = 'boracsport_orders' and boracsport.get_my_role() in ('admin', 'superadmin'));
create policy orders_receipt_admin_write on storage.objects for all to authenticated using (bucket_id = 'boracsport_orders' and boracsport.get_my_role() in ('admin', 'superadmin')) with check (bucket_id = 'boracsport_orders' and boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 8) SEEDS — Categorías hardcodeadas del registro.
--------------------------------------------------------------------------------
insert into boracsport.categories (slug, label, emoji, description, display_order)
values
  ('deportivo',     'Indumentaria Deportiva',        '⚽',  'Equipos y competición. Camisetas, shorts y medias sublimadas.',           10),
  ('corporativo',   'Ropa de Trabajo & Corporativa',  '💼', 'Uniformes premium para empresas. Chombas, polos y remeras corporativas.', 20),
  ('dtf',           'DTF por Metro',                 '🖨️', 'Impresión textil directa para talleres y marcas. Calidad profesional.',   30),
  ('merchandising', 'Merchandising Personalizado',   '🎁', 'Artículos de marca a demanda. Tazas, pelotas, bolsos y más.',             40)
on conflict (slug) do update set
  label = excluded.label,
  emoji = excluded.emoji,
  description = excluded.description,
  display_order = excluded.display_order;

--------------------------------------------------------------------------------
-- 9) PROMOVER USUARIO ADMIN — INSTRUCCIONES POST-MIGRACIÓN
--------------------------------------------------------------------------------
-- Después de correr este script, hacé:
--   1. Andá a Authentication → Users y creá una cuenta nueva (signup normal).
--   2. Confirmá el email y logueate para que se cree el profile.
--   3. Volvé a este SQL editor y ejecutá:
--        update boracsport.profiles
--        set role = 'superadmin'
--        where id = (select id from auth.users where email = 'TU_EMAIL');
--   4. Refrescá la app. Vas a tener acceso al panel admin.
--
-- Si querés un usuario específico como admin, ejecutá después:
--   update boracsport.profiles set role = 'superadmin' where id = '<uuid>';
--------------------------------------------------------------------------------