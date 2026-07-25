"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { FileDropzone } from "@/components/admin/file-dropzone"
import {
  createTemplateAction,
  deleteTemplateAction,
  updateTemplateAction,
} from "@/app/admin/actions"

interface TemplateFormProps {
  id?: string
  initial?: {
    name: string
    mockup_url_front: string
    mockup_url_back: string
    model_url: string | null
    model_format: "glb" | "gltf" | null
    price: number
    editable_zones: string
    scene_config: string
    default_config: string
    active: boolean
  }
}

type SceneConfig = {
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
  cameraDistance?: number
  background?: string
}

type ModelFormat = "" | "glb" | "gltf"
type GarmentKey = "shirt" | "shirtShort" | "full"

type GarmentConfig = {
  url: string
  format: Exclude<ModelFormat, "">
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

const DEFAULT_GARMENT_TRANSFORM: Omit<GarmentConfig, "url" | "format"> = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
}

const DEFAULT_GARMENT_LABELS: Record<GarmentKey, string> = {
  shirt: "Camiseta",
  shirtShort: "Short",
  full: "Medias",
}

function parseSceneConfig(raw: string | undefined): SceneConfig {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as SceneConfig
    }
  } catch {
    // ignore
  }
  return {}
}

function sceneConfigToString(scene: SceneConfig): string {
  try {
    return JSON.stringify(scene, null, 2)
  } catch {
    return "{}"
  }
}

function safeJsonParse(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>
  } catch {
    // ignore
  }
  return {}
}

function tuple3FromUnknown(value: unknown, fallback: [number, number, number]): [number, number, number] {
  if (Array.isArray(value) && value.length === 3 && value.every((entry) => typeof entry === "number" && Number.isFinite(entry))) {
    return value as [number, number, number]
  }
  return fallback
}

function parseGarmentConfig(raw: unknown): GarmentConfig | null {
  if (!raw) return null
  const record = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null
  if (!record) return null
  const url = typeof record.url === "string" ? record.url.trim() : ""
  const format = record.format
  if (!url || (format !== "glb" && format !== "gltf")) return null
  return {
    url,
    format,
    position: tuple3FromUnknown(record.position, DEFAULT_GARMENT_TRANSFORM.position),
    rotation: tuple3FromUnknown(record.rotation, DEFAULT_GARMENT_TRANSFORM.rotation),
    scale: tuple3FromUnknown(record.scale, DEFAULT_GARMENT_TRANSFORM.scale),
  }
}

function parseGarmentMap(raw: string | undefined): Record<GarmentKey, GarmentConfig | null> {
  const base: Record<GarmentKey, GarmentConfig | null> = { shirt: null, shirtShort: null, full: null }
  const parsed = safeJsonParse(raw)
  const models = parsed.models && typeof parsed.models === "object" && !Array.isArray(parsed.models) ? (parsed.models as Record<string, unknown>) : null
  if (!models) return base
  for (const key of Object.keys(base) as GarmentKey[]) {
    base[key] = parseGarmentConfig(models[key])
  }
  return base
}

function serializeGarmentMap(map: Record<GarmentKey, GarmentConfig | null>): Record<string, GarmentConfig | null> {
  const out: Record<string, GarmentConfig | null> = {}
  for (const key of Object.keys(map) as GarmentKey[]) {
    const value = map[key]
    if (value && value.url && (value.format === "glb" || value.format === "gltf")) {
      out[key] = value
    } else {
      out[key] = null
    }
  }
  return out
}

const defaultInitial: NonNullable<TemplateFormProps["initial"]> = {
  name: "",
  mockup_url_front: "",
  mockup_url_back: "",
  model_url: null,
  model_format: null,
  price: 0,
  editable_zones: JSON.stringify(
    [
      {
        id: "numero",
        label: "Dorsal",
        kind: "number",
        view: "back",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        lockedPosition: true,
        lockedRotation: true,
        lockedScale: true,
        maxChars: 2,
      },
    ],
    null,
    2,
  ),
  scene_config: "{}",
  default_config: "{}",
  active: true,
}

