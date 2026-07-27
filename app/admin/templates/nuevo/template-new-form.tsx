"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FileDropzone, HiddenUrlField } from "@/components/admin/file-dropzone"
import { createTemplateAction } from "@/app/admin/actions"

const FIELD_CLASS =
  "h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#dc2626]"

const LABEL_CLASS = "mb-1 block text-xs uppercase tracking-wider text-white/55"

const DEFAULT_SCENE_CONFIG = JSON.stringify(
  { camera: { position: [0, 1.2, 4], target: [0, 1, 0] }, light: { ambient: 0.6, directional: 0.8 } },
  null,
  2,
)

const DEFAULT_EDITABLE_ZONES = JSON.stringify(
  {
    front: ["color", "text", "number", "logo", "sponsor", "pattern"],
    back: ["color", "text", "number", "logo", "sponsor", "pattern"],
    sleeve_l: ["color", "pattern"],
    sleeve_r: ["color", "pattern"],
    short: ["color", "pattern"],
    socks: ["color", "pattern"],
  },
  null,
  2,
)

const DEFAULT_CONFIG = JSON.stringify(
  {
    mold: "round_classic",
    kit: "shirt",
    pattern: { id: "solid", color1: "#0f172a", color2: "#dc2626", scale: 1 },
    zones: {
      front: { id: "front", type: "color", color: "#0f172a" },
      back: { id: "back", type: "color", color: "#0f172a" },
      neck: { id: "neck", type: "color", color: "#dc2626" },
      collar: { id: "collar", type: "color", color: "#dc2626" },
      sleeve_l: { id: "sleeve_l", type: "color", color: "#0f172a" },
      sleeve_r: { id: "sleeve_r", type: "color", color: "#0f172a" },
      cuff_l: { id: "cuff_l", type: "color", color: "#dc2626" },
      cuff_r: { id: "cuff_r", type: "color", color: "#dc2626" },
      short: { id: "short", type: "color", color: "#0f172a" },
      socks: { id: "socks", type: "color", color: "#0f172a" },
    },
  },
  null,
  2,
)

// Fix 3: descriptor de los 10 mockups (2 requeridos + 8 opcionales).
// El `name` se usa como clave del FormData.
const MOCKUP_FIELDS: Array<{ name: string; label: string; required: boolean }> = [
  { name: "mockup_url_front", label: "Mockup frente", required: true },
  { name: "mockup_url_back", label: "Mockup espalda", required: true },
  { name: "mockup_url_neck", label: "Mockup cuello (vista interior)", required: false },
  { name: "mockup_url_collar", label: "Mockup solapa / cuello exterior", required: false },
  { name: "mockup_url_sleeves", label: "Mockup mangas", required: false },
  { name: "mockup_url_cuffs", label: "Mockup puños", required: false },
  { name: "mockup_url_short", label: "Mockup short", required: false },
  { name: "mockup_url_short_back", label: "Mockup short (atrás)", required: false },
  { name: "mockup_url_socks", label: "Mockup medias", required: false },
  { name: "mockup_url_socks_back", label: "Mockup medias (atrás)", required: false },
]

export function TemplateNewForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mockups, setMockups] = useState<Record<string, string[]>>(() => {
    const out: Record<string, string[]> = {}
    for (const f of MOCKUP_FIELDS) out[f.name] = []
    return out
  })
  const [sceneConfig, setSceneConfig] = useState(DEFAULT_SCENE_CONFIG)
  const [editableZones, setEditableZones] = useState(DEFAULT_EDITABLE_ZONES)
  const [defaultConfig, setDefaultConfig] = useState(DEFAULT_CONFIG)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Requeridos: frente + espalda.
    if (mockups.mockup_url_front.length === 0) {
      toast.error("Subí el mockup frente")
      return
    }
    if (mockups.mockup_url_back.length === 0) {
      toast.error("Subí el mockup espalda")
      return
    }
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      try {
        const result = await createTemplateAction(formData)
        if (!result.ok) throw new Error(result.error)
        toast.success("Silueta creada")
        router.push(`/admin/templates/${result.id}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error")
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div>
        <label className={LABEL_CLASS} htmlFor="name">Nombre</label>
        <input id="name" name="name" required maxLength={120} className={FIELD_CLASS} placeholder="Ej. Clásico redondo manga corta" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="price">Precio (UYU)</label>
          <input id="price" name="price" type="number" min={0} step={1} required defaultValue={2500} className={FIELD_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="version">Versión inicial</label>
          <input id="version" name="version" type="number" min={1} step={1} required defaultValue={1} className={FIELD_CLASS} />
        </div>
      </div>

      <section className="grid gap-4 rounded-xl border border-white/10 bg-[#101012] p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-white/80">Mockups</h2>
          <span className="text-xs text-white/45">
            {Object.values(mockups).filter((arr) => arr.length > 0).length}/{MOCKUP_FIELDS.length} cargados
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {MOCKUP_FIELDS.map((f) => (
            <div key={f.name} className="grid gap-2">
              <p className={LABEL_CLASS}>
                {f.label}
                {f.required ? <span className="ml-1 text-[#dc2626]">*</span> : null}
              </p>
              <FileDropzone
                bucket="boracsport_templates"
                prefix={f.required ? "new/mockups" : `new/mockups/${f.name.replace("mockup_url_", "")}`}
                kind="image"
                value={mockups[f.name]}
                onChange={(urls) => setMockups((prev) => ({ ...prev, [f.name]: urls }))}
                maxFiles={1}
                label="Imagen JPG / PNG / WebP"
              />
              {mockups[f.name].map((url) => <HiddenUrlField key={url} name={f.name} value={url} />)}
            </div>
          ))}
        </div>
      </section>

      <details className="rounded-xl border border-white/10 bg-[#101012] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-white/80">JSONB (avanzado)</summary>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="scene_config">scene_config</label>
            <textarea
              id="scene_config"
              name="scene_config"
              rows={6}
              value={sceneConfig}
              onChange={(e) => setSceneConfig(e.target.value)}
              className={`${FIELD_CLASS} h-auto py-2 font-mono text-xs`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="editable_zones">editable_zones</label>
            <textarea
              id="editable_zones"
              name="editable_zones"
              rows={8}
              value={editableZones}
              onChange={(e) => setEditableZones(e.target.value)}
              className={`${FIELD_CLASS} h-auto py-2 font-mono text-xs`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="default_config">default_config</label>
            <textarea
              id="default_config"
              name="default_config"
              rows={12}
              value={defaultConfig}
              onChange={(e) => setDefaultConfig(e.target.value)}
              className={`${FIELD_CLASS} h-auto py-2 font-mono text-xs`}
            />
          </div>
          <p className="text-xs text-white/45">
            Estos campos quedan guardados pero el diseñador actual usa su propio set de zonas
            (no depende de <code>editable_zones</code> legacy). Se mantienen para futuras
            mejoras del editor 2D (mockup de fondo + overlays por zona).
          </p>
        </div>
      </details>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[#dc2626]" />
        Activar al guardar
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          Crear silueta
        </Button>
        <button
          type="button"
          onClick={() => router.push("/admin/templates")}
          className="text-sm text-white/55 hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
