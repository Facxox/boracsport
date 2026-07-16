-- Borac Sport — Sprint 1: variants, stock decrement, orders history.
-- Idempotent: safe to run multiple times.

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1. product_variants
--------------------------------------------------------------------------------
create table if not exists boracsport.product_variants (
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

create index if not exists product_variants_product_idx
  on boracsport.product_variants (product_id, active);

--------------------------------------------------------------------------------
-- 2. Backfill: por cada producto activo sin variantes, crear una "default"
--    que herede el stock legacy para no romper ventas existentes.
--------------------------------------------------------------------------------
do $$
declare
  prod record;
begin
  for prod in
    select p.id, p.stock
    from boracsport.products p
    where p.active = true
      and not exists (
        select 1 from boracsport.product_variants v where v.product_id = p.id
      )
  loop
    insert into boracsport.product_variants (product_id, size, color, sku, stock)
    values (prod.id, '', '', null, greatest(prod.stock, 0));
  end loop;
end $$;

--------------------------------------------------------------------------------
-- 3. Trigger updated_at
--------------------------------------------------------------------------------
drop trigger if exists product_variants_set_updated_at on boracsport.product_variants;
create trigger product_variants_set_updated_at
  before update on boracsport.product_variants
  for each row execute function boracsport.set_updated_at();

--------------------------------------------------------------------------------
-- 4. RLS
--------------------------------------------------------------------------------
alter table boracsport.product_variants enable row level security;

drop policy if exists variants_public_active on boracsport.product_variants;
create policy variants_public_active on boracsport.product_variants for select
  using (
    active
    and exists (
      select 1 from boracsport.products p
      where p.id = product_variants.product_id
        and (p.active or boracsport.get_my_role() in ('admin', 'superadmin'))
    )
  );

drop policy if exists variants_admin_write on boracsport.product_variants;
create policy variants_admin_write on boracsport.product_variants for all to authenticated
  using (boracsport.get_my_role() in ('admin', 'superadmin'))
  with check (boracsport.get_my_role() in ('admin', 'superadmin'));

--------------------------------------------------------------------------------
-- 5. Grants
--------------------------------------------------------------------------------
grant select on boracsport.product_variants to anon, authenticated;
grant select, insert, update, delete on boracsport.product_variants to authenticated;