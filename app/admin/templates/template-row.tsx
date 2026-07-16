"use client"

import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"
import {
  deleteTemplateAction,
  toggleTemplateActiveAction,
} from "@/app/admin/actions"

interface TemplateRowProps {
  id: string
  name: string
  active: boolean
  price: number
  modelFormat: string | null
  zoneCount: number
}

export function TemplateRow({ id, name, active, price, modelFormat, zoneCount }: TemplateRowProps) {
  const [pending, startTransition] = useTransition()

  function handleToggle(next: boolean) {
    startTransition(async () => {
      try {
        await toggleTemplateActiveAction(id, next)
        toast.success(next ? "Plantilla publicada" : "Plantilla oculta")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar el estado")
      }
    })
  }

  function handleDelete() {
    if (!window.confirm(`¿Eliminar la plantilla "${name}"? Esta acción no se puede deshacer.`)) return
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
    <article className="flex flex-col rounded-2xl border border-white/10 bg-[#101012] p-5">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-sans text-xl font-bold tracking-tight">
          <Link href={`/admin/templates/${id}`} className="hover:text-[#dc2626]">
            {name}
          </Link>
        </h2>
        <span
          className={
            active
              ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400"
              : "rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50"
          }
        >
          {active ? "Publicada" : "Borrador"}
        </span>
      </div>

      <p className="mt-2 text-sm text-white/60">
        {modelFormat ? modelFormat.toUpperCase() : "Sin modelo"} · {zoneCount} zonas · $U{" "}
        {Number(price).toLocaleString("es-UY")}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={active}
            disabled={pending}
            onChange={(e) => handleToggle(e.target.checked)}
            className="size-4 accent-[#dc2626]"
          />
          <span className={active ? "text-emerald-400" : "text-white/50"}>
            {active ? "Visible en /personalizar" : "Solo admins"}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/templates/${id}`}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}