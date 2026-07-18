"use client"

import { useState, useTransition } from "react"
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
  const [modelUrl, setModelUrl] = useState<string[]>(initial.model_url ? [initial.model_url] : [])

  function handleSubmit(formData: FormData) {
    formData.set("mockup_url_front", mockupFront[0] ?? "")
    formData.set("mockup_url_back", mockupBack[0] ?? "")
    formData.set("model_url", modelUrl[0] ?? "")
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-semibold">Modelo 3D (.glb / .gltf, opcional)</p>
          <FileDropzone
            bucket="boracsport_templates"
            prefix={`${prefix}/model`}
            kind="model"
            value={modelUrl}
            onChange={setModelUrl}
            maxFiles={1}
            accept=".glb,.gltf"
          />
        </div>
        <label className="grid gap-2 text-sm">
          Formato
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

      <details className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
        <summary className="cursor-pointer select-none text-white/70">
          Configuración avanzada (scene_config / default_config)
        </summary>
        <div className="mt-3 grid gap-3">
          <label className="grid gap-2 text-xs">
            scene_config
            <textarea
              name="scene_config"
              defaultValue={initial.scene_config}
              className="min-h-24 rounded-lg border border-white/10 bg-black/30 p-2 font-mono"
            />
          </label>
          <label className="grid gap-2 text-xs">
            default_config
            <textarea
              name="default_config"
              defaultValue={initial.default_config}
              className="min-h-24 rounded-lg border border-white/10 bg-black/30 p-2 font-mono"
            />
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