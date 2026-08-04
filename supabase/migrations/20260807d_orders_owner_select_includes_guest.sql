-- Borac Sport — agregar el caso user_id IS NULL a orders_owner_select
-- para que el cliente guest (sin sesión) pueda leer el pedido que acaba de
-- crear y subir el comprobante. Idempotente.

set search_path = boracsport, public;

drop policy if exists orders_owner_select on boracsport.orders;
create policy orders_owner_select on boracsport.orders
  for select to authenticated
  using (
    user_id = auth.uid()
    or user_id is null
    or (select boracsport.get_my_role()) in ('admin', 'superadmin')
  );

comment on policy orders_owner_select on boracsport.orders is
  'Permite SELECT a: (a) dueño user_id=auth.uid(), (b) pedidos guest con user_id NULL (compatibilidad con /api/orders/[id]/receipt), (c) admin/superadmin.';