-- Borac Sport — Sincronización de stock para kind='pelota'.
-- Posterior a 20260731. Idempotente: safe to re-run.
--
-- Resumen:
--   Hasta ahora el trigger sync_product_stock_from_variants() SÓLO sincronizaba
--   products.stock cuando la categoría era kind='ropa'. Con la nueva feature de
--   talles para kind='pelota', también necesitamos que el stock del producto
--   se mantenga consistente con la suma de variants.stock cuando la categoría
--   es 'pelota'. Para kind='otro' el comportamiento NO cambia (sigue siendo
--   "no tocar products.stock", porque esa categoría no usa variantes).
--
-- Decisiones:
--   - NO modificamos CHECK constraints.
--   - NO modificamos el unique (product_id, size, color): las pelotas con
--     color="" y size distinto siguen siendo filas únicas.
--   - Fijamos search_path explícitamente para evitar hijacking.
--   - Actualizamos el comment de la función para reflejar el nuevo scope.

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1) Función trigger: sincroniza products.stock con sum(variants.stock) cuando
--    la categoría del producto es 'ropa' o 'pelota'. Si es 'otro' (o no hay
--    categoría), no toca products.stock (la fuente de verdad es el input
--    top-level del form de admin).
--------------------------------------------------------------------------------
create or replace function boracsport.sync_product_stock_from_variants()
returns trigger
language plpgsql
security definer
set search_path = boracsport, public
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

  -- Sólo sincronizamos si la categoría es 'ropa' o 'pelota'. Si es 'otro'
  -- (o desconocida), el stock top-level se gestiona desde el form de admin
  -- y NO se modifica desde el trigger de variantes.
  if cat_kind is distinct from 'ropa' and cat_kind is distinct from 'pelota' then
    return coalesce(new, old);
  end if;

  -- Sumar el stock de las variantes activas (sumamos todas las activas
  -- independientemente del kind; las dos categorías usan el mismo shape).
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

-- El trigger ya existe (lo creó 20260728). Por seguridad lo recreamos
-- idempotentemente para garantizar que apunte a la versión actual de la
-- función después de este create or replace.
drop trigger if exists product_variants_sync_stock on boracsport.product_variants;
create trigger product_variants_sync_stock
  after insert or update or delete on boracsport.product_variants
  for each row execute function boracsport.sync_product_stock_from_variants();

--------------------------------------------------------------------------------
-- 2) Comentario actualizado para reflejar el nuevo scope.
--------------------------------------------------------------------------------
comment on function boracsport.sync_product_stock_from_variants() is
  'Trigger AFTER INSERT/UPDATE/DELETE en product_variants que sincroniza products.stock con sum(variants.stock) cuando la categoría del producto es ropa o pelota. Para kind=otro (o categorías desconocidas) no toca products.stock: la fuente de verdad es el input top-level del form de admin. Fijado con security definer y search_path=boracsport,public para evitar hijacking.';

comment on trigger product_variants_sync_stock on boracsport.product_variants is
  'Mantiene products.stock sincronizado con la suma de variants.stock activas para categorías kind=ropa o kind=pelota. NO toca products.stock para kind=otro.';