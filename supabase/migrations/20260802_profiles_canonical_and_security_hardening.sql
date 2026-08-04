-- Borac Sport — profiles canónicos y hardening de funciones/policies.
-- Posterior a 20260801. Idempotente: safe to re-run.

set search_path = boracsport, public;

create or replace function boracsport.intereses_are_valid(value jsonb)
returns boolean
language sql
stable
set search_path = boracsport, public
as $$
  select
    jsonb_typeof(value) = 'array'
    and jsonb_array_length(value) <= 10
    and not exists (
      select 1
      from jsonb_array_elements(value) item
      where jsonb_typeof(item) <> 'string'
    )
    and (
      select count(*)
      from jsonb_array_elements_text(value)
    ) = (
      select count(distinct slug)
      from jsonb_array_elements_text(value) slug
    );
$$;

revoke all on function boracsport.intereses_are_valid(jsonb) from public;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'boracsport.profiles'::regclass
      and conname = 'profiles_intereses_valid'
  ) then
    alter table boracsport.profiles
      add constraint profiles_intereses_valid
      check (boracsport.intereses_are_valid(intereses));
  end if;
end $$;

create or replace function boracsport.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  initial_intereses jsonb := coalesce(new.raw_user_meta_data -> 'intereses', '[]'::jsonb);
begin
  if not boracsport.intereses_are_valid(initial_intereses) then
    initial_intereses := '[]'::jsonb;
  end if;

  insert into boracsport.profiles (id, full_name, phone, intereses)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    initial_intereses
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function boracsport.handle_new_user() from public;
revoke execute on function boracsport.handle_new_user() from anon, authenticated;

revoke all on function boracsport.get_my_role() from public;
grant execute on function boracsport.get_my_role() to authenticated, service_role;

alter function boracsport.sync_product_stock_from_variants()
  set search_path = boracsport, public;
alter function boracsport.check_variant_not_empty()
  set search_path = boracsport, public;
alter function boracsport.check_order_amounts()
  set search_path = boracsport, public;

-- Mantener exactamente los permisos existentes, pero cachear auth.uid()/role
-- por statement mediante initPlan.
drop policy if exists profiles_self_select on boracsport.profiles;
create policy profiles_self_select on boracsport.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select boracsport.get_my_role()) in ('admin', 'superadmin')
  );

drop policy if exists profiles_self_update on boracsport.profiles;
create policy profiles_self_update on boracsport.profiles
  for update to authenticated
  using (
    id = (select auth.uid())
    or (select boracsport.get_my_role()) in ('admin', 'superadmin')
  )
  with check (
    id = (select auth.uid())
    or (select boracsport.get_my_role()) in ('admin', 'superadmin')
  );

drop policy if exists profiles_admin_insert on boracsport.profiles;
create policy profiles_admin_insert on boracsport.profiles
  for insert to authenticated
  with check ((select boracsport.get_my_role()) in ('admin', 'superadmin'));

drop policy if exists profiles_admin_delete on boracsport.profiles;
create policy profiles_admin_delete on boracsport.profiles
  for delete to authenticated
  using ((select boracsport.get_my_role()) in ('admin', 'superadmin'));

comment on function boracsport.handle_new_user() is
  'Inicializa un profile desde auth.users sin pisar ediciones posteriores. Copia full_name, phone e intereses válidos; ejecución pública revocada.';
comment on function boracsport.intereses_are_valid(jsonb) is
  'Valida que intereses sea un array JSON de hasta 10 strings sin duplicados.';
