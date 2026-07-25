-- Fix 3: soporte de variantes (cuello / short / medias).
-- Cada plantilla puede tener mockups por zona visual y modelos 3D
-- separados por variante (shirt / short / socks). Las columnas nuevas
-- son opcionales (nullable) para mantener compatibilidad con
-- plantillas preexistentes. `model_url` / `model_format` legacy se
-- derivan server-side desde el par elegido como "principal" en el
-- form de admin.

set search_path = boracsport, public;

alter table boracsport.templates
  add column if not exists mockup_url_neck text,
  add column if not exists mockup_url_collar text,
  add column if not exists mockup_url_sleeves text,
  add column if not exists mockup_url_cuffs text,
  add column if not exists mockup_url_short text,
  add column if not exists mockup_url_socks text,
  add column if not exists model_url_shirt text,
  add column if not exists model_format_shirt text,
  add column if not exists model_url_short text,
  add column if not exists model_format_short text,
  add column if not exists model_url_socks text,
  add column if not exists model_format_socks text;

alter table boracsport.templates
  drop constraint if exists templates_model_format_shirt_check,
  add constraint templates_model_format_shirt_check
    check (model_format_shirt is null or model_format_shirt in ('glb','gltf')),
  drop constraint if exists templates_model_format_short_check,
  add constraint templates_model_format_short_check
    check (model_format_short is null or model_format_short in ('glb','gltf')),
  drop constraint if exists templates_model_format_socks_check,
  add constraint templates_model_format_socks_check
    check (model_format_socks is null or model_format_socks in ('glb','gltf'));
