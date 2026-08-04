-- Borac Sport — Creación transaccional de pedidos.
-- Posterior a 20260803. Idempotente.

set search_path = boracsport, public;

drop function if exists boracsport.create_order_with_stock(jsonb, jsonb);

create function boracsport.create_order_with_stock(
  p_order jsonb,
  p_consumptions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_user_id           text;
  v_items             jsonb;
  v_subtotal          numeric;
  v_total             numeric;
  v_payment_method    text;
  v_payment_receipt   text;
  v_shipping_details  jsonb;
  v_cart_hash         text;
  v_force_new         boolean;
  v_consumptions      jsonb;
  v_has_physical      boolean := false;
  v_design_only       boolean;
  v_reused_order_id   uuid;
  v_reused_subtotal   numeric;
  v_reused_total      numeric;
  v_reused_payment    text;
  v_reused_status     text;
  v_reused_pstatus    text;
  v_reused_created_at timestamptz;
  v_reused_shipping   jsonb;
  v_new_order_id      uuid;
  v_consumption       jsonb;
  v_kind              text;
  v_target_id         uuid;
  v_qty               int;
  v_total_qty         int;
  v_current_stock     int;
  v_locked_rows       text[];
  v_consolidation     jsonb;
  v_key               text;
  v_current_value     numeric;
  v_insert            jsonb;
begin
  if jsonb_typeof(p_order) <> 'object' then
    raise exception 'p_order must be a json object' using errcode = '22023';
  end if;
  if jsonb_typeof(p_consumptions) <> 'array' then
    raise exception 'p_consumptions must be a json array' using errcode = '22023';
  end if;

  v_user_id          := nullif(p_order ->> 'user_id', '');
  v_items            := p_order -> 'items';
  v_subtotal         := (p_order ->> 'subtotal')::numeric;
  v_total            := (p_order ->> 'total')::numeric;
  v_payment_method   := p_order ->> 'payment_method';
  v_payment_receipt  := nullif(p_order ->> 'payment_receipt_url', '');
  v_shipping_details := p_order -> 'shipping_details';
  v_cart_hash        := nullif(p_order ->> 'cart_hash', '');
  v_force_new        := coalesce((p_order ->> 'force_new')::boolean, false);
  v_consumptions     := p_consumptions;

  if v_items is null or jsonb_typeof(v_items) <> 'array' then
    raise exception 'items must be an array' using errcode = '22023';
  end if;
  if v_subtotal < 0 or v_total < 0 or v_total < v_subtotal then
    raise exception 'invalid totals' using errcode = '22023';
  end if;
  if v_payment_method is null or v_payment_method not in ('whatsapp', 'transfer', 'mercadopago') then
    raise exception 'invalid payment_method' using errcode = '22023';
  end if;
  if v_shipping_details is null or jsonb_typeof(v_shipping_details) <> 'object' then
    raise exception 'shipping_details must be a json object' using errcode = '22023';
  end if;

  -- Para deduplicar consumo entre líneas repetidas por variant/product.
  v_consolidation := '{}'::jsonb;
  for v_consumption in select * from jsonb_array_elements(v_consumptions)
  loop
    v_kind      := v_consumption ->> 'kind';
    v_target_id := (v_consumption ->> 'id')::uuid;
    v_qty       := (v_consumption ->> 'qty')::int;
    v_key       := v_kind || ':' || v_target_id::text;
    if v_kind not in ('variant', 'product') or v_target_id is null or v_qty is null or v_qty <= 0 then
      raise exception 'invalid consumption entry' using errcode = '22023';
    end if;
    v_current_value := coalesce((v_consolidation ->> v_key)::numeric, 0);
    v_consolidation := v_consolidation || jsonb_build_object(v_key, v_current_value + v_qty);
  end loop;

  v_locked_rows := array[]::text[];

  if not v_force_new and v_cart_hash is not null then
    -- Dedupe previo: un pedido idéntico del mismo cliente en la ventana corta
    -- evita duplicados por doble-click. Se hace ANTES de bloquear stock para
    -- no castigar al sistema cuando ya hay respuesta.
    select o.id, o.subtotal, o.total, o.payment_method, o.status, o.payment_status, o.created_at, o.shipping_details
      into v_reused_order_id, v_reused_subtotal, v_reused_total, v_reused_payment, v_reused_status, v_reused_pstatus, v_reused_created_at, v_reused_shipping
      from boracsport.orders o
     where (o.shipping_details ->> 'cartHash') is not null
       and (o.shipping_details ->> 'cartHash') = v_cart_hash
       and o.created_at >= (now() - interval '5 minutes')
     order by o.created_at desc
     limit 1;

    if v_reused_order_id is not null then
      if lower(coalesce(v_reused_shipping ->> 'email', '')) = lower(coalesce(v_shipping_details ->> 'email', ''))
         and regexp_replace(coalesce(v_reused_shipping ->> 'phone', ''), '\D', '', 'g')
             = regexp_replace(coalesce(v_shipping_details ->> 'phone', ''), '\D', '', 'g') then
        return jsonb_build_object(
          'reused', true,
          'order_id', v_reused_order_id,
          'subtotal', v_reused_subtotal,
          'shipping', greatest(v_reused_total - v_reused_subtotal, 0),
          'total', v_reused_total,
          'payment_method', v_reused_payment,
          'status', v_reused_status,
          'payment_status', v_reused_pstatus,
          'created_at', v_reused_created_at
        );
      end if;
    end if;
  end if;

  -- Lock determinista: ordenamos alfabéticamente para evitar deadlocks cuando
  -- dos requests tocan las mismas filas.
  select array_agg(key order by key) into v_locked_rows
    from (select distinct kv.key as key from jsonb_each(v_consolidation) kv) s;

  v_total_qty := 0;
  foreach v_key in array v_locked_rows loop
    v_kind := split_part(v_key, ':', 1);
    v_target_id := split_part(v_key, ':', 2)::uuid;
    v_total_qty := coalesce((v_consolidation ->> v_key)::numeric, 0)::int;

    if v_kind = 'variant' then
      select stock into v_current_stock
        from boracsport.product_variants
       where id = v_target_id and active = true
       for update;
    else
      select stock into v_current_stock
        from boracsport.products
       where id = v_target_id and active = true
       for update;
    end if;

    if v_current_stock is null then
      raise exception 'consumption target not available' using errcode = 'P0002';
    end if;
    if v_current_stock < v_total_qty then
      raise exception 'insufficient stock for % % (% remaining, % requested)', v_kind, v_target_id, v_current_stock, v_total_qty
        using errcode = 'P0001';
    end if;
  end loop;

  -- Aplicar descuentos.
  foreach v_key in array v_locked_rows loop
    v_kind := split_part(v_key, ':', 1);
    v_target_id := split_part(v_key, ':', 2)::uuid;
    v_total_qty := (v_consolidation ->> v_key)::numeric::int;

    if v_kind = 'variant' then
      update boracsport.product_variants
         set stock = stock - v_total_qty
       where id = v_target_id;
    else
      update boracsport.products
         set stock = stock - v_total_qty
       where id = v_target_id;
    end if;
  end loop;

  -- Detectar si hay ítems físicos (con consumo) vs sólo diseños.
  v_design_only := jsonb_array_length(v_consumptions) = 0;

  insert into boracsport.orders (
    user_id, items, subtotal, total, status, payment_method, payment_status, payment_receipt_url, shipping_details
  ) values (
    nullif(v_user_id, '')::uuid,
    v_items,
    v_subtotal,
    v_total,
    'pendiente',
    v_payment_method,
    'pendiente',
    nullif(v_payment_receipt, ''),
    v_shipping_details
  )
  returning id into v_new_order_id;

  return jsonb_build_object(
    'reused', false,
    'order_id', v_new_order_id,
    'subtotal', v_subtotal,
    'shipping', greatest(v_total - v_subtotal, 0),
    'total', v_total,
    'design_only', v_design_only
  );
end;
$$;

revoke all on function boracsport.create_order_with_stock(jsonb, jsonb) from public;
grant execute on function boracsport.create_order_with_stock(jsonb, jsonb) to service_role;

comment on function boracsport.create_order_with_stock(jsonb, jsonb) is
  'Crea un pedido y descuenta stock en una sola transacción. SECURITY DEFINER, ejecutable únicamente por service_role. Realiza dedupe por cartHash antes de lockear stock.';