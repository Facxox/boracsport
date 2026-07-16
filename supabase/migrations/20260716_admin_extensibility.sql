-- Borac Sport — admin extensibility migration.
-- Adds dynamic categories, hero slides carousel, public hero bucket,
-- and links products.category to categories.
-- Idempotent: safe to run multiple times.

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1. categories (admin-managed taxonomy = product categories = registration interests)
--------------------------------------------------------------------------------
create table if not exists boracsport.categories (
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

create index if not exists categories_active_order_idx
  on boracsport.categories (active, display_order);

insert into boracsport.categories (slug, label, emoji, description, display_order)
values
  ('deportivo',     'Indumentaria Deportiva',       '⚽',  'Equipos y competición. Camisetas, shorts y medias sublimadas.',           10),
  ('corporativo',   'Ropa de Trabajo & Corporativa', '💼', 'Uniformes premium para empresas. Chombas, polos y remeras corporativas.', 20),
  ('dtf',           'DTF por Metro',                '🖨️', 'Impresión textil directa para talleres y marcas. Calidad profesional.',   30),
  ('merchandising', 'Merchandising Personalizado',  '🎁', 'Artículos de marca a demanda. Tazas, pelotas, bolsos y más.',             40)
on conflict (slug) do nothing;

drop trigger if exists categories_set_updated_at on boracsport.categories;
create trigger categories_set_updated_at
  before update on boracsport.categories
  for each row execute function boracsport.set_updated_at();

--------------------------------------------------------------------------------
-- 2. hero_slides (carousel for the public hero)
--------------------------------------------------------------------------------
create table if not exists boracsport.hero_slides (
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

create index if not exists hero_slides_active_order_idx
  on boracsport.hero_slides (active, display_order);

drop trigger if exists hero_slides_set_updated_at on boracsport.hero_slides;
create trigger hero_slides_set_updated_at
  before update on boracsport.hero_slides
  for each row execute function boracsport.set_updated_at();

--------------------------------------------------------------------------------
-- 3. products.category_id (FK to categories, with backfill)
--------------------------------------------------------------------------------
alter table boracsport.products
  add column if not exists category_id uuid references boracsport.categories(id) on delete set null;

create index if not exists products_category_id_idx
  on boracsport.products (category_id);

update boracsport.products p
  set category_id = c.id
  from boracsport.categories c
  where c.slug = p.category and p.category_id is null;

--------------------------------------------------------------------------------
-- 4. storage bucket + policies for boracsport_hero
--------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('boracsport_hero', 'boracsport_hero', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists hero_public_read on storage.objects;
create policy hero_public_read on storage.objects for select
  using (bucket_id = 'boracsport_hero');

drop policy if exists hero_admin_write on storage.objects;
create policy hero_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'boracsport_hero' and boracsport.get_my_role() in ('admin', 'superadmin'))
  with check (bucket_id = 'boracsport_hero' and boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5. RLS on new tables
--------------------------------------------------------------------------------
alter table boracsport.categories enable row level security;
alter table boracsport.hero_slides enable row level security;

drop policy if exists categories_public_active on boracsport.categories;
create policy categories_public_active on boracsport.categories for select
  using (active or boracsport.get_my_role() in ('admin', 'superadmin'));

drop policy if exists categories_admin_write on boracsport.categories;
create policy categories_admin_write on boracsport.categories for all to authenticated
  using (boracsport.get_my_role() in ('admin', 'superadmin'))
  with check (boracsport.get_my_role() in ('admin', 'superadmin'));

drop policy if exists hero_slides_public_active on boracsport.hero_slides;
create policy hero_slides_public_active on boracsport.hero_slides for select
  using (active or boracsport.get_my_role() in ('admin', 'superadmin'));

drop policy if exists hero_slides_admin_write on boracsport.hero_slides;
create policy hero_slides_admin_write on boracsport.hero_slides for all to authenticated
  using (boracsport.get_my_role() in ('admin', 'superadmin'))
  with check (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 6. Grants
--------------------------------------------------------------------------------
grant select on boracsport.categories, boracsport.hero_slides to anon, authenticated;
grant select, insert, update, delete on boracsport.categories, boracsport.hero_slides to authenticated;