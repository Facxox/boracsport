# Borac Sport — mapa integral de conexiones Frontend ↔ Backend

> Documento generado a partir de la estructura y el código actual del repositorio. Describe qué usa cada tipo de visitante, qué datos atraviesan cada capa, qué tablas/storage intervienen, y qué acciones tiene el administrador.

## 1. Resumen ejecutivo

Borac Sport es un e-commerce construido como una aplicación Next.js 16 con App Router, React 19, TypeScript, Tailwind, Zustand y Supabase. No existe un backend separado: el backend está compuesto por:

- Server Components y Server Actions de Next.js.
- Route Handlers bajo `app/api`.
- Clientes Supabase para browser, servidor y service role.
- Supabase Auth, Postgres/RLS y Storage.
- Mercado Pago como pasarela externa.
- WhatsApp como canal externo de coordinación.
- Un diseñador 3D aislado que se comunica mediante `postMessage`.

El frontend utiliza dos tipos principales de conexión:

1. **Lecturas server-side directas a Supabase** desde Server Components y queries en `lib/supabase/queries`.
2. **Mutaciones** mediante Supabase Auth desde el navegador, Server Actions, Route Handlers internos y Storage.

La autoridad real está en el servidor y en RLS: los precios y stock se vuelven a leer en backend al crear un pedido, y las operaciones administrativas vuelven a validar el rol aunque el frontend oculte los controles.

---

## 2. Arquitectura de capas

```text
Navegador
  ├─ React Server Components / páginas Next.js
  ├─ Client Components
  ├─ Zustand + localStorage/sessionStorage
  ├─ Supabase browser client (Auth/Storage/lecturas puntuales)
  ├─ fetch('/api/...')
  └─ iframe/diseñador 3D + postMessage
          │
          ▼
Next.js server
  ├─ Server Components
  ├─ Server Actions (`app/admin/actions.ts`, `app/cuenta/actions.ts`)
  ├─ Route Handlers (`app/api`, `app/auth/callback`)
  ├─ Supabase server client con cookies de sesión
  ├─ Supabase service client para operaciones controladas
  └─ email / Mercado Pago / WhatsApp URL
          │
          ▼
Supabase
  ├─ Auth
  ├─ schema `boracsport` en PostgreSQL
  ├─ RLS y función `get_my_role()`
  └─ Storage buckets
```

### Clientes Supabase

| Cliente | Archivo | Uso | Sesión/RLS |
|---|---|---|---|
| Browser | `lib/supabase/client.ts` | Login, registro, recuperación, cambio de contraseña, subida directa de logos | Cookies/sesión del navegador; anon key; RLS |
| Server | `lib/supabase/server.ts` | Server Components, Route Handlers y Server Actions | Lee/escribe cookies; anon key; RLS |
| Service role | `lib/supabase/service.ts` | Stock concurrente, comprobantes y operaciones de Storage que requieren bypass | Solo servidor; bypass de RLS; debe usarse tras validar ownership/rol |

Si faltan las variables públicas de Supabase, ambos clientes normales usan un stub que devuelve estados vacíos para que la aplicación pueda renderizar empty states. El service client devuelve `null` si falta `SUPABASE_SERVICE_ROLE_KEY`.

---

## 3. Modelo de datos y conexiones

### `boracsport.profiles`

- Se crea/sincroniza mediante el trigger `handle_new_user()` después de crear un usuario en Supabase Auth.
- Guarda nombre, teléfono, dirección, rol, intereses y preferencia de tema.
- El frontend consulta `role` para mostrar el enlace de administración.
- El servidor consulta `role` para proteger `/admin`, Server Actions y uploads.
- RLS permite al usuario leer/actualizar su perfil y a admin/superadmin operar perfiles.

### `boracsport.categories`

- Taxonomía administrable.
- Es la fuente de verdad para:
  - categorías de productos;
  - intereses del registro;
  - filtro del catálogo;
  - recomendaciones;
  - navegación y contenido público.
- Lectura pública: solo categorías activas.
- Escritura: admin/superadmin.

### `boracsport.products`

- Catálogo público y entidad administrativa principal.
- Campos usados por frontend: `id`, `slug`, `name`, `description`, `price`, `images`, `tags`, `category`, `category_id`, `stock`, `active`, `featured`, `on_sale`.
- Público: solo productos activos.
- Admin/superadmin: lectura completa y CRUD.
- El checkout no confía en el precio del carrito: vuelve a cargar precio, activo y stock desde esta tabla.

