"use client"

import { useTransition } from "react"
import { toast } from "sonner"
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
        <Field name="label" label="Nombre visible" required />
        <Field name="slug" label="Slug (opcional)" placeholder="deportivo" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="emoji" label="Emoji" placeholder="⚽" />
        <Field name="display_order" label="Orden" type="number" defaultValue="100" />
      </div>
      <label className="grid gap-2 text-sm">
        Tipo
        <select
          name="kind"
          defaultValue="otro"
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
        >
          <option value="ropa">Ropa (muestra matriz de talles y colores)</option>
          <option value="pelota">Pelota (sin variantes — solo stock)</option>
          <option value="otro">Otro (sin variantes — DTF, merchandising, etc.)</option>
        </select>
        <span className="text-xs text-white/50">
          Elegí "Ropa" si los productos tienen talles/colores. Para el resto, "Otro" oculta la matriz.
        </span>
      </label>
      <label className="grid gap-2 text-sm">
        Descripción
        <textarea
          name="description"
          className="min-h-20 rounded-xl border border-white/10 bg-black/20 p-3"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked className="size-4 accent-[#dc2626]" />
        Activa
      </label>
      <button
        disabled={pending}
        className="justify-self-start rounded-xl bg-[#dc2626] px-5 py-2 font-bold text-black disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear categoría"}
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