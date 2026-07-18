"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { AdminField } from "@/components/admin/admin-field"
import { createCategoryAction } from "@/app/admin/actions"

export function CategoryNewForm() {
  const [pending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createCategoryAction(formData)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo crear la categoría")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-[#101012] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="label" label="Nombre visible" required />
        <AdminField name="slug" label="Slug (opcional)" placeholder="deportivo" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="emoji" label="Emoji" placeholder="⚽" />
        <AdminField name="display_order" label="Orden" type="number" defaultValue="100" />
      </div>
      <label className="grid gap-2 text-sm">
        Tipo
        <select
          name="kind"
          defaultValue="otro"
          className="h-10 rounded-xl border border-white/10 bg-black/20 px-3"
        >
          <option value="ropa">Ropa (muestra matriz de talles y colores)</option>
          <option value="pelota">Pelota (sin variantes — solo stock)</option>
          <option value="otro">Otro (sin variantes — DTF, merchandising, etc.)</option>
        </select>
        <span className="text-xs text-white/50">
          Elegí "Ropa" si los productos tienen talles/colores. Para el resto, "Otro" oculta la matriz.
        </span>
      </label>
      <AdminField name="description" label="Descripción" type="textarea" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked className="size-4 accent-[#dc2626]" />
        Activa
      </label>
      <button
        disabled={pending}
        className="h-10 justify-self-start rounded-xl bg-[#dc2626] px-5 font-bold text-black disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear categoría"}
      </button>
    </form>
  )
}