### `boracsport.product_variants`

- Talles, colores, SKU, stock, precio alternativo y estado.
- Admin crea/reemplaza la matriz de variantes.
- El catálogo filtra variantes activas.
- Checkout verifica que la variante pertenezca al producto, esté activa y tenga stock.
- El stock total de `products.stock` se sincroniza con variantes activas.

### `boracsport.templates`

- Configuración de plantillas/siluetas del personalizador 3D.
- El personalizador público consume solo plantillas activas con modelo disponible.
- Admin gestiona mockups, modelo GLB/GLTF, zonas editables, configuración de escena, configuración por defecto, precio y versión.

### `boracsport.designs`

- Snapshot JSON de diseños terminados.
- Solo usuarios autenticados pueden persistir diseños.
- RLS limita lectura a su dueño o a admin/superadmin.
- El carrito siempre conserva el diseño localmente; la persistencia en servidor es adicional y no bloquea la UI.

### `boracsport.orders`

- Pedidos de usuarios registrados y visitantes invitados.
- Guarda items como snapshot JSON, subtotal, total, estados de pedido/pago, método, comprobante y datos de envío.
- Visitantes anónimos pueden insertar pedidos, pero solo como pendientes.
- Usuarios autenticados pueden insertar su propio pedido.
- Admin/superadmin puede consultar, actualizar y eliminar mediante RLS.
- El backend calcula el precio final y descuenta stock.

### `boracsport.hero_slides`

- Contenido dinámico del hero público.
- Admin controla imagen/video, poster, textos, CTA, orden y estado.
- Público recibe solamente slides activos.

### Storage

| Bucket | Visibilidad | Uso |
|---|---|---|
| `boracsport_products` | Público | Imágenes de productos |
| `boracsport_templates` | Público | Mockups y modelos 3D |
| `boracsport_hero` | Público | Imágenes/videos del hero |
| `boracsport_customizations` | Privado | Logos subidos por usuarios; carpeta inicial = `auth.uid()` |
| `boracsport_orders` | Privado | Comprobantes de transferencia; acceso mediante URLs firmadas |

---

## 4. Flujos por tipo de usuario

## 4.1 Visitante no autenticado

Puede:

- navegar la home;
- consultar hero, categorías, catálogo, productos, variantes activas y plantillas activas;
- usar el carrito local;
- usar el personalizador 3D;
- agregar productos y diseños al carrito;
- crear un pedido invitado por WhatsApp, transferencia o Mercado Pago;
- subir comprobante de transferencia demostrando ownership con nombre, email y teléfono;
- volver desde Mercado Pago y consultar una vista pública limitada del pedido.

No puede:

- acceder a `/cuenta`;
- guardar diseños en `boracsport.designs`;
- acceder al panel admin;
- consultar el historial de pedidos de una cuenta;
- subir logos al bucket privado de personalizaciones, porque el upload directo exige sesión.

### Flujo visitante → catálogo

```text
Página pública
  → Server Component
  → query en lib/supabase/queries/products.ts
  → Supabase products/product_variants con RLS pública
  → ProductGrid/ProductCard
```

Operaciones:

- `/productos`: `getProducts()` con `active = true`, filtro por categoría, búsqueda y paginación.
- `/productos/[slug]`: `getProductBySlug()` y segunda consulta de variantes.
- Productos relacionados: `getRelatedProducts()`.
- Ofertas: `getOnSaleProducts()` con `active = true` y `on_sale = true`.
- Recomendaciones: se basan en intereses cuando existe un usuario autenticado.

### Flujo visitante → carrito

```text
ProductCard / PDP
  → useCartStore.addProduct()
  → Zustand persist
  → localStorage: borac-cart-v1
  → CartDrawer / /carrito / /checkout
```

El carrito es local. Contiene líneas de producto y líneas de diseño. El precio visible se usa para mostrar el resumen, pero el servidor lo reemplaza por el precio vigente al crear el pedido.

### Flujo visitante → personalizador 3D

Hay dos mecanismos de diseño en el repositorio:

#### A. Diseñador 3D React/Three

```text
/personalizar
  → carga template activo desde `templates`
  → ThreeDDesignerClient
  → ThreeDDesigner / ThreeDViewport
  → payload de diseño
  → addDesignSnapshot()
  → carrito local
```

