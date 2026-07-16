"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { FileDropzone } from "@/components/admin/file-dropzone"
import {
  VariantMatrixEditor,
  type VariantFormValue,
} from "@/components/admin/variant-matrix-editor"
import { createProductAction } from "@/app/admin/actions"

interface CategoryOption {
  slug: string
  label: string
  kind: "ropa" | "pelota" | "otro"
}

interface NewProductFormProps {
  categories: CategoryOption[]
}

export function NewProductForm({ categories }: NewProductFormProps) {
  const [pending, startTransition] = useTransition()
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<VariantFormValue[]>([])
  const [categorySlug, setCategorySlug] = useState<string>(categories[0]?.slug ?? "")

  const selectedCategory = categories.find((c) => c.slug === categorySlug)
  const currentKind = selectedCategory?.kind ?? "otro"
  const showVariants = currentKind === "ropa"

  const variantStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)

  function handleSubmit(formData: FormData) {
    formData.delete("images")
    for (const url of images) formData.append("images", url)
    if (images.length === 0) formData.append("images", "")
    startTransition(async () => {
      const result = await createProductAction(formData)
      if (!result.ok) {
        toast.error(result.error)
      }
      // Si ok=true, el server action ya hizo redirect.
    })
  }

  return (
    <form action={handleSubmit} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-[#101012] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Nombre" required />
        <Field name="slug" label="Slug" required placeholder="ej: camiseta-titular-2026" />
      </div>

      <label className="grid gap-2 text-sm">
        Descripción
        <textarea
          name="description"
          className="min-h-28 rounded-xl border border-white/10 bg-black/20 p-3"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm">
          Categoría
          <select
            name="category"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            required
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
                {c.kind === "ropa" ? " · ropa" : c.kind === "pelota" ? " · pelota" : ""}
              </option>
            ))}
          </select>
          <span className="text-xs text-white/50">
            {currentKind === "ropa"
              ? "Vas a poder cargar talles y colores abajo."
              : currentKind === "pelota"
                ? "Solo se carga stock (sin talles ni colores)."
                : "Esta categoría no usa variantes — solo stock."}
          </span>
        </label>
        <Field name="price" label="Precio UYU" type="number" required defaultValue="0" />
        {showVariants ? (
          <div className="grid gap-2 text-sm">
            <span className="font-medium">Stock total (calculado)</span>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white/70">
              {variantStock} u.
            </div>
            <p className="text-xs text-white/50">Se calcula de las variantes de abajo.</p>
          </div>
        ) : (
          <Field
            name="stock"
            label="Stock"
            type="number"
            required
            defaultValue="0"
          />
        )}
      </div>

      <Field name="tags" label="Tags separados por coma" placeholder="futbol, titular, 2026" />

      <div>
        <p className="mb-2 text-sm font-semibold">Imágenes</p>
        <FileDropzone
          bucket="boracsport_products"
          prefix="draft"
          kind="image"
          value={images}
          onChange={setImages}
        />
        <p className="mt-2 text-xs text-white/50">
          Las imágenes se guardan en <code>boracsport_products/draft/</code>; podés re-ordenarlas y
          agregar más desde la página de edición después de crear el producto.
        </p>
      </div>

      {showVariants ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Variantes (talle × color × stock)</p>
            <span className="text-xs text-white/50">
              {variants.length} variante{variants.length === 1 ? "" : "s"}
            </span>
          </div>
          <VariantMatrixEditor value={variants} onChange={setVariants} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/60">
          Esta categoría no muestra la matriz de variantes. Solo cargás el stock arriba.
        </div>
      )}

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked className="size-4 accent-[#dc2626]" />
          Activo
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" className="size-4 accent-[#dc2626]" />
          Destacado
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="on_sale" className="size-4 accent-[#dc2626]" />
          En oferta
        </label>
      </div>

      <button
        disabled={pending}
        className="mt-2 rounded-xl bg-[#dc2626] px-5 py-3 font-bold text-black disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear producto"}
      </button>
    </form>
  )
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
      />
    </label>
  )
}