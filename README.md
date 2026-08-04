# Borac Sport — E-commerce

E-commerce de Borac Sport (Uruguay). Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Base UI + Supabase.

Proyecto Supabase canónico: **`epjmfepsryjzfkbxwhuy`**. Toda la documentación, migraciones y tipos generados se aplican contra ese project ref. Si clonás esto, apuntá `NEXT_PUBLIC_SUPABASE_URL` a `https://epjmfepsryjzfkbxwhuy.supabase.co`.

El personalizador es un módulo **2D server-rendered** (`components/designer`) que compone zonas configurables sobre mockups. No existe un puente 3D con `postMessage` en este repositorio.

## Setup

```bash
npm install
cp .env.example .env.local
# Completá .env.local con tus keys reales de Supabase y Mercado Pago
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

> Sin keys reales de Supabase en `.env.local`, la app renderiza empty states (no crashea). Lo mismo aplica a Mercado Pago si falta el access token.

## Variables de entorno

Definidas en `.env.example`:

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (cliente + servidor). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (pública). |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-side, sólo Route Handlers y migraciones). |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token del integrador (server-side). |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Public key (cliente). |
| `NEXT_PUBLIC_APP_URL` o `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (retorno de MP). |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secreto HMAC del webhook de MP. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_ADMIN_EMAIL` | Envío de emails de confirmación al cliente y al admin. Se envían **en llamadas independientes** desde `lib/email/send.ts`: un fallo de un destinatario no impide el envío al otro. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp para CTA de cotización. |

## Estructura

- `app/` — Rutas App Router. Server Components por defecto.
  - `(auth)/login`, `(auth)/registro` — autenticación + intereses dinámicos desde DB.
  - `cuenta/` — perfil del usuario, intereses y diseños guardados.
  - `productos/` — catálogo público con filtro por categoría dinámica.
  - `disenos-base/` — galería pública de **diseños base** publicables (presets). Cada card abre `/personalizar?preset=<slug>` con el `DesignState` precargado.
  - `personalizar/` — wrapper que monta el personalizador 2D (`Viewer2D` + `TextureCompositor`). Acepta `?preset=<slug>`, `?d=<lz>`, `?design=<id>`.
  - `admin/` — panel restringido a `admin`/`superadmin`.
    - `admin/disenos-base` — CRUD de diseños base (presets) con variantes y stock por variante.
    - `admin/productos` — CRUD con drag-and-drop de imágenes.
    - `admin/templates` — CRUD de plantillas 3D (mockups + .glb/.gltf).
    - `admin/categorias` — CRUD + reordenamiento con flechas.
    - `admin/hero` — CRUD de slides del hero (imagen o video).
    - `admin/pedidos`, `admin/usuarios`, `admin/page.tsx` (métricas).
  - `api/checkout/mercadopago` — preferencia de pago.
  - `api/checkout/mercadopago/webhook` — notificación IPN con verificación HMAC.
  - `api/orders` — alta de pedidos server-side con repricing; delega a `boracsport.create_order_with_stock` (transacción atómica + dedupe + lock de stock).
  - `api/admin/upload` — subida autenticada a Storage (drag-and-drop). Sin límite de tamaño del lado de la app: se delega en los topes nativos de Supabase Storage y de la `signed upload URL` (la subida va directa del browser a Storage y no atraviesa el cap de Vercel).
  - `api/disenos`, `api/health` — APIs auxiliares.
- `components/` — UI (Base UI + componentes propios). Subcarpetas: `admin/`, `auth/`, `home/`, `layout/`, `product/`, `ui/`, `express/`.
  - `components/auth/google-auth-button.tsx` — botón Google OAuth; valida el destino con `safeAuthNextPath` antes de armar `redirectTo` hacia `/auth/callback`.
  - `components/admin/ball-size-variants-editor.tsx` — editor específico para categorías `kind='pelota'`: presets `1–5`, edición libre, agregar/eliminar tamaños, stock entero no negativo, sin duplicados case-insensitive. Emite los hidden inputs `variants[N][...]` que consume `app/admin/actions.ts`.
- `app/(auth)/registro/registration-wizard.tsx` — wizard cliente que mantiene nombre, email, teléfono y contraseña **en memoria no persistente** entre step1 y step2. No usa `sessionStorage` ni query params para PII.
- `lib/auth/safe-next-path.ts` — helper único que valida destinos de redirección post-auth. Sólo acepta paths internos que empiecen con `/`, rechaza `//`, barras invertidas y URLs absolutas; cae a `/cuenta` ante input inválido.
- `lib/email/send.ts` — wrapper sobre Resend con dos `postResend` aislados (cliente + admin); cada llamada se loggea y un fallo no bloquea al otro destinatario.
- `lib/supabase/` — Cliente (browser + server), tipos, queries (`products`, `auth`, `designs`, `analytics`, `categories`, `hero`).
  - `client.ts` y `server.ts` exponen stubs que devuelven error cuando Supabase no está configurado; no simulan éxito. Las operaciones Auth (`signUp`, `signInWithPassword`, `signInWithOAuth`, `resend`, `resetPasswordForEmail`, `exchangeCodeForSession`, `updateUser`) devuelven explícitamente `STUB_CONFIG_ERROR`.
