-- Borac Sport — restringe la ejecución directa del trigger de stock.
-- El trigger sigue pudiendo invocar la función; la RPC deja de exponerse.

set search_path = boracsport, public;

revoke all on function boracsport.sync_product_stock_from_variants() from public;
revoke execute on function boracsport.sync_product_stock_from_variants()
  from anon, authenticated, service_role;

comment on function boracsport.sync_product_stock_from_variants() is
  'Trigger interno AFTER INSERT/UPDATE/DELETE en product_variants. Sin ejecución RPC para anon/authenticated/service_role; sincroniza products.stock para ropa o pelota.';
