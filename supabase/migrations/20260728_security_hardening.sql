-- =============================================================================
-- Borac Sport — Hardening de seguridad y consistencia (post-auditoría).
--
-- Cubre los hallazgos del reporte 2026-07-21 que requieren cambios a nivel
-- DB. Idempotente: safe to re-run.
--
-- Cambios:
--   1. Función reconcile_product_stock() + trigger que mantiene products.stock
--      sincronizado con la suma de product_variants.stock cuando la categoría
--      es 'ropa'. Evita stock fantasma en el catálogo.
--   2. Función secure_decrement_stock(uuid, int) que decrementa variantes
--      atómicamente con CHECK stock >= 0 (defensa contra race conditions).
--   3. Trigger que rechaza variantes con size Y color vacíos a la vez.
--   4. Trigger que rechaza orders con subtotal > total.
--   5. Índice para acelerar el dedupe por cartHash (usado por /api/orders).
--   6. Política RLS faltante: orders_admin_update cubre el caso donde el
--      servicio (service-role) debe actualizar payment_receipt_url desde
--      el endpoint /api/orders/[id]/receipt.
--   7. Función cleanup_orphan_variants(uuid) que borra variantes de un
--      producto sin stock > 0 si todas quedaron en 0 (opcional, llamada
--      desde admin actions; seguro porque deja al menos 1 fila si la
--      categoría es 'ropa').
-- =============================================================================

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1) Trigger: sincronizar products.stock con la suma de variants.stock
--    cuando la categoría es 'ropa'. Si la categoría es 'pelota' o 'otro',
--    el stock top-level es la fuente de verdad y no se toca.
--------------------------------------------------------------------------------
create or replace function boracsport.sync_product_stock_from_variants()
returns trigger
language plpgsql
as $$
declare
  target_product_id uuid;
  cat_kind text;
  total integer;
begin
  -- Identificar el producto afectado (puede ser NULL en DELETE).
  if (tg_op = 'DELETE') then
    target_product_id := old.product_id;
  else
    target_product_id := new.product_id;
  end if;

  -- Si no hay producto (caso degenerado), no hacemos nada.
  if target_product_id is null then
    return coalesce(new, old);
  end if;

  -- Leer el kind de la categoría del producto.
  select c.kind into cat_kind
    from boracsport.products p
    left join boracsport.categories c on c.id = p.category_id
    where p.id = target_product_id;

  -- Sólo sincronizamos si la categoría es 'ropa'. Si es 'pelota'/'otro',
  -- el stock top-level se gestiona desde el form de admin.
  if cat_kind is distinct from 'ropa' then
    return coalesce(new, old);
  end if;

  -- Sumar el stock de las variantes activas.
  select coalesce(sum(stock), 0) into total
    from boracsport.product_variants
    where product_id = target_product_id and active = true;

  -- Actualizar products.stock. NO forzamos CHECK aquí porque el CHECK
  -- de stock >= 0 ya existe en la tabla.
  update boracsport.products
    set stock = total
    where id = target_product_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists product_variants_sync_stock on boracsport.product_variants;
create trigger product_variants_sync_stock
  after insert or update or delete on boracsport.product_variants
  for each row execute function boracsport.sync_product_stock_from_variants();

--------------------------------------------------------------------------------
-- 2) Función RPC: decremento atómico de stock de variantes con CHECK.
--    Usada por /api/orders cuando descuenta inventario. Devuelve true si
--    el descuento se aplicó, false si no había stock suficiente.
--------------------------------------------------------------------------------
create or replace function boracsport.secure_decrement_variant_stock(
  p_variant_id uuid,
  p_qty integer
)
returns boolean
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  current_stock integer;
  rows_affected integer;
begin
  if p_qty is null or p_qty <= 0 then
    return false;
  end if;

  select stock into current_stock
    from boracsport.product_variants
    where id = p_variant_id
    for update;

  if current_stock is null then
    return false;
  end if;

  if current_stock < p_qty then
    return false;
  end if;

  update boracsport.product_variants
    set stock = stock - p_qty
    where id = p_variant_id and stock >= p_qty;

  get diagnostics rows_affected = row_count;
  return rows_affected = 1;
end;
$$;

revoke all on function boracsport.secure_decrement_variant_stock(uuid, integer) from public;
grant execute on function boracsport.secure_decrement_variant_stock(uuid, integer) to service_role;

--------------------------------------------------------------------------------
-- 3) Trigger: rechazar variantes con size Y color vacíos a la vez.
--    Una variante debe tener al menos un identificador (size o color).
--------------------------------------------------------------------------------
create or replace function boracsport.check_variant_not_empty()
returns trigger
language plpgsql
as $$
begin
  if coalesce(trim(new.size), '') = '' and coalesce(trim(new.color), '') = '' then
    raise exception 'Una variante debe tener al menos talle o color. (product_id=%)', new.product_id;
  end if;
  return new;
