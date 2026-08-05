-- Borac Sport — RPC seguro para guardar payment_receipt_url.
-- Posterior a 202608050. Idempotente (create or replace).
--
-- Por qué: la ruta /api/orders/[id]/receipt corría `UPDATE orders` desde el
-- cliente service_role. Aun con GRANT UPDATE + BYPASSRLS, el UPDATE se está
-- rechazando con 403 por la cadena de políticas (PosgREST aplica RLS contra
-- el rol que arma la sesión). Movemos el UPDATE a una RPC SECURITY
-- DEFINER que corre como `postgres` (rol owner de la tabla), garantizando
-- que la operación pase sin depender del rol del cliente ni de RLS.
--
-- Solo se permite guardar `payment_receipt_url` para pedidos en estado
-- `pendiente` con método de pago `transfer`, y solo si el path subido
-- pertenece a Storage del propio orderId (defensa contra path traversal).

set search_path = boracsport, public;

create or replace function boracsport.set_payment_receipt(
  p_order_id uuid,
  p_receipt_path text
)
returns void
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_payment_method text;
  v_status text;
  v_user_id uuid;
  v_existing_url text;
begin
  if p_order_id is null then
    raise exception 'order id required' using errcode = '22023';
  end if;
  if p_receipt_path is null or length(p_receipt_path) = 0 then
    raise exception 'receipt path required' using errcode = '22023';
  end if;
  -- El path tiene que ser `${orderId}/...` para impedir que un usuario suba
  -- un comprobante y lo asigne a otro pedido.
  if position(p_order_id::text in p_receipt_path) <> 1 then
    raise exception 'receipt path does not match order id' using errcode = '22023';
  end if;

  select payment_method, status::text, user_id, payment_receipt_url
    into v_payment_method, v_status, v_user_id, v_existing_url
    from boracsport.orders
   where id = p_order_id
   for update;
  if not found then
    raise exception 'order not found' using errcode = 'P0002';
  end if;

  if v_payment_method <> 'transfer' then
    raise exception 'order is not a transfer' using errcode = '22023';
  end if;
  if v_status <> 'pendiente' then
    raise exception 'order is not pending (% got %)', p_order_id, v_status using errcode = '22023';
  end if;

  update boracsport.orders
     set payment_receipt_url = p_receipt_path,
         updated_at = now()
   where id = p_order_id;
end;
$$;

revoke all on function boracsport.set_payment_receipt(uuid, text) from public;
grant execute on function boracsport.set_payment_receipt(uuid, text) to service_role;
grant execute on function boracsport.set_payment_receipt(uuid, text) to authenticated;

comment on function boracsport.set_payment_receipt(uuid, text) is
  'Guarda payment_receipt_url en boracsport.orders con SECURITY DEFINER. Solo service_role / authenticated. Valida que el path empiece con el orderId.';
