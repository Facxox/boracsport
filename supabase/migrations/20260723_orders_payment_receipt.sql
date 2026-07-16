-- Borac Sport — orders.payment_receipt + private bucket for receipts.
-- Idempotent: safe to run multiple times.

set search_path = boracsport, public;

--------------------------------------------------------------------------------
-- 1. orders.payment_receipt_url
--------------------------------------------------------------------------------
alter table boracsport.orders
  add column if not exists payment_receipt_url text;

create index if not exists orders_payment_receipt_idx
  on boracsport.orders (payment_receipt_url)
  where payment_receipt_url is not null;

--------------------------------------------------------------------------------
-- 2. storage bucket boracsport_orders (private)
--------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('boracsport_orders', 'boracsport_orders', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists orders_receipt_admin_read on storage.objects;
create policy orders_receipt_admin_read on storage.objects for select to authenticated
  using (
    bucket_id = 'boracsport_orders'
    and boracsport.get_my_role() in ('admin', 'superadmin')
  );

drop policy if exists orders_receipt_admin_write on storage.objects;
create policy orders_receipt_admin_write on storage.objects for all to authenticated
  using (
    bucket_id = 'boracsport_orders'
    and boracsport.get_my_role() in ('admin', 'superadmin')
  )
  with check (
    bucket_id = 'boracsport_orders'
    and boracsport.get_my_role() in ('admin', 'superadmin')
  );

-- Receipt uploads happen via a server-side Route Handler using the service role,
-- so the public client never hits these policies directly. They remain as a
-- defense-in-depth: only admins may read or write inside this bucket.
--------------------------------------------------------------------------------