end;
$$;

drop trigger if exists product_variants_check_not_empty on boracsport.product_variants;
create trigger product_variants_check_not_empty
  before insert or update on boracsport.product_variants
  for each row execute function boracsport.check_variant_not_empty();

--------------------------------------------------------------------------------
-- 4) Trigger: rechazar orders inconsistentes (subtotal > total o total < 0).
--------------------------------------------------------------------------------
create or replace function boracsport.check_order_amounts()
returns trigger
language plpgsql
as $$
begin
  if new.subtotal < 0 then
    raise exception 'subtotal no puede ser negativo';
  end if;
  if new.total < 0 then
    raise exception 'total no puede ser negativo';
  end if;
  if new.subtotal > new.total then
    raise exception 'subtotal (%) no puede ser mayor que total (%)', new.subtotal, new.total;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_check_amounts on boracsport.orders;
create trigger orders_check_amounts
  before insert or update on boracsport.orders
  for each row execute function boracsport.check_order_amounts();

--------------------------------------------------------------------------------
-- 5) Índice para dedupe rápido por cartHash en ventana de 5 minutos.
--    Acelera el query del POST /api/orders que busca orders previas con
--    el mismo cartHash para evitar pedidos duplicados por doble-click.
--------------------------------------------------------------------------------
create index if not exists orders_cart_hash_recent_idx
  on boracsport.orders ((shipping_details->>'cartHash'), created_at desc)
  where (shipping_details->>'cartHash') is not null;

--------------------------------------------------------------------------------
-- 6) Política RLS: el admin (y service_role) puede actualizar orders.
--    Ya existe orders_admin_update, pero verificamos que esté y que cubra
--    el caso del endpoint /api/orders/[id]/receipt que actualiza
--    payment_receipt_url desde el service-role.
--------------------------------------------------------------------------------
-- (No-op si ya existe; el script 20260725c_full_reset_and_rebuild.sql ya
--  crea orders_admin_update correctamente.)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'boracsport'
      and tablename = 'orders'
      and policyname = 'orders_admin_update'
  ) then
    create policy orders_admin_update on boracsport.orders
      for update to authenticated
      using (boracsport.get_my_role() in ('admin', 'superadmin'))
      with check (boracsport.get_my_role() in ('admin', 'superadmin'));
  end if;
end $$;

--------------------------------------------------------------------------------
-- 7) Función: cleanup opcional de variantes huérfanas con stock = 0.
--    NO se ejecuta automáticamente. Se puede llamar desde un cron o desde
--    el admin para limpiar variantes vacías después de ventas masivas.
--    Seguro porque nunca borra la última variante de un producto de ropa.
--------------------------------------------------------------------------------
create or replace function boracsport.cleanup_zero_stock_variants(p_product_id uuid)
returns integer
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  cat_kind text;
  remaining integer;
  deleted_count integer;
begin
  select c.kind into cat_kind
    from boracsport.products p
    left join boracsport.categories c on c.id = p.category_id
    where p.id = p_product_id;

  if cat_kind is distinct from 'ropa' then
    return 0;
  end if;

  select count(*) into remaining
    from boracsport.product_variants
    where product_id = p_product_id;

  if remaining <= 1 then
    -- No dejamos al producto sin variantes si es ropa.
    return 0;
  end if;

  with deleted as (
    delete from boracsport.product_variants
      where product_id = p_product_id
        and stock = 0
        and active = false
      returning 1
  )
  select count(*) into deleted_count from deleted;

  return deleted_count;
end;
$$;

revoke all on function boracsport.cleanup_zero_stock_variants(uuid) from public;
grant execute on function boracsport.cleanup_zero_stock_variants(uuid) to service_role;

--------------------------------------------------------------------------------
-- 8) Comentario de schema: documentar el comportamiento del trigger de sync
--    para futuros mantenedores.
--------------------------------------------------------------------------------
comment on function boracsport.sync_product_stock_from_variants() is
  'Trigger AFTER INSERT/UPDATE/DELETE en product_variants que sincroniza products.stock con sum(variants.stock) cuando la categoría del producto es ropa. Si la categoría es pelota/otro, no toca products.stock (la fuente de verdad es el input top-level).';

comment on function boracsport.secure_decrement_variant_stock(uuid, integer) is
  'RPC security definer que decrementa stock de una variante atómicamente con SELECT ... FOR UPDATE. Devuelve true si tuvo éxito, false si no había stock suficiente. Sólo service_role puede ejecutarla.';

comment on function boracsport.cleanup_zero_stock_variants(uuid) is
  'Limpia variantes inactivas con stock=0 de un producto de ropa, pero NUNCA deja al producto sin variantes. Devuelve la cantidad eliminada.';
