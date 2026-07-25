"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FileDropzone, HiddenUrlField } from "@/components/admin/file-dropzone"
import {
  deleteTemplateAction,
  toggleTemplateActiveAction,
  updateTemplateAction,
} from "@/app/admin/actions"
import type { TemplateRow } from "@/lib/supabase/types"

const FIELD_CLASS =
  "h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#dc2626]"

const LABEL_CLASS = "mb-1 block text-xs uppercase tracking-wider text-white/55"

function jsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return "{}"
  }
}

export function TemplateForm({ template }: { template: TemplateRow }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [front, setFront] = useState<string[]>(template.mockup_url_front ? [template.mockup_url_front] : [])
  const [back, setBack] = useState<string[]>(template.mockup_url_back ? [template.mockup_url_back] : [])
  const [model, setModel] = useState<string[]>(template.model_url ? [template.model_url] : [])
  const [sceneConfig, setSceneConfig] = useState(jsonStringify(template.scene_config))
  const [editableZones, setEditableZones] = useState(jsonStringify(template.editable_zones))
  const [defaultConfig, setDefaultConfig] = useState(jsonStringify(template.default_config))
  const [active, setActive] = useState(Boolean(template.active))

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      try {
        const result = await updateTemplateAction(template.id, formData)
        if (!result.ok) throw new Error(result.error)
        toast.success("Silueta actualizada")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error")
      }
    })
  }

  function onDelete() {
    if (typeof window !== "undefined" && !window.confirm(`Eliminar "${template.name}"?`)) return
    startTransition(async () => {
      try {
        const result = await deleteTemplateAction(template.id)
        if (!result.ok) throw new Error(result.error)
        toast.success("Silueta eliminada")
        router.push("/admin/templates")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error")
      }
    })
  }

  function onToggleActive() {
    const next = !active
    setActive(next)
    startTransition(async () => {
      try {
        await toggleTemplateActiveAction(template.id, next)
        toast.success(next ? "Silueta activada" : "Silueta desactivada")
      } catch (err) {
        setActive(!next)
        toast.error(err instanceof Error ? err.message : "Error")
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div>
        <label className={LABEL_CLASS} htmlFor="name">Nombre</label>
        <input id="name" name="name" required maxLength={120} defaultValue={template.name} className={FIELD_CLASS} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="price">Precio (UYU)</label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={template.price}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="version">Versión actual</label>
          <input
            id="version"
            name="version"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={template.version}
            className={FIELD_CLASS}
            readOnly
            aria-readonly
          />
          <p className="mt-1 text-xs text-white/45">Se incrementa automáticamente al guardar.</p>
        </div>
      </div>

      <section className="grid gap-2">
        <p className={LABEL_CLASS}>Mockup frente</p>
        <FileDropzone
          bucket="boracsport_templates"
          prefix="mockups"
          kind="image"
          value={front}
          onChange={setFront}
          maxFiles={1}
          label="Imagen del frente"
        />
        {front.map((url) => <HiddenUrlField key={url} name="mockup_url_front" value={url} />)}
      </section>

      <section className="grid gap-2">
        <p className={LABEL_CLASS}>Mockup espalda</p>
        <FileDropzone
          bucket="boracsport_templates"
          prefix="mockups"
          kind="image"
          value={back}
          onChange={setBack}
          maxFiles={1}
          label="Imagen de la espalda"
        />
        {back.map((url) => <HiddenUrlField key={url} name="mockup_url_back" value={url} />)}
      </section>

      <section className="grid gap-2">
        <p className={LABEL_CLASS}>Modelo 3D (opcional)</p>
        <FileDropzone
          bucket="boracsport_templates"
          prefix="models"
          kind="model"
          value={model}
          onChange={setModel}
          maxFiles={1}
          label=".glb / .gltf"
        />
        {model.map((url) => <HiddenUrlField key={url} name="model_url" value={url} />)}
        <p className="text-xs text-white/45">
          Si lo dejás vacío, el diseñador muestra el placeholder procedural.
        </p>
      </section>

      <div className="grid gap-2">
        <label className={LABEL_CLASS} htmlFor="model_format">Formato del modelo 3D</label>
        <select
          id="model_format"
          name="model_format"
          defaultValue={template.model_format ?? ""}
          className={FIELD_CLASS}
        >
          <option value="">— Sin modelo —</option>
          <option value="glb">glb</option>
          <option value="gltf">gltf</option>
        </select>
      </div>

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
            plantillas GLB reales.
          </p>
        </div>
      </details>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          name="active"
          checked={active}
          onChange={onToggleActive}
          className="h-4 w-4 accent-[#dc2626]"
        />
        Activa en el diseñador público
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </Button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="h-10 rounded-md border border-red-500/40 px-4 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
        >
          Eliminar
        </button>
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