Los logos en `CanvasEditor` requieren sesión y se suben directamente a:

```text
Supabase browser client
  → storage.from('boracsport_customizations').upload()
  → <userId>/<uuid>/<sanitized-name>
  → URL usada por Fabric.js y guardada en payload
```

#### B. Diseñador estático en `public/disenador`

```text
iframe
  → postMessage({ type: 'BORAC_DESIGN_COMPLETED', payload })
  → DesignerBridgeMount
  → setupDesignerBridge()
  → valida origin, shape y tamaño
  → genera designId
  → addDesignSnapshot()
  → POST /api/disenos si hay sesión
```

El bridge acepta el mensaje `BORAC_DESIGN_COMPLETED`, valida versión 2 y límites de tamaño. Luego guarda localmente y persiste opcionalmente en backend.

### Flujo visitante → pedido por WhatsApp

```text
Checkout
  → WhatsAppCTA
  → computeCartHash()
  → POST /api/orders
  → repricing + validación de stock + insert order
  → orderId
  → buildWhatsAppUrl()
  → window.open(wa.me/...)
```

El pedido se registra antes de abrir WhatsApp. El hash local y la lógica de deduplicación evitan dobles pedidos recientes con mismo carrito/cliente, salvo que `forceNew = true`.

### Flujo visitante → transferencia

```text
TransferOptions
  → POST /api/orders (paymentMethod = transfer)
  → orderId
  → transferencia BROU
  → POST /api/orders/[id]/receipt multipart
  → ownership: admin, dueño autenticado o invitado verificado
  → magic bytes + MIME + tamaño + rate limit
  → service role Storage boracsport_orders
  → update orders.payment_receipt_url
  → URL firmada temporal
  → WhatsApp para avisar
```

El comprobante no se guarda como URL pública; se guarda como path privado y el administrador obtiene una signed URL de una hora.

### Flujo visitante → Mercado Pago

```text
MercadoPagoModal
  → POST /api/checkout/mercadopago
  → POST interno /api/orders
  → repricing y creación de order pendiente
  → Preference de Mercado Pago
  → redirect a init_point
  → webhook firmado de Mercado Pago
  → update orders.payment_status/status
  → retorno /checkout/confirmacion
  → GET /api/orders/[id]/public
```

El backend pasa el order ID como `external_reference`. También envía email y teléfono en las URLs de retorno para que el visitante pueda consultar la confirmación.

La confirmación pública devuelve solo estado, método, importes y fecha. La autorización actual permite al dueño autenticado, coincidencia email+teléfono o una ventana reciente de 30 minutos.

---

## 4.2 Usuario autenticado con rol `user`

Además de todo lo público puede:

- registrarse/iniciar/cerrar sesión;
- recuperar y cambiar contraseña;
- acceder a `/cuenta`;
- ver intereses almacenados en metadata de Auth;
- ver pedidos propios;
- ver detalle de pedidos propios;
- guardar diseños en `boracsport.designs`;
- volver a editar diseños guardados;
- crear pedidos con `user_id` asociado;
- subir logos a su carpeta de personalizaciones;
- subir comprobantes de sus propios pedidos.

No puede:

- consultar datos de otros usuarios;
- modificar catálogo, categorías, hero, templates o pedidos ajenos;
- entrar al panel administrativo.

### Flujo de registro

```text
/registro
  → getCurrentUser() para impedir registrar una sesión existente
  → getActiveCategories()
  → paso 1: nombre/email/teléfono/password
  → sessionStorage temporal para password
  → paso 2: intereses desde categories
  → supabase.auth.signUp()
       metadata: full_name, phone, site, intereses
  → trigger handle_new_user()
  → profiles(id, full_name, intereses, role=user)
  → email de confirmación o /cuenta
```

Las categorías administradas son reutilizadas como intereses. Si admin desactiva una categoría, deja de aparecer en el registro y el catálogo público.

### Flujo de login

```text
LoginPage
  → Supabase browser client
  → auth.signInWithPassword()
  → sesión/cookies Supabase
  → /cuenta
```

### Recuperación de contraseña

```text
/recuperar-contrasena
  → auth.resetPasswordForEmail()
  → email de Supabase
  → /auth/callback?next=/reset-contrasena/nueva
  → exchangeCodeForSession()
  → updateUser({ password })
```

### Flujo usuario → diseños guardados

