-- Borac Sport — tokens de confirmación, rate limit compartido y separación admin.
-- Posterior a 20260804. Idempotente.

set search_path = boracsport, public;

drop table if exists boracsport.order_confirmation_tokens;

create table boracsport.order_confirmation_tokens (
  token text primary key,
  order_id uuid not null references boracsport.orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create index order_confirmation_tokens_order_id_idx
  on boracsport.order_confirmation_tokens (order_id);
create index order_confirmation_tokens_expires_at_idx
  on boracsport.order_confirmation_tokens (expires_at)
  where consumed_at is null;

revoke all on boracsport.order_confirmation_tokens from public;
grant select on boracsport.order_confirmation_tokens to authenticated;

comment on table boracsport.order_confirmation_tokens is
  'Tokens firmados de corta duración emitidos por create_order_with_stock y consumidos por el endpoint público de confirmación de pedido.';

drop table if exists boracsport.rate_limit_buckets;

create table boracsport.rate_limit_buckets (
  bucket_key text primary key,
  hits integer not null default 0,
  window_started_at timestamptz not null default now(),
  window_expires_at timestamptz not null
);

create index rate_limit_buckets_expires_at_idx
  on boracsport.rate_limit_buckets (window_expires_at);

revoke all on boracsport.rate_limit_buckets from public;

create or replace function boracsport.consume_rate_limit(
  p_bucket_key text,
  p_window_seconds integer,
  p_max_hits integer
)
returns boolean
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_now timestamptz := now();
  v_record boracsport.rate_limit_buckets%rowtype;
  v_hits integer;
begin
  if p_bucket_key is null or length(p_bucket_key) = 0 then
    raise exception 'bucket_key required' using errcode = '22023';
  end if;
  if p_window_seconds <= 0 or p_max_hits <= 0 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  insert into boracsport.rate_limit_buckets as r
    (bucket_key, hits, window_started_at, window_expires_at)
  values
    (p_bucket_key, 1, v_now, v_now + make_interval(secs => p_window_seconds))
  on conflict (bucket_key) do update
    set hits = case
      when boracsport.rate_limit_buckets.window_expires_at <= v_now then 1
      else boracsport.rate_limit_buckets.hits + 1
    end,
    window_started_at = case
      when boracsport.rate_limit_buckets.window_expires_at <= v_now then v_now
      else boracsport.rate_limit_buckets.window_started_at
    end,
    window_expires_at = case
      when boracsport.rate_limit_buckets.window_expires_at <= v_now then v_now + make_interval(secs => p_window_seconds)
      else boracsport.rate_limit_buckets.window_expires_at
    end
  returning * into v_record;

  -- Aprovechamos para limpiar buckets vencidos (los más antiguos primero).
  delete from boracsport.rate_limit_buckets where window_expires_at < v_now;

  return v_record.hits <= p_max_hits;
end;
$$;

revoke all on function boracsport.consume_rate_limit(text, integer, integer) from public;
grant execute on function boracsport.consume_rate_limit(text, integer, integer) to service_role;

comment on function boracsport.consume_rate_limit(text, integer, integer) is
  'Ventana deslizante: incrementa hits y devuelve false cuando supera p_max_hits en p_window_seconds. Sólo service_role.';

create or replace function boracsport.issue_order_confirmation_token(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_token text := encode(gen_random_bytes(24), 'hex');
  v_expires timestamptz := now() + interval '30 minutes';
begin
  insert into boracsport.order_confirmation_tokens (token, order_id, expires_at)
  values (v_token, p_order_id, v_expires);
  return v_token;
end;
$$;

revoke all on function boracsport.issue_order_confirmation_token(uuid) from public;
grant execute on function boracsport.issue_order_confirmation_token(uuid) to service_role;

comment on function boracsport.issue_order_confirmation_token(uuid) is
  'Genera y persiste un token firmado de corta duración asociado a un pedido.';

create or replace function boracsport.consume_order_confirmation_token(p_token text, p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_now timestamptz := now();
begin
  update boracsport.order_confirmation_tokens t
     set consumed_at = v_now
   where t.token = p_token
     and t.order_id = p_order_id
     and t.consumed_at is null
     and t.expires_at > v_now;
  return found;
end;
$$;

revoke all on function boracsport.consume_order_confirmation_token(text, uuid) from public;

comment on function boracsport.consume_order_confirmation_token(text, uuid) is
  'Marca el token como consumido. Uso interno desde Supabase si se requiere, no expuesto.';

-- Separación de policies de admin y superadmin para pedidos.
drop policy if exists orders_admin_update on boracsport.orders;
create policy orders_admin_update on boracsport.orders
  for update to authenticated
  using ((select boracsport.get_my_role()) in ('admin', 'superadmin'))
  with check ((select boracsport.get_my_role()) in ('admin', 'superadmin'));

-- Mantener la policy admin_insert/delete existente con el mismo listado.

-- Acción admin para transiciones (status, payment_status) con machine de estados.
create or replace function boracsport.transition_order_status(
  p_order_id uuid,
  p_next_status text,
  p_next_payment_status text
)
returns boolean
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_caller_role boracsport.user_role;
  v_current_status text;
  v_current_payment text;
  v_user_id uuid;
  v_amount_subtotal numeric;
  v_amount_total numeric;
  v_allowed_status text[] := array['pendiente', 'confirmado', 'en_produccion', 'enviado', 'entregado', 'cancelado'];
  v_allowed_payment text[] := array['pendiente', 'aprobado', 'rechazado', 'reembolsado'];
begin
  v_caller_role := boracsport.get_my_role();
  if v_caller_role is null or v_caller_role not in ('admin', 'superadmin') then
    raise exception 'no autorizado' using errcode = '42501';
  end if;

  if p_next_status is not null and not (p_next_status = any(v_allowed_status)) then
    raise exception 'status inválido: %', p_next_status using errcode = '22023';
  end if;
  if p_next_payment_status is not null and not (p_next_payment_status = any(v_allowed_payment)) then
    raise exception 'payment_status inválido: %', p_next_payment_status using errcode = '22023';
  end if;

  select status, payment_status, user_id, subtotal, total
    into v_current_status, v_current_payment, v_user_id, v_amount_subtotal, v_amount_total
    from boracsport.orders
   where id = p_order_id
   for update;
  if not found then
    raise exception 'pedido inexistente' using errcode = 'P0002';
  end if;

  -- Cambios de importes o user_id quedan reservados al superadmin o al sistema.
  if v_user_id is null and v_caller_role <> 'superadmin' then
    raise exception 'asignar user_id requiere superadmin' using errcode = '42501';
  end if;

  update boracsport.orders
     set status = coalesce(p_next_status, status),
         payment_status = coalesce(p_next_payment_status, payment_status)
   where id = p_order_id;

  insert into boracsport.role_audit_log (actor_id, actor_role, target_order_id, before_status, before_payment_status, after_status, after_payment_status)
  values (
    auth.uid(),
    v_caller_role,
    p_order_id,
    v_current_status,
    v_current_payment,
    coalesce(p_next_status, v_current_status),
    coalesce(p_next_payment_status, v_current_payment)
  );

  return true;
end;
$$;

revoke all on function boracsport.transition_order_status(uuid, text, text) from public;
grant execute on function boracsport.transition_order_status(uuid, text, text) to service_role, authenticated;

comment on function boracsport.transition_order_status(uuid, text, text) is
  'Transición validada de status/payment_status con máquina de estados, auditoría y autorización admin/superadmin.';

drop table if exists boracsport.role_audit_log;

create table boracsport.role_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_role boracsport.user_role,
  target_order_id uuid,
  before_status text,
  before_payment_status text,
  after_status text,
  after_payment_status text,
  created_at timestamptz not null default now()
);

alter table boracsport.role_audit_log enable row level security;

create policy role_audit_log_admin_select on boracsport.role_audit_log
  for select to authenticated
  using ((select boracsport.get_my_role()) in ('admin', 'superadmin'));

revoke all on boracsport.role_audit_log from public;
grant select on boracsport.role_audit_log to authenticated;

comment on table boracsport.role_audit_log is
  'Auditoría de transiciones de estado de pedidos y eventos sensibles administrativos.';