- `lib/designer/` — estado y configuración del personalizador 2D (`default-design`, `zones`, `fonts`, `types`, `use-loaded-logos`).
- `lib/constants.ts`, `lib/config/`, `lib/format.ts` — constantes y helpers.
- `stores/` — Zustand (`cart-store`, `theme-store` con `persist` + `hasHydrated`).
- `public/disenador/` — copia verbatim de la librería 3D. NO se migra a React.
- `supabase/boracsport.sql` — esquema base (perfiles, productos, plantillas, diseños, pedidos, storage buckets, RLS).
- `supabase/migrations/` — migraciones incrementales idempotentes.

## Base de datos

El esquema vive en `boracsport` (schema dedicado dentro de Supabase). Toda query usa `db: { schema: "boracsport" }`.

### Migraciones (orden de aplicación)

1. `supabase/boracsport.sql` — esquema base. Crea tablas, enums, triggers, RLS, buckets `boracsport_templates`, `boracsport_products` y `boracsport_customizations`. **Si ya lo corriste, no hace falta volver a hacerlo.**
2. `supabase/migrations/20260716_admin_extensibility.sql` — agrega `categories`, `hero_slides`, bucket `boracsport_hero`, `products.category_id`, RLS y grants.
3. `supabase/migrations/20260722_products_onsale_and_categories_reorder.sql` — agrega `products.on_sale` + índice parcial.
4. `20260724_sprint1_variants_stock_orders_history.sql`, `20260724b_fix_products_rls_and_variants_hardening.sql`, `20260725_admin_actions_hardening.sql`, `20260725b_wipe_all_except_users.sql`, `20260725c_full_reset_and_rebuild.sql` — variantes, stock y reset completo (idempotente; los destructivos están marcados).
5. `20260726_categories_kind.sql` — agrega `categories.kind` (`ropa`/`pelota`/`otro`).
6. `20260727_hero_slides_rls_policies.sql` — policies de hero slides.
7. `20260728_security_hardening.sql` — sync stock, decrement atómico, validaciones.
8. `20260729_template_variant_assets.sql`, `20260730_drop_template_3d_models.sql`, `20260731_mockup_short_back_socks_back.sql`, `20260731_seed_default_categories.sql` — mockups y seed de categorías.
9. `20260801_sync_pelota_stock.sql` — sincroniza `products.stock` también para `kind='pelota'`.
10. `20260802_profiles_canonical_and_security_hardening.sql` — `profiles` canónicos (`full_name`, `phone`, `address`, `intereses`, `role`); `intereses_are_valid(jsonb)` con CHECK `profiles_intereses_valid` (array ≤ 10 strings, sin duplicados, sin vacíos); `handle_new_user()` reescrito para copiar `full_name`, `phone` e `intereses` desde `raw_user_meta_data` con `ON CONFLICT DO NOTHING`; `search_path` fijado en todas las funciones; policies de `profiles` usan `(select auth.uid())` y `(select boracsport.get_my_role())` para caching de initPlan.
11. `20260803_restrict_stock_trigger_execution.sql` — restringe `sync_product_stock_from_variants` al trigger interno.
12. `20260804_create_order_with_stock.sql` — RPC transaccional con dedupe por `cartHash` y lock determinista (`FOR UPDATE` ordenado por `jsonb_each`); descuenta stock e inserta la orden en una sola transacción.
13. `20260805_order_confirmation_tokens_and_rate_limits.sql` — tokens de confirmación, rate limit compartido (`rate_limit_buckets` + `consume_rate_limit`) y máquina de estados de pedidos (`transition_order_status` con `role_audit_log`).
14. `20260806_roles_and_account_lifecycle.sql` — `require_superadmin()`, `promote_user_role()` con guarda del último superadmin, `delete_user_account()` (borra Auth user, profile, designs en cascada, conserva orders con `user_id=NULL`, limpia Storage del bucket `boracsport_customizations/<uid>/`).
15. `20260807_cleanup_pending_orders.sql` + `pg_cron` — `cleanup_pending_orders()` borra diariamente pedidos `pendiente` > 7 días, devuelve stock a variants/products, audita.
16. `20260807b_grant_schema_usage_to_service_role.sql` — `GRANT USAGE ON SCHEMA boracsport TO service_role` (sin esto `/api/orders` tira `permission denied for schema boracsport`).
17. `20260807c_storage_orders_service_role.sql` — policies de Storage para que `service_role` suba/firme comprobantes en `boracsport_orders`.
18. `20260807d_orders_owner_select_includes_guest.sql` — `orders_owner_select` permite SELECT a `user_id IS NULL` (guest puede leer su propio pedido y subir comprobante).
19. `20260808_design_presets.sql` — tablas `design_presets` y `design_preset_variants` con RLS, índices y bucket Storage `boracsport_presets`.
20. `20260808b_extend_create_order_with_stock_for_presets.sql` — extiende `create_order_with_stock` con `kind='design_preset_variant'` y `kind='design_preset'` (descuento agregado sobre variantes activas del preset).

