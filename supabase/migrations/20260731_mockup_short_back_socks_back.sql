-- Mockups para el "atras" del short y de las medias.
-- Estas columnas son opcionales (nullable) para mantener compatibilidad con
-- plantillas existentes. Cuando el admin las sube, el editor 2D las usa
-- como fondo detras del canvas de estampado.

set search_path = boracsport, public;

alter table boracsport.templates
  add column if not exists mockup_url_short_back text,
  add column if not exists mockup_url_socks_back text;