-- Borac Sport — privilegios de service_role sobre tablas mutables.
-- Posterior a 20260808b. Idempotente.
--
-- Por qué: las Route Handlers server-side usan el cliente "service_role" para
-- mutar tablas sin pasar por RLS (bypassa políticas pero NO bypassa privilegios
-- de tabla). Las migraciones previas sólo otorgaron DML a anon/authenticated,
-- y las mutaciones "pesadas" como crear pedido van por una RPC SECURITY
-- DEFINER. Esta migración otorga explícitamente los privilegios que el cliente
-- service_role necesita para las operaciones que hace desde código Node:
--
--   * boracsport.orders               -> update payment_receipt_url
--                                        (POST /api/orders/[id]/receipt)
--   * boracsport.order_confirmation_tokens -> insert/delete consumido por la
--                                        RPC y por el endpoint público
--   * boracsport.role_audit_log       -> insert desde RPC / futuro
--                                        middleware de admin
--   * boracsport.rate_limit_buckets   -> select/insert/update desde el
--                                        middleware de rate-limit
--
-- NO se otorgan privilegios sobre:
--   * products, product_variants, design_presets, design_preset_variants ->
--     las mutaciones de stock van por RPC SECURITY DEFINER.
--   * orders SELECT / INSERT siguen vía anon/authenticated (RLS).

set search_path = boracsport, public;

do $$
begin
  -- orders: el service client hace UPDATE de payment_receipt_url tras subir
  -- el comprobante a Storage.
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'boracsport'
      and table_name = 'orders'
      and grantee = 'service_role'
      and privilege_type = 'UPDATE'
  ) then
    grant update on boracsport.orders to service_role;
  end if;

  -- order_confirmation_tokens: consumido por la RPC y por el endpoint
  -- público. Necesitamos que service_role pueda insertarlos.
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'boracsport'
      and table_name = 'order_confirmation_tokens'
      and grantee = 'service_role'
      and privilege_type = 'INSERT'
  ) then
    grant insert, select, delete on boracsport.order_confirmation_tokens to service_role;
  end if;

  -- role_audit_log: cualquier RPC SECURITY DEFINER que registre auditoría
  -- ejecuta como postgres y ya tiene acceso, pero dejamos service_role
  -- preparado para inserciones directas.
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'boracsport'
      and table_name = 'role_audit_log'
      and grantee = 'service_role'
      and privilege_type = 'INSERT'
  ) then
    grant insert on boracsport.role_audit_log to service_role;
  end if;

  -- rate_limit_buckets: si en el futuro el rate-limit se mueve de la
  -- memoria del proceso a la DB, service_role necesita escribirlo.
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'boracsport'
      and table_name = 'rate_limit_buckets'
      and grantee = 'service_role'
      and privilege_type = 'INSERT'
  ) then
    grant select, insert, update on boracsport.rate_limit_buckets to service_role;
  end if;
end
$$ language plpgsql;
