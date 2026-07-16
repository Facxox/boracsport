-- Borac Sport — products.on_sale + category reorder support.
-- Idempotent: safe to run multiple times.

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1. products.on_sale
--------------------------------------------------------------------------------
alter table boracsport.products
  add column if not exists on_sale boolean not null default false;

create index if not exists products_on_sale_idx
  on boracsport.products (on_sale)
  where active and on_sale;

--------------------------------------------------------------------------------
-- 2. categories.display_order index already exists from migration 20260716.
-- No structural change needed; reorderCategoriesAction uses UPDATE on existing column.
--------------------------------------------------------------------------------