```text
Diseñador finaliza diseño
  → bridge obtiene user por auth.getUser()
  → POST /api/disenos
  → getCurrentUser()
  → saveDesignForUser()
  → INSERT designs(user_id, payload)
  → RLS owner insert
```

La cuenta y `/cuenta/disenos` consultan `listDesignsForUser(user.id)` y generan enlaces `/personalizar?design=<id>`.

### Flujo usuario → historial de pedidos

```text
/cuenta/pedidos
  → auth.getUser()
  → SELECT orders WHERE user_id = auth.uid()

/cuenta/pedidos/[id]
  → auth.getUser()
  → SELECT orders WHERE id = route param AND user_id = auth.uid()
```

La aplicación muestra estado del pedido, método de pago, estado del pago, items snapshot, importes y datos de envío.

---

## 4.3 Administrador (`admin` o `superadmin`)

El admin usa el mismo frontend público, pero además dispone del panel protegido. La diferencia entre `admin` y `superadmin` actualmente no se materializa en acciones distintas: ambos pasan los mismos checks. El texto del panel indica que la promoción de roles debería ser una acción server-side de superadmin, pero no hay una acción de promoción implementada.

### Protección del panel

```text
Request a /admin/*
  → app/admin/layout.tsx
  → server Supabase client
  → auth.getUser()
  → profiles.role
  → si no hay sesión: /login?next=/admin
  → si role no es admin/superadmin: /
  → render panel
```

La protección del layout no sustituye los checks de cada mutación. `requireAdmin()` se vuelve a ejecutar en `app/admin/actions.ts`.

### Dashboard administrativo

`/admin` conecta con:

- `getAnalytics(period)` en `lib/supabase/queries/analytics.ts`.
- conteos de `products`, `orders`, `templates`, `profiles`.
- ranking de productos, categorías, diseños y colores.
- estados de pedidos.

Las métricas se calculan server-side leyendo pedidos y productos. Considera válidos estados `confirmado`, `en_produccion`, `enviado` y `entregado`, excluyendo pagos rechazados/reembolsados.

### Productos

```text
/admin/productos
  → Server Component SELECT products
  → ProductRow client
  → Server Action importada desde app/admin/actions.ts
```

Operaciones:

- crear producto;
- editar producto;
- eliminar producto;
- activar/desactivar;
- marcar destacado;
- marcar en oferta;
- editar variantes, stock, precio, categoría, tags e imágenes.

Flujo de creación/edición:

```text
Formulario admin
  → FormData
  → requireAdmin()
  → parseProductFields()
  → validar categoría contra categories
  → parseVariants()
  → INSERT/UPDATE products
  → replaceVariants()
  → recalcular stock
  → revalidatePath()
```

Las imágenes se suben mediante:

```text
FileDropzone
  → POST /api/admin/upload multipart
  → assertAdmin()
  → whitelist bucket/MIME/tamaño/prefix
  → Supabase Storage
  → URLs públicas
  → formulario del producto
```

### Plantillas 3D

```text
/admin/templates
  → SELECT templates
  → formularios
  → create/update/delete/toggleTemplateActiveAction
  → revalidación /admin/templates y /personalizar
```

Los archivos de plantilla pasan por `/api/admin/upload` hacia `boracsport_templates`. Las operaciones controlan mockups frontal/trasero, modelo, formato, zonas, configuración de escena y configuración por defecto.

El efecto hacia el frontend público es directo: la plantilla activa más reciente con `model_url` se usa en `/personalizar`.

### Categorías

```text
/admin/categorias
  → SELECT categorías
  → Server Actions CRUD/reordenamiento
  → revalidación de /, /registro, /cuenta y /productos
```

Cada cambio puede modificar simultáneamente:

- filtros del catálogo;
- intereses del registro;
- recomendaciones;
- etiquetas mostradas en cuenta;
- clasificación de productos.

### Hero

```text
/admin/hero
  → SELECT hero_slides
  → CRUD/reordenamiento/toggle
  → /api/admin/upload para media
  → revalidatePath('/')
  → getActiveSlides() en home
```

El hero público muestra slides activos ordenados. Los videos pueden tener poster.

### Pedidos

```text
/admin/pedidos
  → SELECT últimos 100 orders
/admin/pedidos/[id]
  → SELECT order completo
  → signed URL del comprobante privado
  → datos del cliente + items + estado + pago
  → enlace de contacto por WhatsApp
```