Todas son idempotentes. Tras aplicar cualquiera, refrescá tipos con `supabase gen types typescript` si los regenerás.

Todas son idempotentes (`create ... if not exists`, `drop policy if exists`, `on conflict do nothing`).

### Storage buckets

| Bucket | Lectura | Escritura |
| --- | --- | --- |
| `boracsport_products` | pública | admin / superadmin |
| `boracsport_templates` | pública | admin / superadmin |
| `boracsport_hero` | pública | admin / superadmin |
| `boracsport_customizations` | owner (carpeta = `auth.uid()`) o admin | owner o admin |
| `boracsport_presets` | pública | admin / superadmin |

### Roles

`user_role` enum: `user` | `admin` | `superadmin`. El primer usuario debe ser promovido manualmente a `superadmin` desde el SQL editor:

```sql
update boracsport.profiles set role = 'superadmin' where id = (select id from auth.users where email = 'tu@email.com');
```

## Panel admin

`app/admin/layout.tsx` es un Server Component que verifica rol server-side y redirige al login si no sos admin/superadmin. Desde la home aparece un link "Panel de administración" para usuarios con rol adecuado.

Funcionalidades implementadas:

- **Productos** (`/admin/productos`): listar con switch activo/destacado/en oferta, crear, editar con drag-and-drop de imágenes (Storage `boracsport_products/<id>/<uuid>.<ext>`), eliminar.
- **Plantillas 3D** (`/admin/templates`): mismas operaciones + subida de mockups (front/back) y modelos `.glb`/`.gltf`.
- **Categorías** (`/admin/categorias`): CRUD + reordenar con flechas ↑/↓. Son la misma fuente de verdad que los intereses del registro del usuario.
- **Hero carrusel** (`/admin/hero`): CRUD de slides con auto-rotación. Cada slide puede ser imagen o video, con poster opcional.
- **Pedidos** (`/admin/pedidos`): listado de los últimos 100 pedidos con cambio de estado vía `transition_order_status` (máquina de estados + audit log).
- **Usuarios** (`/admin/usuarios`): promoción de rol vía `promote_user_role` (superadmin).
- **Métricas** (`/admin`): ingresos válidos, ticket promedio, top productos / categorías / diseños / colores, promedio de logos por diseño. Período configurable (7 / 30 / 90 días / Todo).

