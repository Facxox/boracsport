-- Borac Sport — arreglo de grants para que el CHECK profiles_intereses_valid
-- y el trigger handle_new_user funcionen bajo permisos de authenticated/service_role.
-- Posterior a 20260804b. Idempotente.

set search_path = boracsport, public;

-- intereses_are_valid la usa el CHECK profiles_intereses_valid al evaluar
-- un UPDATE desde el cliente autenticado. Sin grant EXECUTE a authenticated,
-- la evaluación del CHECK falla con permission denied. Marcamos STABLE para
-- que Postgres pueda usar predicado simple y mantener el plan estable.
alter function boracsport.intereses_are_valid(jsonb) stable;

grant execute on function boracsport.intereses_are_valid(jsonb) to authenticated, service_role;

-- handle_new_user la dispara el trigger on auth.users; el trigger corre con
-- permisos del owner de la función, pero el rol que ejecuta el INSERT inicial
-- (auth.bootstrap) necesita poder invocarla. Aseguramos los grants correctos.
grant execute on function boracsport.handle_new_user() to authenticated, service_role;

comment on function boracsport.intereses_are_valid(jsonb) is
  'Valida array de intereses (≤10 strings, no vacíos, sin duplicados). SECURITY INVOKER; el caller necesita EXECUTE.';
comment on function boracsport.handle_new_user() is
  'Trigger AFTER INSERT on auth.users; crea perfil canónico copiando full_name, phone, intereses desde raw_user_meta_data. SECURITY DEFINER.';