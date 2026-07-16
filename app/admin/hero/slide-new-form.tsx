"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { FileDropzone } from "@/components/admin/file-dropzone"
import { createSlideAction } from "@/app/admin/actions"

export function SlideNewForm({ nextOrder }: { nextOrder: number }) {
  const [pending, startTransition] = useTransition()
  const [kind, setKind] = useState<"image" | "video">("image")
  const [url, setUrl] = useState("")
  const [posterUrl, setPosterUrl] = useState("")

  function handleSubmit(formData: FormData) {
    formData.set("kind", kind)
    formData.set("url", url)
    formData.set("poster_url", posterUrl)
    if (!url) {
      toast.error("Subí primero la imagen o video")
      return
    }
    startTransition(async () => {
      try {
        await createSlideAction(formData)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo crear el slide")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-4 grid gap-6 rounded-2xl border border-white/10 bg-[#101012] p-6">
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">Tipo de media</legend>
        <div className="flex gap-2">
          {(["image", "video"] as const).map((k) => (
            <label
              key={k}
              className={
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm " +
                (kind === k ? "border-[#ff5a00] bg-[#ff5a00]/10" : "border-white/10 hover:bg-white/5")
              }
            >
              <input
                type="radio"
                name="kind-radio"
                checked={kind === k}
                onChange={() => setKind(k)}
                className="accent-[#ff5a00]"
              />
              {k === "image" ? "Imagen" : "Video"}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="mb-2 text-sm font-semibold">Subir {kind === "image" ? "imagen" : "video"}</p>
        <FileDropzone
          bucket="boracsport_hero"
          prefix={kind}
          kind={kind === "video" ? "media" : "image"}
          value={url ? [url] : []}
          onChange={(urls) => setUrl(urls[0] ?? "")}
          maxFiles={1}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="heading" label="Título" placeholder="Diseñá tu equipo a tu medida" />
        <Field name="subheading" label="Subtítulo" placeholder="Indumentaria deportiva, DTF y merchandising" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="cta_label" label="Texto del botón" defaultValue="Diseñá tu equipo" />
        <Field name="cta_href" label="Link del botón" defaultValue="/personalizar" />
      </div>
      <Field name="display_order" label="Orden" type="number" defaultValue={String(nextOrder)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked className="size-4 accent-[#ff5a00]" />
        Activo
      </label>
      <button
        disabled={pending}
        className="justify-self-start rounded-xl bg-[#ff5a00] px-5 py-2 font-bold text-black disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear slide"}
      </button>
    </form>
  )
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
}: {
  name: string
  label: string
  type?: string
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
      />
    </label>
  )
}