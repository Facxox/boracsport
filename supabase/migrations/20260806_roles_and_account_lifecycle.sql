-- Borac Sport — separación admin/superadmin y eliminación de cuentas.
-- Posterior a 20260805. Idempotente.

set search_path = boracsport, public;

create or replace function boracsport.require_superadmin()
returns boracsport.user_role
language sql
stable
security definer
set search_path = boracsport, public
as $$
  select boracsport.get_my_role()
$$;

revoke all on function boracsport.require_superadmin() from public;
grant execute on function boracsport.require_superadmin() to service_role, authenticated;

comment on function boracsport.require_superadmin() is
  'Verifica que el usuario actual sea superadmin. Lanza 42501 si get_my_role devuelve otro valor.';

create or replace function boracsport.promote_user_role(p_target_id uuid, p_new_role boracsport.user_role)
returns boolean
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_actor boracsport.user_role := boracsport.get_my_role();
  v_old_role boracsport.user_role;
  v_count_admins integer;
begin
  if v_actor is distinct from 'superadmin' then
    raise exception 'se requiere superadmin' using errcode = '42501';
  end if;

  if p_new_role not in ('user', 'admin', 'superadmin') then
    raise exception 'rol inválido' using errcode = '22023';
  end if;

  select role into v_old_role
    from boracsport.profiles
   where id = p_target_id
   for update;
  if v_old_role is null then
    raise exception 'perfil inexistente' using errcode = 'P0002';
  end if;

  -- Proteger al último superadmin: no degradar si es el único.
  if v_old_role = 'superadmin' and p_new_role <> 'superadmin' then
    select count(*) into v_count_admins
      from boracsport.profiles
     where role = 'superadmin';
    if v_count_admins <= 1 then
      raise exception 'último superadmin' using errcode = '42501';
    end if;
  end if;

  update boracsport.profiles
     set role = p_new_role
   where id = p_target_id;

  insert into boracsport.role_audit_log (actor_id, actor_role, target_user_id, before_role, after_role)
  values (auth.uid(), v_actor, p_target_id, v_old_role::text, p_new_role::text);

  return true;
end;
$$;

revoke all on function boracsport.promote_user_role(uuid, boracsport.user_role) from public;
grant execute on function boracsport.promote_user_role(uuid, boracsport.user_role) to service_role, authenticated;

comment on function boracsport.promote_user_role(uuid, boracsport.user_role) is
  'Cambia el rol de un usuario. Requiere superadmin y protege al último superadmin. Audita el cambio.';

alter table boracsport.role_audit_log
  add column if not exists target_user_id uuid,
  add column if not exists before_role text,
  add column if not exists after_role text;

create or replace function boracsport.delete_user_account(p_target_id uuid)
returns boolean
language plpgsql
security definer
set search_path = boracsport, public
as $$
declare
  v_actor boracsport.user_role := boracsport.get_my_role();
  v_count_admins integer;
begin
  -- Sólo superadmin puede borrar usuarios; los usuarios autenticados pueden
  -- pedir su propia eliminación vía Edge Function o flujo equivalente.
  if v_actor is distinct from 'superadmin' then
    raise exception 'se requiere superadmin' using errcode = '42501';
  end if;

  -- Proteger al último superadmin.
  if exists (select 1 from boracsport.profiles where id = p_target_id and role = 'superadmin') then
    select count(*) into v_count_admins
      from boracsport.profiles
     where role = 'superadmin';
    if v_count_admins <= 1 then
      raise exception 'último superadmin' using errcode = '42501';
    end if;
  end if;

  -- Registrar el evento antes de borrar.
  insert into boracsport.role_audit_log (actor_id, actor_role, target_user_id, before_role, after_role)
  select auth.uid(), v_actor, p_target_id, role::text, 'deleted'
    from boracsport.profiles
   where id = p_target_id;

  -- Pedidos: mantener con user_id null por la FK set null del esquema.
  -- Profiles y designs: cascadas ya configuradas en la migración inicial.

  -- Limpieza de Storage del usuario en boracsport_customizations.
  delete from storage.objects
   where bucket_id = 'boracsport_customizations'
     and (storage.foldername(name))[1] = p_target_id::text;

  -- Borrar al usuario de Auth (requiere service_role; aquí corre con permisos
  -- del dueño de la función SECURITY DEFINER).
  delete from auth.users where id = p_target_id;

  return true;
end;
$$;

revoke all on function boracsport.delete_user_account(uuid) from public;
grant execute on function boracsport.delete_user_account(uuid) to service_role;

comment on function boracsport.delete_user_account(uuid) is
  'Elimina Auth user + profile + diseños en cascada; conserva orders; limpia Storage. Solo service_role.';