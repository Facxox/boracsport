-- Borac Sport — Admin actions hardening.
-- Ensure products.category_id is set for all active products and the FK index exists.
-- Idempotent: safe to run multiple times.

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1) Asegurar que category_id puede ser null momentáneamente (drafts).
--------------------------------------------------------------------------------
alter table boracsport.products
  alter column category_id drop not null;

--------------------------------------------------------------------------------
-- 2) Backfill: para cualquier producto activo sin category_id, resolver
--    desde el slug legacy de category.
--------------------------------------------------------------------------------
update boracsport.products p
set category_id = c.id
from boracsport.categories c
where c.slug = p.category
  and p.category_id is null;

--------------------------------------------------------------------------------
-- 3) Índice para joins por category_id.
--------------------------------------------------------------------------------
create index if not exists products_category_id_idx
  on boracsport.products (category_id);

--------------------------------------------------------------------------------
-- 4) Asegurar que products_admin_write cubre update sobre category_id.
--    La policy existente products_admin_write ya cubre todas las columnas,
--    no se redefine. Solo agregamos comentario.
--------------------------------------------------------------------------------