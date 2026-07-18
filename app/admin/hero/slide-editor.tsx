"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { AdminField } from "@/components/admin/admin-field"
import { FileDropzone } from "@/components/admin/file-dropzone"
import {
  deleteSlideAction,
  toggleSlideActiveAction,
  updateSlideAction,
} from "@/app/admin/actions"

interface SlideEditorProps {
  id: string
  initial: {
    kind: "image" | "video"
    url: string
    poster_url: string | null
    heading: string
    subheading: string
    cta_label: string
    cta_href: string
    display_order: number
    active: boolean
  }
}

export function SlideEditor({ id, initial }: SlideEditorProps) {
  const [pending, startTransition] = useTransition()
  const [kind, setKind] = useState<"image" | "video">(initial.kind)
  const [mediaUrl, setMediaUrl] = useState(initial.url)
  const [posterUrl, setPosterUrl] = useState(initial.poster_url ?? "")

  function handleSubmit(formData: FormData) {
    formData.set("kind", kind)
    formData.set("url", mediaUrl)
    formData.set("poster_url", posterUrl)
    startTransition(async () => {
      try {
        await updateSlideAction(id, formData)
        toast.success("Slide actualizado")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar")
      }
    })
  }

  function handleDelete() {
    if (!window.confirm("¿Eliminar este slide?")) return
    startTransition(async () => {
      try {
        await deleteSlideAction(id)
        toast.success("Slide eliminado")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  function handleToggle(next: boolean) {
    startTransition(async () => {
      try {
        await toggleSlideActiveAction(id, next)
        toast.success(next ? "Slide publicado" : "Slide oculto")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar el estado")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-8 grid gap-6 rounded-2xl border border-white/10 bg-[#101012] p-6">
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">Tipo de media</legend>
        <div className="flex gap-2">
          {(["image", "video"] as const).map((k) => (
            <label
              key={k}
              className={
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm " +
                (kind === k ? "border-[#dc2626] bg-[#dc2626]/10" : "border-white/10 hover:bg-white/5")
              }
            >
              <input
                type="radio"
                name="kind-radio"
                checked={kind === k}
                onChange={() => setKind(k)}
                className="accent-[#dc2626]"
              />
              {k === "image" ? "Imagen" : "Video"}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="mb-2 text-sm font-semibold">{kind === "image" ? "Imagen de fondo" : "Video de fondo"}</p>
        <FileDropzone
          bucket="boracsport_hero"
          prefix={kind}
          kind={kind === "video" ? "media" : "image"}
          value={mediaUrl ? [mediaUrl] : []}
          onChange={(urls) => setMediaUrl(urls[0] ?? "")}
          maxFiles={1}
          accept={kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
        />
      </div>

      {kind === "video" ? (
        <div>
          <p className="mb-2 text-sm font-semibold">Poster (opcional, se muestra mientras carga)</p>
          <FileDropzone
            bucket="boracsport_hero"
            prefix="poster"
            kind="image"
            value={posterUrl ? [posterUrl] : []}
            onChange={(urls) => setPosterUrl(urls[0] ?? "")}
            maxFiles={1}
          />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="heading" label="Título" defaultValue={initial.heading} placeholder="Diseñá tu equipo" />
        <AdminField name="subheading" label="Subtítulo" defaultValue={initial.subheading} placeholder="A tu medida, en Uruguay" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="cta_label" label="Texto del botón" defaultValue={initial.cta_label} />
        <AdminField name="cta_href" label="Link del botón" defaultValue={initial.cta_href} placeholder="/personalizar" />
      </div>

      <AdminField
        name="display_order"
        label="Orden en el carrusel"
        type="number"
        defaultValue={String(initial.display_order)}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial.active}
          className="size-4 accent-[#dc2626]"
        />
        Activo (visible en el hero público)
      </label>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleToggle(!initial.active)}
            disabled={pending}
            className="h-10 rounded-xl border border-white/10 px-4 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            {initial.active ? "Ocultar" : "Publicar"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="h-10 rounded-xl border border-red-500/40 px-4 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
        <button
          disabled={pending}
          className="h-10 rounded-xl bg-[#dc2626] px-5 font-bold text-black disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}