## Probar el personalizador

1. Abrí [http://localhost:3000/personalizar](http://localhost:3000/personalizar).
2. Elegí una plantilla activa desde el panel admin.
3. Personalizá colores, logos y escudos en el modal `QuoteModal`.
4. Si guardás el diseño con sesión iniciada, el snapshot queda en `boracsport.designs` y se ve en `/cuenta/disenos`.
5. Para enviarlo a cotización por WhatsApp usá el botón "Cotizar".

## Checkout

- **Mercado Pago (UYU)** — Integración real. `app/api/checkout/mercadopago/route.ts` arma la preference server-side con repricing desde DB; el webhook en `/api/checkout/mercadopago/webhook` valida HMAC y actualiza `orders.status` / `orders.payment_status`.
- **Transferencia** — Datos bancarios en `lib/config/banking.ts`.
- **WhatsApp** — `wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>` con mensaje pre-formateado.

## Home pública

- Hero carrusel con slides dinámicos desde `boracsport.hero_slides` (fallback al gradiente si no hay slides).
- Sección "🔥 En oferta" con productos donde `on_sale = true`.
- Catálogo con filtro por categoría dinámica.
- "Recomendados para vos" según intereses del usuario.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19.2
- TypeScript strict
- Tailwind v4 (CSS variables)
- Base UI (`@base-ui/react`) — buttons, dialogs, inputs
- shadcn-style components sobre Base UI (en `components/ui/`)
- Framer Motion
- next-themes
- Zustand (`persist` + `hasHydrated`)
- @supabase/ssr v2
- lucide-react
- Fabric.js (editor 2D express, opcional)
- three.js + @react-three/fiber + @react-three/drei (3D viewer en preview)

## Reglas para agentes

- Next.js 16 trae breaking changes. Leé `node_modules/next/dist/docs/` antes de tocar APIs del framework.
- El esquema vive en `boracsport`. Toda query debe usar `db: { schema: "boracsport" }`.
- Las acciones admin validan rol server-side (`requireAdmin()` en `app/admin/actions.ts`) y UUIDs (`isUuid()`). No confíes en el cliente.
- Las migraciones nuevas viven en `supabase/migrations/` y deben ser idempotentes.

## Seguridad

- **Headers** definidos globalmente en `next.config.ts` (todas las respuestas):
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (sólo producción)
  - `poweredByHeader: false` y `compress: true`.
- **Auth/redirects**: `safeAuthNextPath` valida `next` en `app/(auth)/login/page.tsx` y en `components/auth/google-auth-button.tsx`. Los paths inválidos caen en `/cuenta`.
- **Stubs Supabase**: si faltan env vars, `lib/supabase/{client,server}.ts` no simulan éxito: las operaciones Auth devuelven `STUB_CONFIG_ERROR`.
- **Upload admin**: `app/api/admin/upload` no impone límite de tamaño; los topes los aplica Supabase Storage en la `signed upload URL`. La subida va directa del browser a Storage.