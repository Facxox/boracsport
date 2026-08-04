"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FileDropzone, HiddenUrlField } from "@/components/admin/file-dropzone"
import { PresetVariantsEditor } from "@/components/admin/preset-variants-editor"
import {
  createDesignPresetAction,
  updateDesignPresetAction,
} from "@/app/admin/actions"
import type { TemplateRow, DesignPresetRow, DesignPresetVariantRow } from "@/lib/supabase/types"
import type { VariantFormValue } from "@/components/admin/variant-matrix-editor"

const FIELD_CLASS =
  "h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#dc2626]"
const LABEL_CLASS = "mb-1 block text-xs uppercase tracking-wider text-white/55"

interface PresetFormProps {
  preset?: DesignPresetRow
  variants?: DesignPresetVariantRow[]
  templates: Array<Pick<TemplateRow, "id" | "name" | "active">>
}

function variantsToFormValue(variants: DesignPresetVariantRow[]): VariantFormValue[] {
  return variants.map((v) => ({
    size: v.size,
    color: v.color,
    sku: v.sku ?? "",
    stock: v.stock,
    price_override: v.price_override == null ? "" : String(v.price_override),
  }))
}

export function PresetForm({ preset, variants = [], templates }: PresetFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [previewUrl, setPreviewUrl] = useState(preset?.preview_url ?? "")
  const [variantValues, setVariantValues] = useState<VariantFormValue[]>(
    variantsToFormValue(variants),
  )

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      try {
        if (preset) {
          const result = await updateDesignPresetAction(preset.id, formData)
          if (!result.ok) throw new Error(result.error)
          toast.success("Preset actualizado")
          router.refresh()
        } else {
          const result = await createDesignPresetAction(formData)
          if (!result.ok) throw new Error(result.error)
          toast.success("Preset creado")
          router.push(`/admin/disenos-base/${result.id}`)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar")
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {/* Si tenemos un id, serializamos el payload actual como JSON hidden
          para que el server action lo reciba sin pedirle al admin rearmarlo. */}
      {preset ? (
        <input
          type="hidden"
          name="payload"
          value={JSON.stringify(preset.payload ?? {})}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            defaultValue={preset?.name ?? ""}
            className={FIELD_CLASS}
            placeholder="Ej. Camiseta titular 2026"
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="slug">Slug</label>
          <input
            id="slug"
            name="slug"
            required
            maxLength={80}
            defaultValue={preset?.slug ?? ""}
            className={FIELD_CLASS}
            placeholder="camiseta-titular-2026"
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          maxLength={1000}
          defaultValue={preset?.description ?? ""}
          className={`${FIELD_CLASS} h-auto py-2`}
          placeholder="Resumen comercial del preset (visible al cliente)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="template_id">Silueta base</label>
          <select
            id="template_id"
            name="template_id"
            required
            defaultValue={preset?.template_id ?? ""}
            className={FIELD_CLASS}
          >
            <option value="" disabled>
              Elegí una silueta…
            </option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.active ? "" : "(inactiva)"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="price">Precio (UYU)</label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={preset?.price ?? 2500}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <section className="grid gap-4 rounded-xl border border-white/10 bg-[#101012] p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-white/80">
            Preview
          </h2>
          <span className="text-xs text-white/45">PNG / JPG / WebP</span>
        </div>
        <FileDropzone
          bucket="boracsport_presets"
          prefix={preset ? `presets/${preset.id}/preview` : "presets/new/preview"}
          kind="image"
          value={previewUrl ? [previewUrl] : []}
          onChange={(urls) => setPreviewUrl(urls[0] ?? "")}
          maxFiles={1}
          label="Imagen cuadrada 1:1"
        />
        {previewUrl ? <HiddenUrlField name="preview_url" value={previewUrl} /> : null}
      </section>

      <section className="grid gap-4 rounded-xl border border-white/10 bg-[#101012] p-4">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-white/80">
          Variantes
        </h2>
        <PresetVariantsEditor value={variantValues} onChange={setVariantValues} />
      </section>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          name="active"
          defaultChecked={preset?.active ?? true}
          className="h-4 w-4 accent-[#dc2626]"
        />
        Publicar al guardar
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : preset ? (
            <UploadCloud className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {preset ? "Guardar cambios" : "Crear preset"}
        </Button>
        <button
          type="button"
          onClick={() => router.push("/admin/disenos-base")}
          className="text-sm text-white/55 hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}