-- Fix: hero_slides RLS policies faltantes en el rebuild.
-- La migración 20260725c_full_reset_and_rebuild.sql recrea la tabla hero_slides
-- con RLS habilitado y otorga select a anon/authenticated, pero omite las
-- policies. Sin policy, RLS deniega todo (permission denied).
-- Esta migración recrea las policies equivalentes a las de
-- 20260716_admin_extensibility.sql (hero_slides_public_active,
-- hero_slides_admin_write).

drop policy if exists hero_slides_public_active on boracsport.hero_slides;
create policy hero_slides_public_active on boracsport.hero_slides for select
  using (active or boracsport.get_my_role() in ('admin', 'superadmin'));

drop policy if exists hero_slides_admin_write on boracsport.hero_slides;
create policy hero_slides_admin_write on boracsport.hero_slides for all to authenticated
  using (boracsport.get_my_role() in ('admin', 'superadmin'))
  with check (boracsport.get_my_role() in ('admin', 'superadmin'));
