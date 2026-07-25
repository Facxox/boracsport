# Documentación del diseñador 3D (queries a Supabase)

> Estado (2026-07-25): **módulo retirado**. El personalizador 3D no funcional fue eliminado del frontend y del admin. Se conservaron las tablas `boracsport.templates` y `boracsport.designs` y los buckets de Storage para permitir una reconstrucción futura sin pérdida de datos. `/personalizar` ahora es una página placeholder "Próximamente".

## Por qué se eliminó

El motor 3D tenía problemas que no justificaban reparación incremental:

- La UI dependía por completo de `editable_zones` y `default_config` de la plantilla; si faltaban zonas, los controles (escudo, sponsors, dorsal) no aparecían.
- Los patrones se aplicaban a **todos** los materiales del modelo, no solo a los configurados, pisando el color base.
- Las zonas `color` se ignoraban: el viewport solo respondía al `baseColor` global.
- El selector de kit (camiseta / camiseta+short / kit completo) cambiaba estado pero no cargaba shorts ni medias.
- No había materiales para short ni medias en ninguna plantilla.
- Las plantillas legacy solo tenían la zona dorsal por defecto, así que las otras zonas quedaban inertes.

Esa capa de deuda + el hecho de que el módulo nunca llegó a producción útil hicieron que la opción más limpia fuera retirarlo entero y rehacerlo desde cero con más criterio, en lugar de remendarlo.

## Qué se removió

Componentes frontend:
- `components/express/ThreeDDesigner.tsx`
- `components/express/ThreeDDesignerClient.tsx`
- `components/express/ThreeDViewport.tsx`
- `components/express/CanvasEditor.tsx` (editor 2D legacy, solo lo usaba el configurador)
- `components/designer/designer-iframe.tsx`
- `components/layout/designer-bridge-mount.tsx`
- `components/ui/design-badge.tsx`

Librerías:
- `lib/designer/bridge.ts`
- `lib/designer/design-types.ts`
- `lib/designer/normalize-config.ts`
- `lib/supabase/queries/designs.ts` (`saveDesignForUser`, `listDesignsForUser`)

Rutas:
- `app/api/disenos/route.ts` (POST de snapshots)
- `app/admin/templates/page.tsx` (listado)
- `app/admin/templates/[id]/page.tsx` (edición)
- `app/admin/templates/nuevo/page.tsx` (alta)
- `app/admin/templates/template-form.tsx`
- `app/admin/templates/template-row.tsx`
- `app/cuenta/disenos/page.tsx` (snapshots guardados del usuario)

Server actions removidas de `app/admin/actions.ts`:
- `parseTemplate`, `sanitizeDefaultConfig`, `sanitizeModelsShape`, `sanitizeGarmentConfig`, `isFiniteTuple3`
- `createTemplateAction`, `updateTemplateAction`, `deleteTemplateAction`, `toggleTemplateActiveAction`

Tipos y store:
- `DesignLine`, `ExpressDesignPayload`, `addDesignSnapshot` removidos de `types/cart.ts` y `stores/cart-store.ts`
- `CartItem = ProductLine` (sin el union con `design`)
- `previewLabel`, `designId`, `hasDesign` ya no existen en el código

Constantes removidas de `lib/constants.ts`:
- `DESIGN_AUTOSAVE_VERSION`
- `MAX_DESIGN_BYTES`

Assets estáticos:
- `public/disenador/**` (CSS, fuentes, JS, imágenes, video del iframe legacy, assets de "starbade")

UI cleanup:
- Card "Siluetas" del `/admin`
- Sección "Diseños guardados" del `/cuenta`
- Link "Diseñá en 3D" en empty-state del carrito
- Link "Ir al personalizador 3D" en empty-state del filtro de productos
- Resumen del checkout ya no menciona "Diseños a coordinar"
- WhatsApp builder ya no incluye el link de diseño

## Qué se conservó (intencional)

Para no perder datos y poder reconstruir el módulo más adelante:

- `boracsport.templates` (tabla completa con todos sus JSONB)
- `boracsport.designs` (snapshots por usuario)
- Bucket `boracsport_templates` (público, tiene mockups y modelos existentes)
- Bucket `boracsport_customizations` (privado, sigue aunque ya no se usa)

## Estado actual de `/personalizar`

Placeholder minimal en `app/personalizar/page.tsx`:

- Title: "El configurador 3D está en reconstrucción"
- Descripción: explica que se está rehaciendo desde cero y ofrece enlaces al `/productos` y al home.
- Botón "Ver catálogo" → `/productos`
- Link "Volver al inicio" → `/`

No carga plantilla, no toca Supabase, no monta canvas. Renderiza como página estática (`○` en el build output).

