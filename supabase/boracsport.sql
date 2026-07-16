-- Borac Sport — schema y políticas de producción
create schema if not exists boracsport;

create extension if not exists pgcrypto;

create type boracsport.user_role as enum ('user', 'admin', 'superadmin');
create type boracsport.order_status as enum ('pendiente', 'confirmado', 'en_produccion', 'enviado', 'entregado', 'cancelado');
create type boracsport.payment_status as enum ('pendiente', 'aprobado', 'rechazado', 'reembolsado');

create table if not exists boracsport.profiles (
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

create table if not exists boracsport.sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists boracsport.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12,2) not null default 0 check (price >= 0),
  category text not null,
  images text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  featured boolean not null default false,
  section_id uuid references boracsport.sections(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists boracsport.templates (
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

create table if not exists boracsport.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists designs_user_created_idx on boracsport.designs(user_id, created_at desc);

create table if not exists boracsport.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  status boracsport.order_status not null default 'pendiente',
  payment_method text not null default 'whatsapp',
  payment_status boracsport.payment_status not null default 'pendiente',
  shipping_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists products_active_category_idx on boracsport.products(active, category);
create index if not exists products_featured_idx on boracsport.products(featured) where active;
create index if not exists orders_user_created_idx on boracsport.orders(user_id, created_at desc);
create index if not exists orders_analytics_period_idx on boracsport.orders(created_at desc, status, payment_status);
create index if not exists orders_status_created_idx on boracsport.orders(status, created_at desc);
create index if not exists orders_payment_created_idx on boracsport.orders(payment_status, created_at desc);
create index if not exists orders_items_gin_idx on boracsport.orders using gin (items jsonb_path_ops);

create or replace function boracsport.set_updated_at()
returns trigger
language plpgsql
set search_path = boracsport, public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on boracsport.profiles;
create trigger profiles_set_updated_at before update on boracsport.profiles for each row execute function boracsport.set_updated_at();
drop trigger if exists sections_set_updated_at on boracsport.sections;
create trigger sections_set_updated_at before update on boracsport.sections for each row execute function boracsport.set_updated_at();
drop trigger if exists products_set_updated_at on boracsport.products;
create trigger products_set_updated_at before update on boracsport.products for each row execute function boracsport.set_updated_at();
drop trigger if exists templates_set_updated_at on boracsport.templates;
create trigger templates_set_updated_at before update on boracsport.templates for each row execute function boracsport.set_updated_at();
drop trigger if exists orders_set_updated_at on boracsport.orders;
create trigger orders_set_updated_at before update on boracsport.orders for each row execute function boracsport.set_updated_at();

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function boracsport.handle_new_user();

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

drop trigger if exists designs_set_updated_at on boracsport.designs;
create trigger designs_set_updated_at before update on boracsport.designs for each row execute function boracsport.set_updated_at();

alter table boracsport.designs enable row level security;
drop policy if exists designs_owner_select on boracsport.designs;
create policy designs_owner_select on boracsport.designs for select to authenticated using (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists designs_owner_insert on boracsport.designs;
create policy designs_owner_insert on boracsport.designs for insert to authenticated with check (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists designs_owner_update on boracsport.designs;
create policy designs_owner_update on boracsport.designs for update to authenticated using (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin')) with check (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists designs_owner_delete on boracsport.designs;
create policy designs_owner_delete on boracsport.designs for delete to authenticated using (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));


grant usage on schema boracsport to anon, authenticated;
grant select on boracsport.products, boracsport.sections, boracsport.templates to anon, authenticated;
grant select, insert, update, delete on boracsport.profiles, boracsport.designs, boracsport.orders to authenticated;
grant select, insert, update, delete on boracsport.sections, boracsport.products, boracsport.templates to authenticated;

grant insert on boracsport.orders to anon;

alter table boracsport.profiles enable row level security;
alter table boracsport.sections enable row level security;
alter table boracsport.products enable row level security;
alter table boracsport.templates enable row level security;
alter table boracsport.orders enable row level security;

drop policy if exists profiles_self_select on boracsport.profiles;
create policy profiles_self_select on boracsport.profiles for select to authenticated using (id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists profiles_self_update on boracsport.profiles;
create policy profiles_self_update on boracsport.profiles for update to authenticated using (id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin')) with check (id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists profiles_admin_insert on boracsport.profiles;
create policy profiles_admin_insert on boracsport.profiles for insert to authenticated with check (boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists profiles_admin_delete on boracsport.profiles;
create policy profiles_admin_delete on boracsport.profiles for delete to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin'));

drop policy if exists sections_public_active on boracsport.sections;
create policy sections_public_active on boracsport.sections for select using (active or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists sections_admin_write on boracsport.sections;
create policy sections_admin_write on boracsport.sections for all to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));

drop policy if exists products_public_active on boracsport.products;
create policy products_public_active on boracsport.products for select using (active or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists products_admin_write on boracsport.products;
create policy products_admin_write on boracsport.products for all to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));

drop policy if exists templates_public_active on boracsport.templates;
create policy templates_public_active on boracsport.templates for select using (active or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists templates_admin_write on boracsport.templates;
create policy templates_admin_write on boracsport.templates for all to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));

drop policy if exists orders_guest_insert on boracsport.orders;
create policy orders_guest_insert on boracsport.orders for insert to anon with check (user_id is null and status = 'pendiente' and payment_status = 'pendiente');

drop policy if exists orders_owner_select on boracsport.orders;
create policy orders_owner_select on boracsport.orders for select to authenticated using (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists orders_owner_insert on boracsport.orders;
create policy orders_owner_insert on boracsport.orders for insert to authenticated with check (user_id = auth.uid() or boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists orders_admin_update on boracsport.orders;
create policy orders_admin_update on boracsport.orders for update to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin')) with check (boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists orders_admin_delete on boracsport.orders;
create policy orders_admin_delete on boracsport.orders for delete to authenticated using (boracsport.get_my_role() in ('admin', 'superadmin'));

insert into storage.buckets (id, name, public) values
  ('boracsport_templates', 'boracsport_templates', true),
  ('boracsport_products', 'boracsport_products', true),
  ('boracsport_customizations', 'boracsport_customizations', false)
on conflict (id) do update set public = excluded.public;

 drop policy if exists templates_public_read on storage.objects;
create policy templates_public_read on storage.objects for select using (bucket_id in ('boracsport_templates', 'boracsport_products'));
drop policy if exists storage_admin_write on storage.objects;
create policy storage_admin_write on storage.objects for all to authenticated using (bucket_id in ('boracsport_templates', 'boracsport_products') and boracsport.get_my_role() in ('admin', 'superadmin')) with check (bucket_id in ('boracsport_templates', 'boracsport_products') and boracsport.get_my_role() in ('admin', 'superadmin'));
drop policy if exists customization_owner_write on storage.objects;
create policy customization_owner_write on storage.objects for insert to authenticated with check (bucket_id = 'boracsport_customizations' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists customization_owner_read on storage.objects;
create policy customization_owner_read on storage.objects for select to authenticated using (bucket_id = 'boracsport_customizations' and ((storage.foldername(name))[1] = auth.uid()::text or boracsport.get_my_role() in ('admin', 'superadmin')));
drop policy if exists customization_owner_delete on storage.objects;
create policy customization_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'boracsport_customizations' and ((storage.foldername(name))[1] = auth.uid()::text or boracsport.get_my_role() in ('admin', 'superadmin')));
