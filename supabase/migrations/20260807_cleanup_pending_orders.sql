-- Borac Sport — limpieza automática de pedidos pendientes viejos.
-- Posterior a 20260806. Idempotente.
--
-- Reglas:
--  * Sólo pedidos con status='pendiente' y payment_status='pendiente'.
--  * Antigüedad > 7 días (configurable via argumento).
--  * Devuelve el stock descontado a product_variants o products según el
--    item; luego borra el pedido y registra el evento en role_audit_log.
--  * SECURITY DEFINER, ejecutable por service_role y por pg_cron.
--  * pg_cron corre el job a las 03:00 UTC (timezone del cluster).

set search_path = boracsport, public;

create extension if not exists pg_cron;

create or replace function boracsport.cleanup_pending_orders(
  p_max_age interval default '7 days'
)
returns jsonb
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_now            timestamptz := now();
  v_cutoff         timestamptz := v_now - p_max_age;
  v_order          record;
  v_item           jsonb;
  v_product_id     uuid;
  v_variant_id     uuid;
  v_qty            int;
  v_restored       jsonb := '{}'::jsonb;
  v_deleted_ids    uuid[] := array[]::uuid[];
  v_locked_rows    text[];
  v_target_key     text;
  v_key            text;
  v_returned       int := 0;
begin
  -- Seleccionar candidatos con lock transaccional. SKIP LOCKED permite
  -- que múltiples invocaciones concurrentes no se bloqueen entre sí.
  for v_order in
    select o.id, o.items
      from boracsport.orders o
     where o.status = 'pendiente'
       and o.payment_status = 'pendiente'
       and o.created_at < v_cutoff
     order by o.created_at asc
     for update skip locked
  loop
    v_locked_rows := array[]::text[];

    -- Consolidar cantidades a devolver por (kind:id) para no sumar dos
    -- veces si el mismo variant aparece en varios items del pedido.
    for v_item in select * from jsonb_array_elements(v_order.items)
    loop
      v_product_id := nullif(v_item ->> 'id', '')::uuid;
      v_variant_id := nullif(v_item ->> 'variantId', '')::uuid;
      v_qty        := coalesce((v_item ->> 'qty')::int, 0);

      if v_qty <= 0 or (v_product_id is null and v_variant_id is null) then
        continue;
      end if;

      if v_variant_id is not null then
        v_target_key := 'variant:' || v_variant_id::text;
      else
        v_target_key := 'product:' || v_product_id::text;
      end if;

      v_locked_rows := array_append(v_locked_rows, v_target_key);
      v_restored := v_restored || jsonb_build_object(
        v_target_key,
        coalesce((v_restored ->> v_target_key)::numeric, 0) + v_qty
      );
    end loop;

    -- Devolver stock ordenado alfabéticamente para evitar deadlocks entre
    -- invocaciones concurrentes que toquen las mismas filas.
    select array_agg(distinct k order by k) into v_locked_rows
      from unnest(v_locked_rows) as k;

    foreach v_key in array v_locked_rows loop
      if v_key like 'variant:%' then
        v_variant_id := split_part(v_key, ':', 2)::uuid;
        update boracsport.product_variants
           set stock = stock + ((v_restored ->> v_key)::numeric)::int
         where id = v_variant_id;
      elsif v_key like 'product:%' then
        v_product_id := split_part(v_key, ':', 2)::uuid;
        update boracsport.products
           set stock = stock + ((v_restored ->> v_key)::numeric)::int
         where id = v_product_id;
      end if;
    end loop;

    -- Borrar el pedido y registrar el evento en el audit log unificado.
    delete from boracsport.orders where id = v_order.id;
    v_deleted_ids := array_append(v_deleted_ids, v_order.id);
    v_returned := v_returned + 1;

    insert into boracsport.role_audit_log (
      actor_id, actor_role, target_order_id, before_status, before_payment_status, after_status, after_payment_status
    ) values (
      null,
      'system',
      v_order.id,
      'pendiente',
      'pendiente',
      'deleted',
      'deleted'
    );
  end loop;

  return jsonb_build_object(
    'deleted_count', v_returned,
    'deleted_ids', to_jsonb(v_deleted_ids),
    'restored_stock', v_restored,
    'cutoff', v_cutoff
  );
end;
$$;

revoke all on function boracsport.cleanup_pending_orders(interval) from public;
grant execute on function boracsport.cleanup_pending_orders(interval) to service_role;

comment on function boracsport.cleanup_pending_orders(interval) is
  'Borra pedidos con status=pendiente, payment_status=pendiente y antigüedad > p_max_age, devolviendo stock a variants o products y auditando. Sólo service_role.';

-- Programar ejecución diaria a las 03:00 UTC. pg_cron corre en el cluster
-- con search_path propio; pasamos el argumento por default.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid)
      from cron.job
     where jobname = 'boracsport_cleanup_pending_orders';
  end if;
exception when undefined_table then
  null;
end $$;

select cron.schedule(
  'boracsport_cleanup_pending_orders',
  '0 3 * * *',
  $cmd$ select boracsport.cleanup_pending_orders(); $cmd$
);

comment on extension pg_cron is 'pg_cron habilitado para correr cleanup_pending_orders() diariamente.';