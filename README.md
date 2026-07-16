# Borac Sport — E-commerce

E-commerce de Borac Sport (Uruguay). Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Base UI + Supabase.

El motor 3D de personalización vive **aislado** en `public/disenador/` como sitio estático (vanilla JS). El e-commerce se comunica con él por `postMessage` cuando el usuario finaliza un diseño en el iframe.

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
| `MERCADOPAGO_ACCESS_TOKEN` | Access token del integrador (server-side). |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Public key (cliente). |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (allowlist del bridge, retorno de MP). |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secreto HMAC del webhook de MP (opcional pero recomendado). |
| `ORDER_RATE_LIMIT_PER_MINUTE` | Rate limit opcional para pedidos invitados. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp para CTA de cotización. |

## Estructura

- `app/` — Rutas App Router. Server Components por defecto.
  - `(auth)/login`, `(auth)/registro` — autenticación + intereses dinámicos desde DB.
  - `cuenta/` — perfil del usuario, intereses y diseños guardados.
  - `productos/` — catálogo público con filtro por categoría dinámica.
  - `personalizar/` — wrapper que monta el iframe 3D y escucha el bridge.
  - `admin/` — panel restringido a `admin`/`superadmin`.
    - `admin/productos` — CRUD con drag-and-drop de imágenes.
    - `admin/templates` — CRUD de plantillas 3D (mockups + .glb/.gltf).
    - `admin/categorias` — CRUD + reordenamiento con flechas.
    - `admin/hero` — CRUD de slides del hero (imagen o video).
    - `admin/pedidos`, `admin/usuarios`, `admin/page.tsx` (métricas).
  - `api/checkout/mercadopago` — preferencia de pago.
  - `api/checkout/mercadopago/webhook` — notificación IPN con verificación HMAC.
  - `api/orders` — alta de pedidos server-side con repricing.
  - `api/admin/upload` — subida autenticada a Storage (drag-and-drop).
  - `api/disenos`, `api/health` — APIs auxiliares.
- `components/` — UI (Base UI + componentes propios). Subcarpetas: `admin/`, `home/`, `layout/`, `product/`, `ui/`, `express/`.
- `lib/supabase/` — Cliente (browser + server), tipos, queries (`products`, `auth`, `designs`, `analytics`, `categories`, `hero`).
- `lib/designer/bridge.ts` — listener `postMessage` que recibe los diseños del iframe.
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

Todas son idempotentes (`create ... if not exists`, `drop policy if exists`, `on conflict do nothing`).

### Storage buckets

| Bucket | Lectura | Escritura |
| --- | --- | --- |
| `boracsport_products` | pública | admin / superadmin |
| `boracsport_templates` | pública | admin / superadmin |
| `boracsport_hero` | pública | admin / superadmin |
| `boracsport_customizations` | owner (carpeta = `auth.uid()`) o admin | owner o admin |

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
- **Pedidos** (`/admin/pedidos`): listado de los últimos 100 pedidos.
- **Usuarios** (`/admin/usuarios`).
- **Métricas** (`/admin`): ingresos válidos, ticket promedio, top productos / categorías / diseños / colores, promedio de logos por diseño. Período configurable (7 / 30 / 90 días / Todo).

## Probar el puente postMessage

1. Abrí [http://localhost:3000/personalizar](http://localhost:3000/personalizar).
2. Personalizá una camiseta (colores, escudo, dorsal).
3. Click en "Solicitar Cotización" dentro del iframe.
4. DevTools console: deberías ver el `MessageEvent` capturado.
5. El cart drawer se abre con "Diseño 3D #<uuid>".
6. Toast "Diseño agregado al carrito".
7. Si estás logueado, el snapshot se persiste en `boracsport.designs`.

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