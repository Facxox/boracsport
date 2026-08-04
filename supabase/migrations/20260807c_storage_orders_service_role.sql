-- Borac Sport — service_role necesita poder escribir y firmar URLs del
-- bucket boracport_orders (comprobantes de transferencia) porque el endpoint
-- /api/orders/[id]/receipt usa createServiceClient() para subir el archivo
-- del cliente y devolver una signed URL.
-- Sin este grant, la storage policy "orders_receipt_admin_write" rechaza
-- el upload del comprobante aunque el caller sea el backend con service_role.
-- Idempotente.

set search_path = boracsport, public;

drop policy if exists orders_receipt_service_role_write on storage.objects;
create policy orders_receipt_service_role_write on storage.objects
  for all to service_role
  using (bucket_id = 'boracsport_orders')
  with check (bucket_id = 'boracsport_orders');

drop policy if exists orders_receipt_service_role_read on storage.objects;
create policy orders_receipt_service_role_read on storage.objects
  for select to service_role
  using (bucket_id = 'boracsport_orders');

comment on policy orders_receipt_service_role_write on storage.objects is
  'Permite al service_role (backend con SUPABASE_SERVICE_ROLE_KEY) subir, firmar y borrar comprobantes en boracport_orders.';