El listado y detalle están protegidos indirectamente por `app/admin/layout.tsx` y por RLS. El repositorio actual muestra pedidos, pero no expone en el frontend una Server Action completa para modificar `status` o `payment_status` desde el detalle.

### Usuarios

```text
/admin/usuarios
  → SELECT últimos 100 profiles
  → muestra nombre, rol y fecha
```

No existe actualmente una acción de frontend para promover/degradar usuarios. La promoción inicial de superadmin se realiza manualmente en SQL Editor.

---

## 5. Inventario de Route Handlers/API

| Método | Ruta | Consumidor | Autenticación | Función |
|---|---|---|---|---|
| GET | `/api/health` | monitorización/infraestructura | ninguna | devuelve `{status: ok, service: boracsport}` |
| POST | `/api/disenos` | bridge del diseñador | opcional; anónimo devuelve `persisted:false` | persiste snapshot si existe usuario |
| POST | `/api/orders` | WhatsApp, transferencia, Mercado Pago | anónimo permitido | valida pedido, repricing, stock, dedupe, insert y email |
| GET | `/api/orders` | historial/API auxiliar | usuario autenticado | devuelve hasta 100 pedidos propios |
| GET | `/api/orders/[id]/public` | confirmación Mercado Pago | dueño, coincidencia invitado o pedido reciente | vista pública limitada del pedido |
| POST | `/api/orders/[id]/receipt` | transferencia | admin, dueño o invitado verificado | valida y guarda comprobante privado |
| POST | `/api/admin/upload` | formularios admin | admin/superadmin | sube imágenes/modelos/media a Storage |
| POST | `/api/checkout/mercadopago` | modal de Mercado Pago | anónimo permitido | crea orden y Preference |
| POST | `/api/checkout/mercadopago/webhook` | Mercado Pago | HMAC + token configurado | actualiza estados de pago/pedido |
| GET | `/api/checkout/mercadopago/webhook` | comprobación externa | ninguna | devuelve received |
| GET | `/auth/callback` | enlaces de Auth | code de Supabase | intercambia code por sesión y redirige |

---

## 6. Inventario de Server Actions

Todas están en `app/admin/actions.ts`, salvo cierre de sesión en `app/cuenta/actions.ts`.

### Productos

- `createProductAction`
- `updateProductAction`
- `deleteProductAction`
- `toggleProductActiveAction`
- `toggleProductFeaturedAction`
- `toggleProductOnSaleAction`

### Variantes

- `parseVariants`
- `replaceVariants`

No son acciones públicas separadas, pero forman parte del flujo de creación/edición de producto.

### Plantillas

- `createTemplateAction`
- `updateTemplateAction`
- `deleteTemplateAction`
- `toggleTemplateActiveAction`

### Categorías

- `createCategoryAction`
- `updateCategoryAction`
- `deleteCategoryAction`
- `toggleCategoryActiveAction`
- `reorderCategoriesAction`

### Hero

- `createSlideAction`
- `updateSlideAction`
- `deleteSlideAction`
- `toggleSlideActiveAction`
- `reorderSlidesAction`

### Cuenta

- `signOutAction`

Todas las acciones administrativas ejecutan `requireAdmin()`, validan UUIDs cuando reciben IDs, validan FormData y revalidan rutas públicas/admin afectadas.

---

## 7. Conexiones de autenticación y roles

```text
Supabase Auth
  ├─ auth.signUp()
  │    └─ trigger → profiles
  ├─ auth.signInWithPassword()
  ├─ auth.getUser()
  ├─ auth.signOut()
  ├─ auth.resetPasswordForEmail()
  ├─ auth.exchangeCodeForSession()
  └─ auth.updateUser()
```

### Fuente del rol

El rol se guarda en `boracsport.profiles.role`. La función SQL `get_my_role()` permite usarlo en RLS sin exponer la tabla completa.

Roles definidos:

- `user`: usuario normal.
- `admin`: administración operativa.
- `superadmin`: actualmente mismo acceso de aplicación que admin; reservado conceptualmente para gestión de roles.

### Puntos donde se valida

- `app/admin/layout.tsx`: acceso de navegación/ruta.
- `app/admin/actions.ts`: mutaciones.
- `app/api/admin/upload/route.ts`: subida administrativa.
- `app/api/orders/[id]/receipt/route.ts`: lectura de rol para autorizar comprobantes.
- `components/layout/admin-nav-link.tsx`: visibilidad del enlace, solo UX.
- RLS de Supabase: barrera definitiva de datos.