## Verificación post-eliminación

- `npx tsc --noEmit` → 0 errores
- `npm run lint` → 0 errores
- `npm run build` → 26 rutas, sin errores
- Commit: `4b8403b chore: remove broken 3D designer (frontend + admin); keep DB schema`
- Push: `feat/configurador-3d-starbade` (no se tocó `main`)

---

## Conteúdo de referencia (legacy)

El resto del documento describe cómo hablaba el módulo viejo con la base. Se mantiene como referencia para una posible reconstrucción futura. Las queries siguientes ya no están en el código.

---



## Tablas involucradas

> Las queries de esta sección referencian tablas que **se conservan** intactas. Se documentan para entender qué estructura tiene la base si se reconstruye el módulo.

### `boracsport.templates` (esquema público actual)

```
id                uuid pk
name              text not null
mockup_url_front  text not null default ''
mockup_url_back   text not null default ''
model_url         text                       -- URL pública del GLB/GLTF en boracsport_templates
model_format      text check in ('glb','gltf') or null
scene_config      jsonb default '{}'         -- { cameraPosition, cameraTarget, cameraDistance, background }
editable_zones    jsonb default '[]'         -- zonas interactivas (number/text/logo/sponsor/color/pattern)
default_config    jsonb default '{}'         -- { patterns, fonts, kits, models, zones }
                   models: { shirt?, shirtShort?, full? } cada uno { url, format, position?, rotation?, scale? }
version           integer not null default 1
price             numeric(12,2) not null default 0
active            boolean not null default true
created_at / updated_at timestamptz
```

Fuente: `supabase/boracsport.sql` líneas 48-63 y `supabase/migrations/20260725c_full_reset_and_rebuild.sql` líneas 182-197.

RLS: la tabla no define policies explícitas en estos archivos; las queries existentes usan `createClient()` que respeta la sesión (lecturas públicas en server component, server actions con `requireAdmin()` que verifica `boracsport.get_my_role()`).

### `boracsport.designs` (snapshots por usuario)

```
id          uuid pk
user_id     uuid not null references auth.users(id) on delete cascade
payload     jsonb not null default '{}'
created_at  timestamptz
updated_at  timestamptz
```

Índice: `designs_user_created_idx (user_id, created_at desc)`.

`payload` es la versión serializada del estado del diseñador (`ThreeDDesignPayload`, `version: 1` según `DESIGN_AUTOSAVE_VERSION`). El carrito guarda una copia local en `localStorage` (clave `borac-cart-v1`) y solo se persiste en Supabase si el usuario está logueado.

### Storage: `boracsport_templates` (público)

Para mockups (`mockup_url_front`, `mockup_url_back`) y modelos 3D (`model_url` cuando está fuera del JSONB). Upload admin via `app/api/admin/upload` con `boracsport.get_my_role() in ('admin','superadmin')`.

### Storage: `boracsport_customizations` (privado, owner)

`CanvasEditor` (editor 2D legacy) sube logos a `<userId>/<uuid>/<file>` con policy `customization_owner_write`. El diseñador 3D **no** usa este bucket: los logos viven como `dataUrl` dentro de `payload.layers[].assetUrl` o `payload.logos[]`.

---

## Queries que hacía el módulo (referencia exacta)

### 1. Cargar la plantilla activa (`app/personalizar/page.tsx`)

```ts
const supabase = await createClient()
const { data, error } = await supabase
  .from("templates")
  .select("*")
  .eq("active", true)
  .not("model_url", "is", null)
  .not("model_format", "is", null)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle()
```

Origen: `app/personalizar/page.tsx:10-26`. El row se pasa a `normalizeTemplateConfig(template)` (en `lib/designer/normalize-config.ts`) que rellena zonas faltantes (dorsal/number, name/text, shield/logo, sponsorFront/sponsor, sponsorBack/sponsor, 3 color zones, pattern) y fallback de patterns/fonts/kits si la plantilla legacy no los trae.

### 2. Listar plantillas en admin (`app/admin/templates/page.tsx`)

```ts
const { data } = await supabase
  .from("templates")
  .select("id, name, active, price, model_format, editable_zones")
  .order("created_at", { ascending: false })
```

### 3. Editar plantilla (`app/admin/templates/[id]/page.tsx`)

```ts
const { data } = await supabase.from("templates").select("*").eq("id", id).maybeSingle()
```

El row se mapea a `TemplateForm` con campos `name`, `mockup_url_front`, `mockup_url_back`, `model_url`, `model_format`, `price`, `editable_zones` (JSON string), `scene_config` (JSON string), `default_config` (JSON string), `active`. El form expone tres dropzones (camiseta/short/medias) que se sincronizan con `default_config.models`.

