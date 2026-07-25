# Documentación del diseñador 3D (queries a Supabase)

> Estado: el módulo `/personalizar` y todo lo asociado (ThreeDDesigner, ThreeDViewport, normalize-config, /api/disenos, /admin/templates) están siendo removidos. Este archivo es **referencia** para reconstruirlo desde cero sin perder de vista cómo hablaba con la base.

## Tablas involucradas

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

## Archivos del módulo (a remover)

- `app/personalizar/page.tsx` — server component que carga la plantilla.
- `app/personalizar/_topbar.tsx` — nav superior de la página.
- `app/api/disenos/route.ts` — POST snapshot → `designs`.
- `app/admin/templates/page.tsx` — listado admin.
- `app/admin/templates/[id]/page.tsx` — edición admin.
- `app/admin/templates/template-form.tsx` — form con tres dropzones de modelo.
- `app/admin/templates/template-row.tsx` — fila del listado.
- `app/admin/templates/nuevo/page.tsx` — alta de plantilla (si existe).
- `components/express/ThreeDDesigner.tsx`
- `components/express/ThreeDDesignerClient.tsx`
- `components/express/ThreeDViewport.tsx`
- `components/express/CanvasEditor.tsx` (editor 2D legacy compartido)
- `components/designer/designer-iframe.tsx` (iframe a `/disenador/index.html`)
- `lib/designer/normalize-config.ts`
- `lib/designer/design-types.ts`
- `lib/designer/bridge.ts`
- `lib/supabase/queries/designs.ts` (solo si no se reusa para otra cosa)
- `public/disenador/**` (assets del iframe legacy)
- Entradas en `app/admin/actions.ts` (`parseTemplate`, `createTemplateAction`, `updateTemplateAction`, `deleteTemplateAction`, `toggleTemplateActiveAction`, `sanitizeDefaultConfig`, `sanitizeModelsShape`, `sanitizeGarmentConfig`, `isFiniteTuple3`).
- Líneas en `app/admin/page.tsx` y `stores/cart-store.ts` que referencian plantillas.
- `lib/constants.ts`: `DESIGN_AUTOSAVE_VERSION`, `MAX_DESIGN_BYTES` (verificar uso antes de borrar).
- `supabase/boracsport.sql` y `supabase/migrations/*.sql`: las tablas `templates` y `designs` y los buckets `boracsport_templates`, `boracsport_customizations` (el primero se usa, dejar; el segundo solo lo usaba `CanvasEditor`).

## Próximo paso (reconstrucción)

Para volver a levantar el módulo:

1. Definir el shape nuevo de `payload` (versión + zonas + autosave).
2. Centralizar las queries en `lib/supabase/queries/templates.ts` y `lib/supabase/queries/designs.ts`.
3. Reutilizar `boracsport_templates` (público) para subir el modelo 3D y los mockups.
4. Validar versión de payload en server (`DESIGN_AUTOSAVE_VERSION`) y en cliente (bridge).
5. Decidir si el diseño sigue siendo (a) 2D Fabric.js, (b) 3D Three.js, (c) iframe `/disenador` legacy, o un reemplazo fresh — el shape `payload` debería ser agnóstico para no atarse a la UI.