---

## 8. Flujos de precios, stock y pedidos

### Precio

1. El producto se carga con precio en catálogo.
2. El carrito guarda ese precio para UI.
3. `/api/orders` ignora el precio enviado por el cliente.
4. Consulta el producto y, si corresponde, la variante.
5. Usa `price_override` de la variante si existe.
6. Construye snapshot con precio vigente.
7. Calcula subtotal y envío.
8. Mercado Pago usa el total calculado por backend.

### Stock

1. El carrito limita cantidad de forma optimista usando `stockCap`.
2. `/api/orders` vuelve a comprobar stock.
3. Tras insertar la orden, usa service role.
4. Actualiza con condición `.gte('stock', qty)`.
5. Si otra petición ganó la carrera, elimina la orden y devuelve `409`.
6. En variantes, descuenta en `product_variants`; en productos legacy, en `products`.

### Envío

- `FLAT_SHIPPING_UYU` se usa en frontend para el resumen.
- `/api/orders` usa `shipping = 250` cuando hay producto físico.
- Diseños solos no agregan envío.
- El total del servidor es la autoridad final.

### Dedupe

- El cliente genera `cartHash`.
- El servidor busca una orden reciente con el mismo hash, email y teléfono.
- Si existe, borra la orden recién insertada y devuelve la previa.
- `forceNew` permite saltar el dedupe.

### Estados

Pedido:

- `pendiente`
- `confirmado`
- `en_produccion`
- `enviado`
- `entregado`
- `cancelado`

Pago:

- `pendiente`
- `aprobado`
- `rechazado`
- `reembolsado`

Mercado Pago traduce:

- approved → pago `aprobado`, pedido `confirmado`.
- rejected → pago `rechazado`, pedido `cancelado`.
- refunded → pago `reembolsado`, pedido queda pendiente según la lógica actual del webhook.
- otros → pago y pedido pendientes.

El webhook ordena estados por ranking para evitar que un evento viejo sobreescriba un estado más avanzado.

---

## 9. Conexión de contenido admin con pantallas públicas

| Cambio admin | Se refleja en |
|---|---|
| Crear/editar producto | `/productos`, PDP, relacionados, ofertas, carrito y checkout |
| Activar/desactivar producto | visibilidad del catálogo y disponibilidad de pedido |
| Destacado | rails/componentes que consulten `featured` |
| En oferta | home y consultas `getOnSaleProducts()` |
| Crear/editar variante | selector de talle/color, stock y repricing |
| Crear/editar categoría | registro, filtros, recomendaciones, productos y cuenta |
| Reordenar categoría | orden de navegación/listas/intereses |
| Activar/desactivar hero | carrusel de home |
| Cambiar CTA hero | navegación pública al destino definido |
| Crear/activar template | `/personalizar` |
| Cambiar mockup/modelo | viewport/editor 3D |
| Cambiar zonas/configuración | controles disponibles y payload de diseño |
| Ver comprobante | detalle admin del pedido mediante URL firmada |
| Actualizar pago vía webhook | confirmación, cuenta, métricas y detalle del pedido |

Cada Server Action llama a `revalidatePath()` para invalidar las rutas relacionadas.

---

## 10. Seguridad y controles observados

### Controles positivos

- Repricing server-side.
- Validación server-side de stock y variantes.
- RLS en tablas y Storage.
- Role check server-side para admin.
- UUID validation en rutas administrativas.
- Límite de tamaño y MIME en uploads.
- Verificación de magic bytes para comprobantes.
- Rate limit en subida de comprobantes.
- HMAC/timing-safe compare para webhook Mercado Pago.
- Idempotencia/frescura de estados de pago.
- No se expone service role al browser.
- Comprobantes privados con URLs firmadas.
- Snapshots acotados para evitar payloads gigantes.
- Validación de origin y shape en `postMessage`.

### Puntos que requieren atención funcional o de seguridad

