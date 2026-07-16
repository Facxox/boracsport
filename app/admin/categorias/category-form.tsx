"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { deleteCategoryAction, updateCategoryAction } from "@/app/admin/actions"

interface CategoryFormProps {
  id: string
  initial: {
    slug: string
    label: string
    emoji: string
    description: string
    display_order: number
    active: boolean
    kind: "ropa" | "pelota" | "otro"
  }
}

export function CategoryForm({ id, initial }: CategoryFormProps) {
  const [pending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateCategoryAction(id, formData)
        toast.success("Categoría actualizada")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar")
      }
    })
  }

  function handleDelete() {
    if (!window.confirm(`¿Eliminar la categoría "${initial.label}"? Los productos vinculados quedarán con category_id nulo.`)) return
    startTransition(async () => {
      try {
        await deleteCategoryAction(id)
        toast.success("Categoría eliminada")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-[#101012] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="label" label="Nombre visible" required defaultValue={initial.label} />
        <Field name="slug" label="Slug (URL friendly, se genera del nombre si lo dejás vacío)" defaultValue={initial.slug} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="emoji" label="Emoji" defaultValue={initial.emoji} placeholder="⚽" />
        <Field
          name="display_order"
          label="Orden"
          type="number"
          defaultValue={String(initial.display_order)}
          required
        />
      </div>

      <label className="grid gap-2 text-sm">
        Descripción (se muestra en el registro)
        <textarea
          name="description"
          defaultValue={initial.description}
          className="min-h-24 rounded-xl border border-white/10 bg-black/20 p-3"
        />
      </label>

      <label className="grid gap-2 text-sm">
        Tipo
        <select
          name="kind"
          defaultValue={initial.kind}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
        >
          <option value="ropa">Ropa (muestra matriz de talles y colores)</option>
          <option value="pelota">Pelota (sin variantes — solo stock)</option>
          <option value="otro">Otro (sin variantes — DTF, merchandising, etc.)</option>
        </select>
        <span className="text-xs text-white/50">
          Cambiar el tipo afecta cómo se cargan los productos de esta categoría.
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial.active}
          className="size-4 accent-[#dc2626]"
        />
        Activa (visible en filtro, registro y cuenta)
      </label>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          Eliminar categoría
        </button>
        <button
          disabled={pending}
          className="rounded-xl bg-[#dc2626] px-5 py-2 font-bold text-black disabled:opacity-50"
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