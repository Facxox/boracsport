-- Borac Sport — completar GRANT SELECT público sobre tablas que ya tienen policy.
-- Posterior a 202608051. Idempotente.
--
-- Por qué: hero_slides, design_presets y design_preset_variants tienen su
-- policy SELECT para el rol public (anon + authenticated), pero les falta el
-- GRANT a nivel de tabla. Sin GRANT, el SELECT devuelve 403 incluso cuando
-- la policy lo permitiría. Eso rompe el render del storefront cuando las
-- queries del server component (hero, presets home, /disenos-base) chocan
-- contra 403.
--
-- Esta migración otorga SELECT explícito al rol public (= anon +
-- authenticated) sobre esas tres tablas, sin tocar policies ni roles
-- administrativos. El INSERT/UPDATE/DELETE sigue protegido por las policies
-- existentes y por no haber grant explícito.

set search_path = boracsport, public;

do $$
begin
  -- hero_slides: storefront lee los slides activos en / y en /admin/hero.
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'boracsport' and table_name = 'hero_slides'
      and grantee = 'anon' and privilege_type = 'SELECT'
  ) then
    grant select on boracsport.hero_slides to anon, authenticated;
  end if;

  -- design_presets: home muestra el rail de "Diseños base" y /disenos-base
  -- lista los presets públicos. La policy `design_presets_public_active` ya
  -- filtra por active=true.
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'boracsport' and table_name = 'design_presets'
      and grantee = 'anon' and privilege_type = 'SELECT'
  ) then
    grant select on boracsport.design_presets to anon, authenticated;
  end if;

  -- design_preset_variants: el storefront necesita leer variantes activas
  -- para validar stock al armar un pedido.
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'boracsport' and table_name = 'design_preset_variants'
      and grantee = 'anon' and privilege_type = 'SELECT'
  ) then
    grant select on boracsport.design_preset_variants to anon, authenticated;
  end if;
end
$$ language plpgsql;