1. **Autorización de pedido público reciente:** `/api/orders/[id]/public` permite consultar sin email/teléfono si el pedido tiene menos de 30 minutos. Esto está pensado para el retorno de Mercado Pago, pero un UUID de pedido reciente podría permitir ver estado/importes de un pedido ajeno.
2. **Bridge `postMessage`:** el diseñador estático usa `targetOrigin: '*'` y el bridge admite `origin === 'null'` por sandbox. Es funcional para el iframe actual, pero conviene endurecer origen y validar `event.source` contra el iframe esperado.
3. **Upload de modelos GLTF:** se exige MIME explícito, lo cual evita el bypass sencillo de binarios arbitrarios, pero el contenido del modelo no tiene validación profunda.
4. **Operación de pedidos:** el panel muestra estados, pero no aparece una acción completa de cambio de estado desde el frontend administrativo.
5. **Roles:** `admin` y `superadmin` atraviesan los mismos checks de aplicación; la diferenciación real de privilegios todavía no está implementada.
6. **Categoría dual:** `products.category` textual y `products.category_id` coexisten. Las mutaciones validan la categoría dinámica, pero conviene mantener ambas columnas sincronizadas de manera consistente.
7. **Stock y orden:** el insert y los descuentos no forman una transacción SQL única; existen rollbacks best-effort. En concurrencia compleja todavía puede ser preferible una función RPC transaccional.
8. **Rate limit:** el rate limit de comprobantes es in-memory y funciona por instancia; en despliegues multi-instancia debería migrarse a Redis/Upstash u otro almacenamiento compartido.
9. **Emails:** el email de confirmación se dispara fire-and-forget; un fallo de email no revierte el pedido.
10. **Texto de privacidad:** checkout indica que los datos no se almacenan en el sitio, pero los pedidos sí almacenan datos de cliente en `orders.shipping_details`. El texto debería describir que se guardan para gestionar el pedido.
11. **Carga de `select('*')`:** algunas pantallas admin, especialmente detalle de pedidos y personalizador, usan `select('*')`; conviene preferir columnas explícitas para reducir acoplamiento y exposición accidental.
12. **`next` en callback:** `/auth/callback` concatena el valor `next` a `origin`; conviene limitarlo a rutas internas permitidas para evitar redirecciones abiertas si el parámetro se manipula.
13. **Gestión de roles desde UI:** `/admin/usuarios` es lectura. La promoción manual por SQL es una dependencia operativa que debe documentarse o convertirse en una acción restringida a superadmin.

---

## 11. Matriz de permisos resumida

| Capacidad | Visitante | `user` | `admin` | `superadmin` |
|---|---:|---:|---:|---:|
| Ver catálogo activo | Sí | Sí | Sí | Sí |
| Ver hero/categorías/templates activos | Sí | Sí | Sí | Sí |
| Carrito local | Sí | Sí | Sí | Sí |
| Crear pedido invitado | Sí | Sí | Sí | Sí |
| Ver historial propio | No | Sí | Sí | Sí |
| Guardar diseño | No en DB; local sí | Sí | Sí | Sí |
| Subir logo privado | No | Sí | Sí | Sí |
| Subir comprobante propio | Con prueba de ownership | Sí | Sí | Sí |
| Acceder `/admin` | No | No | Sí | Sí |
| CRUD productos | No | No | Sí | Sí |
| CRUD variantes | No | No | Sí | Sí |
| CRUD templates | No | No | Sí | Sí |
| CRUD categorías | No | No | Sí | Sí |
| CRUD hero | No | No | Sí | Sí |
| Ver todos los pedidos | No | No | Sí | Sí |
| Ver todos los usuarios | No | No | Sí | Sí |
| Promover roles desde UI | No | No | No | No implementado |
| Actualizar estados de pedido desde UI | No | No | No visible | No visible |

---

## 12. Archivos principales por responsabilidad

### Frontend público

- `app/page.tsx`
- `app/productos/page.tsx`
- `app/productos/[slug]/page.tsx`
- `app/personalizar/page.tsx`
- `app/carrito/page.tsx`
- `app/checkout/page.tsx`
- `app/checkout/confirmacion/page.tsx`
- `components/product/*`
- `components/home/*`
- `components/checkout/*`

### Autenticación/cuenta

- `app/(auth)/login/page.tsx`
- `app/(auth)/registro/page.tsx`
- `app/(auth)/registro/registration-step1.tsx`
- `app/(auth)/registro/registration-step2.tsx`
- `app/(auth)/recuperar-contrasena/*`
- `app/reset-contrasena/nueva/*`
- `app/auth/callback/route.ts`
- `app/cuenta/page.tsx`
- `app/cuenta/pedidos/*`
- `app/cuenta/disenos/page.tsx`
- `lib/supabase/queries/auth.ts`
- `lib/supabase/queries/designs.ts`