### 4. Crear plantilla (`app/admin/actions.ts → createTemplateAction`)

```ts
const data = parseTemplate(formData)
const sanitizedDefault = sanitizeDefaultConfig(data.default_config)
const sanitizedModels = sanitizeModelsShape(sanitizedDefault.models)
const { data: row, error } = await supabase
  .from("templates")
  .insert([{ ...data, default_config: sanitizedDefault }])
  .select("id")
  .single()
revalidatePath("/admin/templates"); revalidatePath("/personalizar")
```

`parseTemplate` requiere `name`, `mockup_url_front`, `mockup_url_back`, `price`; `model_url` opcional pero debe tener `model_format` válido si está. `default_config` se sanitiza a un whitelist `{ patterns, fonts, kits, models, zones }` y `models` se valida aparte (cada pieza debe tener `url` http/https + `format` ∈ {glb, gltf} + tuplas finiitas `[number,number,number]` si trae position/rotation/scale).

### 5. Actualizar plantilla (`updateTemplateAction`)

Mismo flujo que create + bump de versión:

```ts
const { data: current } = await supabase
  .from("templates").select("version").eq("id", id).maybeSingle()
const nextVersion = Number(current?.version ?? 0) + 1
await supabase
  .from("templates")
  .update({ ...data, default_config: sanitizedDefault, version: nextVersion })
  .eq("id", id)
```

`revalidatePath("/admin/templates"), "/admin/templates/${id}", "/personalizar"`.

### 6. Toggle/borrar plantilla

```ts
toggleTemplateActiveAction(id, active)
  → update({ active }).eq("id", id)
deleteTemplateAction(id)
  → delete().eq("id", id)
```

### 7. Persistir snapshot del diseñador (`app/api/disenos/route.ts`)

```ts
POST /api/disenos
body: { designId: string, payload: { version: DESIGN_AUTOSAVE_VERSION, ... } }
```

Lado server:
```ts
const user = await getCurrentUser()
if (!user) return NextResponse.json({ ok: true, persisted: false })
const result = await saveDesignForUser(user.id, designId, payload)
```

`saveDesignForUser` (`lib/supabase/queries/designs.ts`):
```ts
await supabase.from("designs").insert({ id: designId, user_id: userId, payload })
```

`listDesignsForUser` (uso futuro en `/cuenta/disenos`):
```ts
supabase.from("designs").select("id, payload, created_at")
  .eq("user_id", userId).order("created_at", { ascending: false })
```

### 8. Carrito local (no Supabase)

`stores/cart-store.ts` persiste en `localStorage` clave `borac-cart-v1`. Items de tipo `design` guardan `{ designId, payload, editorUrl, previewLabel }`. El snapshot puede vivir solo en localStorage (usuario anónimo) y re-persistirse a Supabase después del login.

---

## Constantes y versiones

- `DESIGN_AUTOSAVE_VERSION = 1` en `lib/constants.ts`. El route `/api/disenos` rechaza payloads con `version !== 1`.
- `MAX_DESIGN_BYTES = 200_000` (200 KB) — cap del bridge antes de meter el payload en localStorage.
- `MAX_IMAGE_BYTES = 5 * 1024 * 1024` (5 MB) — cap de logos subidos por el cliente.
- `MAX_TEXT = 80` — cap de caracteres en inputs de texto/número.

> ⚠️ El bridge (`lib/designer/bridge.ts`) declara `version === 2` al validar el payload que llega del iframe. Esa es una inconsistencia: el server route usa `DESIGN_AUTOSAVE_VERSION = 1`. Si se reusa el flujo, hay que unificar.

---

## Forma del payload (`ThreeDDesignPayload`)

```ts
{
  version: 2,
  savedAt: number,                 // epoch ms
  templateId: string,
  templateVersion: number,
  templateName: string,
  baseColor: string,                // hex
  previewUrl: string,               // dataUrl PNG del snapshot
  layers: ThreeDLayerValue[],
  logos: LogoTransform[],
  quote?: { name, team, sizes: ("adulto"|"nino")[] },
  selectedPatternId?: string,
  selectedKit?: "shirt" | "shirtShort" | "full"
}
```

`ThreeDLayerValue` (lo que se renderiza encima de la malla):
```ts
{ zoneId, value, color?, assetUrl?, secondaryColor?, fontId?, enabled?, strokeColor?, strokeEnabled? }
```

`LogoTransform` (de `CanvasEditor` 2D):
```ts
{ id, assetUrl, left, top, scaleX, scaleY, angle, view: "front"|"back" }
```

