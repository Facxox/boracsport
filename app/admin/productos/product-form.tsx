"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { AdminField } from "@/components/admin/admin-field"
import { FileDropzone } from "@/components/admin/file-dropzone"
import {
  VariantMatrixEditor,
  type VariantFormValue,
} from "@/components/admin/variant-matrix-editor"
import {
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/actions"

interface CategoryOption {
  slug: string
  label: string
  kind: "ropa" | "pelota" | "otro"
}

interface ProductFormProps {
  id: string
  initial: {
    name: string
    slug: string
    description: string
    category: string
    price: number
    stock: number
    tags: string[]
    images: string[]
    active: boolean
    featured: boolean
    on_sale: boolean
    variants: VariantFormValue[]
  }
  categories: CategoryOption[]
}

export function ProductForm({ id, initial, categories }: ProductFormProps) {
  const [pending, startTransition] = useTransition()
  const [images, setImages] = useState<string[]>(initial.images)
  const [variants, setVariants] = useState<VariantFormValue[]>(initial.variants)
  const [categorySlug, setCategorySlug] = useState<string>(initial.category)

  const selectedCategory = categories.find((c) => c.slug === categorySlug)
  const currentKind = selectedCategory?.kind ?? "otro"
  const showVariants = currentKind === "ropa"

  function handleSubmit(formData: FormData) {
    formData.delete("images")
    for (const url of images) formData.append("images", url)
    if (images.length === 0) formData.append("images", "")
    startTransition(async () => {
      const result = await updateProductAction(id, formData)
      if (result.ok) {
        toast.success("Producto actualizado")
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete() {
    if (!window.confirm(`¿Eliminar "${initial.name}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const result = await deleteProductAction(id)
      if (!result.ok) {
        toast.error(result.error)
      }
      // Si ok=true, el server action redirige.
    })
  }

  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)

  return (
    <form action={handleSubmit} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-[#101012] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="name" label="Nombre" required defaultValue={initial.name} />
        <AdminField
          name="slug"
          label="Slug"
          required
          defaultValue={initial.slug}
          hint="Es el nombre único que aparece en la URL. Usá minúsculas y guiones, por ejemplo: camiseta-titular-2026."
        />
      </div>

      <AdminField
        name="description"
        label="Descripción"
        type="textarea"
        defaultValue={initial.description}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid min-w-0 gap-2 text-sm">
          Categoría
          <select
            name="category"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            required
            className="h-10 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-3"
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
        <AdminField name="price" label="Precio UYU" type="number" required defaultValue={String(initial.price)} />
        {showVariants ? (
          <div className="grid gap-2 text-sm">
            <span className="font-medium">Stock total (calculado)</span>
            <div className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white/70">
              {totalStock} u.
            </div>
            <p className="text-muted-foreground text-xs">Se calcula de las variantes de abajo.</p>
          </div>
        ) : (
          <AdminField
            name="stock"
            label="Stock"
            type="number"
            required
            defaultValue={String(initial.stock)}
          />
        )}
      </div>

      <AdminField name="tags" label="Tags separados por coma" defaultValue={initial.tags.join(", ")} />

      <div>
        <p className="mb-2 text-sm font-semibold">Imágenes</p>
        <FileDropzone
          bucket="boracsport_products"
          prefix={id}
          kind="image"
          value={images}
          onChange={setImages}
        />
      </div>

      {showVariants ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Variantes (talle × color × stock)</p>
            <span className="text-muted-foreground text-xs">{variants.length} variante{variants.length === 1 ? "" : "s"}</span>
          </div>
          <VariantMatrixEditor value={variants} onChange={setVariants} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/60">
          Esta categoría no muestra la matriz de variantes. El stock se carga arriba.
        </div>
      )}

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={initial.active} className="size-4 accent-[#dc2626]" />
          Activo
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="size-4 accent-[#dc2626]" />
          Destacado
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="on_sale" defaultChecked={initial.on_sale} className="size-4 accent-[#dc2626]" />
          En oferta
        </label>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="h-10 rounded-xl border border-red-500/40 px-4 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          Eliminar producto
        </button>
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