### Backend/API

- `app/api/orders/route.ts`
- `app/api/orders/[id]/public/route.ts`
- `app/api/orders/[id]/receipt/route.ts`
- `app/api/disenos/route.ts`
- `app/api/checkout/mercadopago/route.ts`
- `app/api/checkout/mercadopago/webhook/route.ts`
- `app/api/admin/upload/route.ts`
- `app/api/health/route.ts`

### Admin

- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/actions.ts`
- `app/admin/productos/*`
- `app/admin/templates/*`
- `app/admin/categorias/*`
- `app/admin/hero/*`
- `app/admin/pedidos/*`
- `app/admin/usuarios/page.tsx`

### Integración Supabase

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/service.ts`
- `lib/supabase/types.ts`
- `lib/supabase/queries/products.ts`
- `lib/supabase/queries/categories.ts`
- `lib/supabase/queries/hero.ts`
- `lib/supabase/queries/analytics.ts`
- `supabase/boracsport.sql`
- `supabase/migrations/*`

### Estado local e integraciones especiales

- `stores/cart-store.ts`
- `stores/customer-store.ts`
- `lib/cart/hash.ts`
- `lib/cart/totals.ts`
- `lib/cart/whatsapp-message.ts`
- `lib/designer/bridge.ts`
- `components/layout/designer-bridge-mount.tsx`
- `components/express/ThreeDDesigner.tsx`
- `components/express/CanvasEditor.tsx`

---

## 13. Checklist de validación funcional

### Visitante

- [ ] Home carga hero desde DB y fallback si no hay slides.
- [ ] Catálogo solo muestra productos activos.
- [ ] Producto con variantes obliga a elegir variante.
- [ ] Carrito persiste tras recargar.
- [ ] Diseño 3D se agrega al carrito.
- [ ] Pedido WhatsApp genera orderId y abre chat.
- [ ] Transferencia registra pedido, permite subir comprobante y genera URL firmada.
- [ ] Mercado Pago crea preferencia con importe repriced.
- [ ] Webhook actualiza el estado.
- [ ] Confirmación no filtra datos sensibles.

### Usuario autenticado

- [ ] Registro crea Auth user y profile.
- [ ] Categorías activas aparecen como intereses.
- [ ] Cuenta muestra pedidos/diseños propios.
- [ ] Diseño se persiste en `designs`.
- [ ] No se pueden leer pedidos ajenos.
- [ ] Recuperación de contraseña completa callback y update.
- [ ] Logo se sube solo a la carpeta del usuario.

### Admin

- [ ] Usuario normal no entra a `/admin`.
- [ ] Admin puede CRUD de productos, variantes, templates, categorías y hero.
- [ ] Upload valida bucket, MIME, tamaño y prefix.
- [ ] Cambios revalidan páginas públicas relacionadas.
- [ ] Admin visualiza comprobantes mediante URL firmada.
- [ ] Métricas excluyen pagos rechazados/reembolsados.
- [ ] Usuarios listados no implican capacidad de cambiar roles.
- [ ] Estados de pedido tienen un flujo administrativo definido.

---

## 14. Conclusión

La conexión principal del sistema está bien concentrada: el frontend público consume consultas server-side de Supabase; las operaciones de compra pasan por `/api/orders`; la administración se concentra en Server Actions protegidas; y los archivos pasan por Storage con políticas RLS o service role controlado.

Los ejes críticos que conectan todo el sistema son:

1. `categories`: une administración, registro, catálogo e intereses.
2. `products` + `product_variants`: unen catálogo, carrito, checkout, stock y métricas.
3. `templates`: une administración con el personalizador 3D.
4. `designs`: une diseñador, carrito, cuenta y pedidos personalizados.
5. `orders`: une checkout, pagos, comprobantes, cuenta, admin, emails y métricas.
6. `profiles.role`: une Auth con autorización de interfaz, servidor y RLS.
7. Storage: une uploads administrativos, logos privados y comprobantes privados.

El sistema ya tiene una separación clara entre visitante, usuario y administrador. Los mayores huecos para completar la operación son la gestión de estados de pedidos, la gestión real de roles de superadmin, el endurecimiento del acceso público a confirmaciones y la transaccionalidad del descuento de stock.
