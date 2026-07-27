-- Drop 3D model assets from the templates table.
--
-- El diseñador 3D fue reemplazado por un editor 2D que sólo necesita
-- los mockups planos. Las columnas model_url / model_format (legacy) y
-- los 3 pares por variante (shirt / short / socks) ya no se consumen en
-- ningún lado (admin, queries, cliente). Los mockups (mockup_url_*) se
-- preservan para futuro uso (overlay sobre mockup de fondo).

set search_path = boracsport, public;

alter table boracsport.templates
  drop column if exists model_url,
  drop column if exists model_format,
  drop column if exists model_url_shirt,
  drop column if exists model_format_shirt,
  drop column if exists model_url_short,
  drop column if exists model_format_short,
  drop column if exists model_url_socks,
  drop column if exists model_format_socks;

alter table boracsport.templates
  drop constraint if exists templates_model_format_shirt_check,
  drop constraint if exists templates_model_format_short_check,
  drop constraint if exists templates_model_format_socks_check;