`default_config.models` (lo que el admin sube para camiseta/short/medias):
```ts
{
  shirt:     { url, format, position?, rotation?, scale? },
  shirtShort:{ url, format, position?, rotation?, scale? },
  full:      { url, format, position?, rotation?, scale? }
}
```

---

## Archivos del módulo (referencia histórica)

Esta lista refleja los archivos que el módulolegacy usaba. Todos fueron removidos en el commit `4b8403b` y ya no existen en el repo. Se conservan aquí como mapa para entender qué territorio cubría el módulo.

- `app/personalizar/page.tsx` — server component que cargaba la plantilla. **Hoy**: placeholder estático "Próximamente".
- `app/personalizar/_topbar.tsx` — nav superior de la página. Removido.
- `app/api/disenos/route.ts` — POST snapshot → `designs`. Removido.
- `app/admin/templates/page.tsx` — listado admin. Removido.
- `app/admin/templates/[id]/page.tsx` — edición admin. Removido.
- `app/admin/templates/template-form.tsx` — form con tres dropzones de modelo. Removido.
- `app/admin/templates/template-row.tsx` — fila del listado. Removido.
- `app/admin/templates/nuevo/page.tsx` — alta de plantilla. Removido.
- `components/express/ThreeDDesigner.tsx` — Removido.
- `components/express/ThreeDDesignerClient.tsx` — Removido.
- `components/express/ThreeDViewport.tsx` — Removido.
- `components/express/CanvasEditor.tsx` (editor 2D legacy compartido) — Removido.
- `components/designer/designer-iframe.tsx` (iframe a `/disenador/index.html`) — Removido.
- `components/layout/designer-bridge-mount.tsx` — Removido.
- `components/ui/design-badge.tsx` — Removido.
- `lib/designer/normalize-config.ts` — Removido.
- `lib/designer/design-types.ts` — Removido.
- `lib/designer/bridge.ts` — Removido.
- `lib/supabase/queries/designs.ts` — Removido.
- `public/disenador/**` (assets del iframe legacy) — Removido.
- `app/admin/actions.ts`: `parseTemplate`, `createTemplateAction`, `updateTemplateAction`, `deleteTemplateAction`, `toggleTemplateActiveAction`, `sanitizeDefaultConfig`, `sanitizeModelsShape`, `sanitizeGarmentConfig`, `isFiniteTuple3` — Removidos.
- `lib/constants.ts`: `DESIGN_AUTOSAVE_VERSION`, `MAX_DESIGN_BYTES` — Removidos.
- `types/cart.ts`: `DesignLine`, `ExpressDesignPayload`, `previewLabel`, `designId` — Removidos.
- `stores/cart-store.ts`: `addDesignSnapshot`, discriminador `kind: "design"` — Removidos.
- `components/checkout/cart-sections.tsx`, `components/layout/cart-drawer.tsx`, `app/carrito/page.tsx`, `app/cuenta/page.tsx`, `app/admin/page.tsx`, `app/checkout/page.tsx`, `components/checkout/mercadopago-modal.tsx`, `lib/cart/hash.ts`, `lib/cart/whatsapp-message.ts` — referencias cruzadas limpiadas.
- `supabase/boracsport.sql` y `supabase/migrations/*.sql`: las tablas `templates` y `designs` y los buckets `boracsport_templates`, `boracsport_customizations` — **Conservados** (el primero se usa para futuras plantillas; el segundo queda por si se reusa).

## Si en el futuro se quiere reconstruir

1. Definir el shape nuevo de `payload` (versión + zonas + autosave), resolviendo la inconsistencia legacy (`DESIGN_AUTOSAVE_VERSION = 1` vs `version === 2` en el bridge).
2. Centralizar las queries en `lib/supabase/queries/templates.ts` y `lib/supabase/queries/designs.ts` (este último archivo ya no existe; rehacerlo desde cero).
3. Reutilizar `boracsport_templates` (público) para subir el modelo 3D y los mockups. `boracsport_customizations` está disponible para logos por usuario.
4. Validar versión de payload en server **y** en cliente, sin la divergencia que tenía el módulo viejo.
5. Decidir si el diseño sigue siendo (a) 2D Fabric.js, (b) 3D Three.js, (c) iframe `/disenador` legacy, o un reemplazo fresh — el shape `payload` debería ser agnóstico para no atarse a la UI.
6. Resolver los problemas de raíz que llevaron al retiro: zonas calibradas sobre el modelo, materiales clonados (no mutados del cache de `useGLTF`), patrones aplicados solo a superficies configuradas, kits (camiseta/short/medias) realmente separados, decals con `depthTest` + `polygonOffset` para evitar z-fighting.
