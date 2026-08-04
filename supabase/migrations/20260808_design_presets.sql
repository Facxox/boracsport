-- Borac Sport — diseños base publicables con variantes y stock.
-- Posterior a 20260807d. Idempotente.
--
-- Crea:
--   * boracsport.design_presets: composición pre-armada (template + payload DesignState
--     + preview + precio + active + display_order) publicable para que el cliente
--     final la abra en /personalizar y la customice encima.
--   * boracsport.design_preset_variants: variantes (size, color) con stock propio
--     siguiendo el mismo patrón que product_variants.
--   * Bucket Storage boracsport_presets (público lectura, admin escritura).
--   * RLS: SELECT público cuando active=true; mutación admin/superadmin.

set search_path = boracsport, public;

create table if not exists boracsport.design_presets (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references boracsport.templates(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null default '',
  preview_url text not null default '',
  payload jsonb not null default '{}'::jsonb,
  price numeric(12,2) not null default 0 check (price >= 0),
  active boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint design_presets_payload_has_version check (
    payload ? 'version' and (payload ->> 'version')::int = 1
  )
);

create index if not exists design_presets_active_order_idx
  on boracsport.design_presets (active, display_order);
create index if not exists design_presets_template_idx
  on boracsport.design_presets (template_id);

drop trigger if exists design_presets_set_updated_at on boracsport.design_presets;
create trigger design_presets_set_updated_at
  before update on boracsport.design_presets
  for each row execute function boracsport.set_updated_at();

alter table boracsport.design_presets enable row level security;

drop policy if exists design_presets_public_select on boracsport.design_presets;
create policy design_presets_public_select on boracsport.design_presets
  for select to anon, authenticated
  using (active = true);

drop policy if exists design_presets_admin_all on boracsport.design_presets;
create policy design_presets_admin_all on boracsport.design_presets
  for all to authenticated
  using ((select boracsport.get_my_role()) in ('admin', 'superadmin'))
  with check ((select boracsport.get_my_role()) in ('admin', 'superadmin'));

create table if not exists boracsport.design_preset_variants (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references boracsport.design_presets(id) on delete cascade,
  size text not null default '',
  color text not null default '',
  sku text,
  stock integer not null default 0 check (stock >= 0),
  price_override numeric(12,2) check (price_override is null or price_override >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (preset_id, size, color)
);

create index if not exists design_preset_variants_preset_active_idx
  on boracsport.design_preset_variants (preset_id, active);

drop trigger if exists design_preset_variants_set_updated_at on boracsport.design_preset_variants;
create trigger design_preset_variants_set_updated_at
  before update on boracsport.design_preset_variants
  for each row execute function boracsport.set_updated_at();

alter table boracsport.design_preset_variants enable row level security;

drop policy if exists design_preset_variants_public_select on boracsport.design_preset_variants;
create policy design_preset_variants_public_select on boracsport.design_preset_variants
  for select to anon, authenticated
  using (
    active = true
    and exists (
      select 1 from boracsport.design_presets p
       where p.id = design_preset_variants.preset_id
         and p.active = true
    )
  );

drop policy if exists design_preset_variants_admin_all on boracsport.design_preset_variants;
create policy design_preset_variants_admin_all on boracsport.design_preset_variants
  for all to authenticated
  using ((select boracsport.get_my_role()) in ('admin', 'superadmin'))
  with check ((select boracsport.get_my_role()) in ('admin', 'superadmin'));

comment on table boracsport.design_presets is
  'Diseño base publicable: template + payload DesignState precargado + preview + precio. El cliente final lo abre en /personalizar.';
comment on table boracsport.design_preset_variants is
  'Variantes (size, color) con stock propio para un design_preset. Modelo equivalente a product_variants.';

-- Bucket Storage para los previews y assets de presets.
insert into storage.buckets (id, name, public)
  values ('boracsport_presets', 'boracsport_presets', true)
  on conflict (id) do nothing;

drop policy if exists presets_public_read on storage.objects;
create policy presets_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'boracsport_presets');

drop policy if exists presets_admin_write on storage.objects;
create policy presets_admin_write on storage.objects
  for all to authenticated
  using (
    bucket_id = 'boracsport_presets'
    and (select boracsport.get_my_role()) in ('admin', 'superadmin')
  )
  with check (
    bucket_id = 'boracsport_presets'
    and (select boracsport.get_my_role()) in ('admin', 'superadmin')
  );

drop policy if exists presets_service_role_all on storage.objects;
create policy presets_service_role_all on storage.objects
  for all to service_role
  using (bucket_id = 'boracsport_presets')
  with check (bucket_id = 'boracsport_presets');

comment on table boracsport.design_presets is
  'Diseño base publicable. Ver también boracsport.design_preset_variants.';