-- Borac Sport — Seed de categorías base (intereses del registro).
-- Re-siembra las 4 categorías canónicas con su `kind` correcto y `display_order`.
-- Idempotente: usa `on conflict` para actualizar si ya existen.
--
-- Causa: la migración `20260725b_wipe_all_except_users.sql` borró los datos
-- de las tablas excepto `auth.users`; las categorías quedaron vacías, lo
-- que rompía el registro en /registro?step=intereses (no había cards
-- para elegir y el botón quedaba bloqueado).
--
-- Esta migración NO depende de la migración inicial; sólo agrega filas.
-- Seguro de re-correr.

set search_path = boracsport, public;

insert into boracsport.categories (slug, label, emoji, description, display_order, active, kind)
values
  ('deportivo',     'Indumentaria Deportiva',      '⚽',  'Equipos y competición. Camisetas, shorts y medias sublimadas.',           10, true, 'ropa'),
  ('corporativo',   'Ropa de Trabajo & Corporativa', '💼', 'Uniformes premium para empresas. Chombas, polos y remeras corporativas.', 20, true, 'ropa'),
  ('dtf',           'DTF por Metro',               '🖨️', 'Impresión textil directa para talleres y marcas. Calidad profesional.',   30, true, 'otro'),
  ('merchandising', 'Merchandising Personalizado', '🎁', 'Artículos de marca a demanda. Tazas, pelotas, bolsos y más.',             40, true, 'otro')
on conflict (slug) do update
  set label         = excluded.label,
      emoji         = excluded.emoji,
      description   = excluded.description,
      display_order = excluded.display_order,
      active        = excluded.active,
      kind          = excluded.kind,
      updated_at    = timezone('utc', now());
