-- Borac Sport — Categorías: agregar columna kind.
-- kind define si la categoría usa variantes (ropa) o no (pelota, otro).
-- Idempotente: safe to re-run.

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1) CHECK constraint para kind (la dropeamos por si re-corrés el script).
--------------------------------------------------------------------------------
alter table boracsport.categories
  drop constraint if exists categories_kind_check;

alter table boracsport.categories
  add column if not exists kind text not null default 'otro';

alter table boracsport.categories
  add constraint categories_kind_check check (kind in ('ropa', 'pelota', 'otro'));

--------------------------------------------------------------------------------
-- 2) Setear kind='ropa' para las categorías de indumentaria (las del seed).
--    Las demás quedan en 'otro' por default.
--------------------------------------------------------------------------------
update boracsport.categories set kind = 'ropa'   where slug = 'deportivo';
update boracsport.categories set kind = 'ropa'   where slug = 'corporativo';
update boracsport.categories set kind = 'otro'   where slug = 'dtf';
update boracsport.categories set kind = 'otro'   where slug = 'merchandising';

--------------------------------------------------------------------------------
-- 3) Index para filtros rápidos en el admin / queries públicas.
--------------------------------------------------------------------------------
create index if not exists categories_kind_idx
  on boracsport.categories (kind);