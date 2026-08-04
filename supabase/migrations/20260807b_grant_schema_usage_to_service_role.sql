-- Borac Sport — service_role necesita USAGE sobre el schema boracsport para
-- invocar las SECURITY DEFINER RPC y para acceder a las tablas vía PostgREST.
-- Sin este grant, el endpoint /api/orders devolvía 503 con "permission denied
-- for schema boracsport".
-- Idempotente.

set search_path = boracsport, public;

grant usage on schema boracsport to service_role;

comment on schema boracsport is
  'Schema dedicado de BoracSport. service_role tiene USAGE y EXECUTE sobre las SECURITY DEFINER RPC.';