export function TemplateForm({ id, initial = defaultInitial }: TemplateFormProps) {
  const [pending, startTransition] = useTransition()
  const isEdit = Boolean(id)
  const prefix = id ?? "draft"
  const [mockupFront, setMockupFront] = useState<string[]>(initial.mockup_url_front ? [initial.mockup_url_front] : [])
  const [mockupBack, setMockupBack] = useState<string[]>(initial.mockup_url_back ? [initial.mockup_url_back] : [])
  const [shirtModel, setShirtModel] = useState<string[]>(initial.model_url ? [initial.model_url] : [])
  const [garments, setGarments] = useState<Record<GarmentKey, GarmentConfig | null>>(() => parseGarmentMap(initial.default_config))

  const initialScene = useMemo(() => parseSceneConfig(initial.scene_config), [initial.scene_config])
  const [scene, setScene] = useState<SceneConfig>(initialScene)
  const sceneJson = useMemo(() => sceneConfigToString(scene), [scene])

  const initialDefaultsParsed = useMemo(() => safeJsonParse(initial.default_config), [initial.default_config])
  const initialModelsSerialized = useMemo(() => JSON.stringify({ models: serializeGarmentMap(garments) }, null, 2), [garments])
  const mergedDefaultConfig = useMemo(() => {
    const modelsSection = serializeGarmentMap(garments)
    const preserved: Record<string, unknown> = { ...initialDefaultsParsed }
    delete preserved.models
    const sanitized: Record<string, unknown> = {}
    const allowedKeys = new Set(["patterns", "fonts", "kits", "models", "zones"])
    for (const key of Object.keys(preserved)) {
      if (allowedKeys.has(key)) sanitized[key] = preserved[key]
    }
    sanitized.models = modelsSection
    return sanitized
  }, [garments, initialDefaultsParsed])
  const defaultConfigJson = useMemo(() => JSON.stringify(mergedDefaultConfig, null, 2), [mergedDefaultConfig])

  function setGarmentField<K extends keyof GarmentConfig>(key: GarmentKey, field: K, value: GarmentConfig[K]) {
    setGarments((current) => {
      const fallback: GarmentConfig = {
        url: "",
        format: "glb",
        position: DEFAULT_GARMENT_TRANSFORM.position,
        rotation: DEFAULT_GARMENT_TRANSFORM.rotation,
        scale: DEFAULT_GARMENT_TRANSFORM.scale,
      }
      const previous = current[key] ?? fallback
      const next: GarmentConfig = { ...previous, [field]: value }
      return { ...current, [key]: next.url ? next : null }
    })
  }

  function setGarmentUrl(key: GarmentKey, urls: string[]) {
    const url = urls[0] ?? ""
    setGarments((current) => {
      if (!url) return { ...current, [key]: null }
      const fallback: GarmentConfig = {
        url,
        format: "glb",
        position: DEFAULT_GARMENT_TRANSFORM.position,
        rotation: DEFAULT_GARMENT_TRANSFORM.rotation,
        scale: DEFAULT_GARMENT_TRANSFORM.scale,
      }
      const previous = current[key]
      return { ...current, [key]: previous ? { ...previous, url } : fallback }
    })
  }

  function handleSubmit(formData: FormData) {
    formData.set("mockup_url_front", mockupFront[0] ?? "")
    formData.set("mockup_url_back", mockupBack[0] ?? "")
    formData.set("model_url", shirtModel[0] ?? "")
    formData.set("scene_config", sceneJson)
    formData.set("default_config", defaultConfigJson)
    startTransition(async () => {
      try {
        if (isEdit && id) {
          await updateTemplateAction(id, formData)
          toast.success("Plantilla actualizada")
        } else {
          await createTemplateAction(formData)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar la plantilla")
      }
    })
  }

  function handleDelete() {
    if (!id) return
    if (!window.confirm(`¿Eliminar la plantilla "${initial.name}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      try {
        await deleteTemplateAction(id)
        toast.success("Plantilla eliminada")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-[#101012] p-6">
      <label className="grid gap-2 text-sm">
        Nombre
        <input
          name="name"
          required
          defaultValue={initial.name}
          className="h-10 rounded-xl border border-white/10 bg-black/20 px-3"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold">Mockup frente</p>
          <FileDropzone
            bucket="boracsport_templates"
            prefix={`${prefix}/front`}
            kind="image"
            value={mockupFront}
            onChange={setMockupFront}
            maxFiles={1}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Mockup espalda</p>
          <FileDropzone
            bucket="boracsport_templates"
            prefix={`${prefix}/back`}
            kind="image"
            value={mockupBack}
            onChange={setMockupBack}
            maxFiles={1}
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-semibold">Modelo 3D camiseta (.glb / .gltf)</p>
            <FileDropzone
              bucket="boracsport_templates"
              prefix={`${prefix}/model`}
              kind="model"
              value={shirtModel}
              onChange={setShirtModel}
              maxFiles={1}
              accept=".glb,.gltf"
            />
          </div>
          <label className="grid gap-2 text-sm">
            Formato camiseta
            <select
              name="model_format"
              defaultValue={initial.model_format ?? ""}
              className="h-10 rounded-xl border border-white/10 bg-black/20 px-3"
            >
              <option value="">Sin modelo 3D</option>
              <option value="glb">GLB</option>
              <option value="gltf">GLTF</option>
            </select>
          </label>
        </div>

        <details className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm" open>
          <summary className="cursor-pointer select-none text-white/70">
            Modelos 3D del kit (short y medias)
          </summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {(Object.keys(DEFAULT_GARMENT_LABELS) as GarmentKey[]).map((key) => (
              <GarmentEditor
                key={key}
                label={DEFAULT_GARMENT_LABELS[key]}
                prefix={`${prefix}/${key}`}
                value={garments[key]}
                onUrlChange={(urls) => setGarmentUrl(key, urls)}
                onFieldChange={(field, value) => setGarmentField(key, field, value)}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-white/45">
            Estos modelos se cargan en el selector de kit (&ldquo;Camiseta&rdquo;, &ldquo;Camiseta + Short&rdquo;, &ldquo;Kit completo&rdquo;). Si no subís un modelo, esa opción queda deshabilitada. La camiseta sigue siendo principal.
          </p>
        </details>
      </div>

      <label className="grid gap-2 text-sm">
        Precio base UYU
        <input
          name="price"
          type="number"
          min="0"
          required
          defaultValue={String(initial.price)}
          className="h-10 rounded-xl border border-white/10 bg-black/20 px-3"
        />
      </label>

      <label className="grid gap-2 text-sm">
        Zonas editables (JSON)
        <textarea
          name="editable_zones"
          required
          defaultValue={initial.editable_zones}
          className="min-h-48 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs"
        />
      </label>

      <details className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm" open>
        <summary className="cursor-pointer select-none text-white/70">
          Cámara de la escena 3D
        </summary>
        <CameraSceneEditor scene={scene} onChange={setScene} />
      </details>

      <details className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
        <summary className="cursor-pointer select-none text-white/70">
          Configuración avanzada (scene_config / default_config)
        </summary>
        <div className="mt-3 grid gap-3">
          <p className="text-[11px] text-white/45">
            El campo de cámara ya escribe scene_config. Este textarea refleja el default_config resultante (incluye modelos por prenda). Editá solo si necesitás agregar claves personalizadas.
          </p>
          <label className="grid gap-2 text-xs">
            scene_config (JSON resultante)
            <textarea
              readOnly
              value={sceneJson}
              className="min-h-24 rounded-lg border border-white/10 bg-black/30 p-2 font-mono text-white/70"
            />
          </label>
          <label className="grid gap-2 text-xs">
            default_config (JSON resultante)
            <textarea
              name="default_config"
              value={defaultConfigJson}
              onChange={(event) => {
                // Re-sync garments from manual edits si el admin tocó el JSON.
                const next = parseGarmentMap(event.target.value)
                setGarments(next)
              }}
              className="min-h-32 rounded-lg border border-white/10 bg-black/30 p-2 font-mono"
            />
            <input type="hidden" name="default_config_initial" value={initialModelsSerialized} />
          </label>
        </div>
      </details>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial.active}
          className="size-4 accent-[#dc2626]"
        />
        Publicar plantilla (visible en /personalizar)
      </label>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        {isEdit ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="h-10 rounded-xl border border-red-500/40 px-4 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            Eliminar plantilla
          </button>
        ) : (
          <span />
        )}
        <button
          disabled={pending}
          className="h-10 rounded-xl bg-[#dc2626] px-5 font-bold text-black disabled:opacity-50"
        >
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear plantilla"}
        </button>
      </div>
    </form>
  )
}

function GarmentEditor({
  label,
  prefix,
  value,
  onUrlChange,
  onFieldChange,
}: {
  label: string
  prefix: string
  value: GarmentConfig | null
  onUrlChange: (urls: string[]) => void
  onFieldChange: <K extends keyof GarmentConfig>(field: K, value: GarmentConfig[K]) => void
}) {
  const current = value ?? {
    url: "",
    format: "glb" as const,
    position: DEFAULT_GARMENT_TRANSFORM.position,
    rotation: DEFAULT_GARMENT_TRANSFORM.rotation,
    scale: DEFAULT_GARMENT_TRANSFORM.scale,
  }
  return (
    <div className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-white/70">{label}</p>
      <FileDropzone
        bucket="boracsport_templates"
        prefix={prefix}
        kind="model"
        value={value?.url ? [value.url] : []}
        onChange={onUrlChange}
        maxFiles={1}
        accept=".glb,.gltf"
      />
      <label className="grid gap-1 text-xs">
        Formato
        <select
          value={current.format}
          onChange={(event) => onFieldChange("format", (event.target.value === "gltf" ? "gltf" : "glb") as GarmentConfig["format"])}
          className="h-9 rounded-md border border-white/10 bg-black/40 px-2 text-xs"
        >
          <option value="glb">GLB</option>
          <option value="gltf">GLTF</option>
        </select>
      </label>
      <fieldset className="grid gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-white/50">Posición</legend>
        <div className="grid grid-cols-3 gap-1">
          {(["x", "y", "z"] as const).map((axis, idx) => (
            <label key={axis} className="grid gap-0.5 text-[10px] text-white/60">
              {axis.toUpperCase()}
              <input
                type="number"
                step="0.1"
                value={current.position[idx]}
                onChange={(event) => {
                  const next: [number, number, number] = [...current.position] as [number, number, number]
                  next[idx] = Number(event.target.value)
                  onFieldChange("position", next)
                }}
                className="h-8 rounded-md border border-white/10 bg-black/40 px-2 text-xs"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="grid gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-white/50">Rotación</legend>
        <div className="grid grid-cols-3 gap-1">
          {(["x", "y", "z"] as const).map((axis, idx) => (
            <label key={axis} className="grid gap-0.5 text-[10px] text-white/60">
              {axis.toUpperCase()}
              <input
                type="number"
                step="0.1"
                value={current.rotation[idx]}
                onChange={(event) => {
                  const next: [number, number, number] = [...current.rotation] as [number, number, number]
                  next[idx] = Number(event.target.value)
                  onFieldChange("rotation", next)
                }}
                className="h-8 rounded-md border border-white/10 bg-black/40 px-2 text-xs"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="grid gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-white/50">Escala</legend>
        <div className="grid grid-cols-3 gap-1">
          {(["x", "y", "z"] as const).map((axis, idx) => (
            <label key={axis} className="grid gap-0.5 text-[10px] text-white/60">
              {axis.toUpperCase()}
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={current.scale[idx]}
                onChange={(event) => {
                  const next: [number, number, number] = [...current.scale] as [number, number, number]
                  next[idx] = Number(event.target.value)
                  onFieldChange("scale", next)
                }}
                className="h-8 rounded-md border border-white/10 bg-black/40 px-2 text-xs"
              />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function CameraSceneEditor({ scene, onChange }: { scene: SceneConfig; onChange: (next: SceneConfig) => void }) {
  const target = scene.cameraTarget ?? [0, 0, 0]
  const position = scene.cameraPosition ?? [0, 0, 4.5]
  const distance = scene.cameraDistance ?? 4.5

  function setTarget(index: number, value: number) {
    const next: [number, number, number] = [target[0], target[1], target[2]]
    next[index as 0 | 1 | 2] = value
    onChange({ ...scene, cameraTarget: next })
  }

  function setPosition(index: number, value: number) {
    const next: [number, number, number] = [position[0], position[1], position[2]]
    next[index as 0 | 1 | 2] = value
    onChange({ ...scene, cameraPosition: next })
  }

  function setDistance(value: number) {
    onChange({ ...scene, cameraDistance: value })
  }

  function reset() {
    onChange({})
  }

  return (
    <div className="mt-3 grid gap-3">
      <p className="text-[11px] text-white/55">
        Ajustá dónde mira la cámara y a qué distancia. Si dejás los valores por defecto, el visor centra el modelo automáticamente.
      </p>
      <fieldset className="grid gap-2 rounded-lg border border-white/10 bg-black/30 p-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-white/50">Target (qué mira la cámara)</legend>
        <div className="grid grid-cols-3 gap-2">
          {(["x", "y", "z"] as const).map((axis, idx) => (
            <label key={axis} className="grid gap-1 text-[11px] text-white/70">
              {axis.toUpperCase()}
              <input
                type="number"
                step="0.1"
                value={target[idx]}
                onChange={(event) => setTarget(idx, Number(event.target.value))}
                className="h-9 rounded-md border border-white/10 bg-black/40 px-2 text-xs"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="grid gap-2 rounded-lg border border-white/10 bg-black/30 p-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-white/50">Posición de cámara (opcional, legacy)</legend>
        <div className="grid grid-cols-3 gap-2">
          {(["x", "y", "z"] as const).map((axis, idx) => (
            <label key={axis} className="grid gap-1 text-[11px] text-white/70">
              {axis.toUpperCase()}
              <input
                type="number"
                step="0.1"
                value={position[idx]}
                onChange={(event) => setPosition(idx, Number(event.target.value))}
                className="h-9 rounded-md border border-white/10 bg-black/40 px-2 text-xs"
              />
            </label>
          ))}
        </div>
        <p className="text-[10px] text-white/40">
          Si la completás, anula el target/distancia y se usa esta posición fija.
        </p>
      </fieldset>
      <label className="grid gap-1 text-xs text-white/70">
        Distancia
        <input
          type="number"
          step="0.1"
          min="0.5"
          value={distance}
          onChange={(event) => setDistance(Number(event.target.value))}
          className="h-9 rounded-md border border-white/10 bg-black/40 px-2 text-xs"
        />
      </label>
      <button
        type="button"
        onClick={reset}
        className="h-8 self-start rounded-md border border-white/15 px-3 text-[11px] text-white/70 hover:border-white/30"
      >
        Restablecer cámara
      </button>
    </div>
  )
}
