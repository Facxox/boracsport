"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { FileDropzone } from "@/components/admin/file-dropzone"
import {
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/actions"

interface CategoryOption {
  slug: string
  label: string
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
  }
  categories: CategoryOption[]
}

export function ProductForm({ id, initial, categories }: ProductFormProps) {
  const [pending, startTransition] = useTransition()
  const [images, setImages] = useState<string[]>(initial.images)

  function handleSubmit(formData: FormData) {
    formData.delete("images")
    for (const url of images) formData.append("images", url)
    if (images.length === 0) formData.append("images", "")
    startTransition(async () => {
      try {
        await updateProductAction(id, formData)
        toast.success("Producto actualizado")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo actualizar")
      }
    })
  }

  function handleDelete() {
    if (!window.confirm(`¿Eliminar "${initial.name}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      try {
        await deleteProductAction(id)
        toast.success("Producto eliminado")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-[#101012] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Nombre" required defaultValue={initial.name} />
        <Field name="slug" label="Slug" required defaultValue={initial.slug} />
      </div>

      <label className="grid gap-2 text-sm">
        Descripción
        <textarea
          name="description"
          defaultValue={initial.description}
          className="min-h-28 rounded-xl border border-white/10 bg-black/20 p-3"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm">
          Categoría
          <select
            name="category"
            defaultValue={initial.category}
            required
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <Field name="price" label="Precio UYU" type="number" required defaultValue={String(initial.price)} />
        <Field name="stock" label="Stock" type="number" required defaultValue={String(initial.stock)} />
      </div>

      <Field name="tags" label="Tags separados por coma" defaultValue={initial.tags.join(", ")} />

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

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={initial.active} className="size-4 accent-[#ff5a00]" />
          Activo
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="size-4 accent-[#ff5a00]" />
          Destacado
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="on_sale" defaultChecked={initial.on_sale} className="size-4 accent-[#ff5a00]" />
          En oferta
        </label>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          Eliminar producto
        </button>
        <button
          disabled={pending}
          className="rounded-xl bg-[#ff5a00] px-5 py-2 font-bold text-black disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
      />
    </label>
  )
}