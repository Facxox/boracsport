-- Borac Sport — Wipe total: borra TODO excepto profiles (usuarios).
-- Resetea secuencias, deja el schema limpio para arrancar de cero.
-- Después de correr esto, podés volver a cargar categorías y productos
-- desde el panel admin.
--
-- ⚠️ DESTRUCTIVO. Ejecutar una sola vez.

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1) Limpiar tablas transaccionales y de contenido (orden importa por FK).
--------------------------------------------------------------------------------

-- Pedidos dependen de usuarios (perfil) — los borramos igual, pero NO
-- queremos perder profiles. ON DELETE CASCADE en product_variants hace
-- el trabajo por nosotros al borrar products.
truncate table boracsport.orders restart identity cascade;

-- Designs (configurador 3D) — ligados al user, los borramos.
truncate table boracsport.designs restart identity cascade;

-- Variantes se borran en cascada con products.
truncate table boracsport.products restart identity cascade;

-- Templates (diseños base del configurador 3D).
truncate table boracsport.templates restart identity cascade;

-- Hero carousel del home.
truncate table boracsport.hero_slides restart identity cascade;

-- Sections y categorías — los re-creamos abajo con los seeds originales.
truncate table boracsport.sections restart identity cascade;
truncate table boracsport.categories restart identity cascade;

--------------------------------------------------------------------------------
-- 2) Re-seedear categorías hardcodeadas (las del registro / intereses).
--------------------------------------------------------------------------------
insert into boracsport.categories (slug, label, emoji, description, display_order)
values
  ('deportivo',     'Indumentaria Deportiva',        '⚽',  'Equipos y competición. Camisetas, shorts y medias sublimadas.',           10),
  ('corporativo',   'Ropa de Trabajo & Corporativa',  '💼', 'Uniformes premium para empresas. Chombas, polos y remeras corporativas.', 20),
  ('dtf',           'DTF por Metro',                 '🖨️', 'Impresión textil directa para talleres y marcas. Calidad profesional.',   30),
  ('merchandising', 'Merchandising Personalizado',   '🎁', 'Artículos de marca a demanda. Tazas, pelotas, bolsos y más.',             40)
on conflict (slug) do update set
  label = excluded.label,
  emoji = excluded.emoji,
  description = excluded.description,
  display_order = excluded.display_order;

--------------------------------------------------------------------------------
-- 3) profiles NO se toca. La tabla de usuarios queda intacta con sus roles.
--    Si querés re-crear el trigger updated_at por si acaso, lo (re)creamos.
--------------------------------------------------------------------------------

drop trigger if exists profiles_set_updated_at on boracsport.profiles;
create trigger profiles_set_updated_at
  before update on boracsport.profiles
  for each row execute function boracsport.set_updated_at();

--------------------------------------------------------------------------------
-- 4) Recalcular contadores / display_order limpios.
--------------------------------------------------------------------------------
update boracsport.categories set active = true;

--------------------------------------------------------------------------------
-- 5) Resumen — esta migration NO es idempotente. Si la corrés dos veces,
--    la segunda vez simplemente trunca tablas vacías (no falla) y re-seedea
--    las categorías.
--------------------------------------------------------------------------------