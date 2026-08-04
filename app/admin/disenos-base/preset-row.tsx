"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { DesignPresetRow } from "@/lib/supabase/types"
import { safeImageUrl } from "@/lib/safe-image"
import {
  deleteDesignPresetAction,
  setPresetActiveAction,
} from "@/app/admin/actions"

type Row = Pick<
  DesignPresetRow,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "preview_url"
  | "price"
  | "active"
  | "display_order"
  | "template_id"
  | "created_at"
  | "updated_at"
>

function formatUYU(value: number) {
  return `$U ${Math.round(value).toLocaleString("es-UY")}`
}

interface PresetRowActionsProps {
  preset: Row
}

export function PresetRowActions({ preset }: PresetRowActionsProps) {
  const [pending, startTransition] = useTransition()

  function onToggle() {
    startTransition(async () => {
      try {
        await setPresetActiveAction(preset.id, !preset.active)
        toast.success(preset.active ? "Preset ocultado" : "Preset publicado")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo actualizar")
      }
    })
  }

  function onDelete() {
    if (!window.confirm(`¿Eliminar el preset "${preset.name}"? Esta acción no se puede deshacer.`)) {
      return
    }
    startTransition(async () => {
      try {
        const result = await deleteDesignPresetAction(preset.id)
        if (!result.ok) throw new Error(result.error)
        toast.success("Preset eliminado")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  return (
    <li className="overflow-hidden rounded-xl border border-white/10 bg-[#101012]">
      <div className="flex flex-col gap-3 sm:flex-row">
        {preset.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeImageUrl(preset.preview_url) ?? preset.preview_url}
            alt={preset.name}
            className="aspect-square w-full object-cover sm:h-auto sm:w-32"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-white/5 text-xs text-white/40 sm:w-32">
            sin preview
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-base font-extrabold">{preset.name}</p>
              <p className="text-[11px] text-white/45">/{preset.slug}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggle}
                disabled={pending}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                  preset.active
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10",
                )}
              >
                {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {preset.active ? "Publicado" : "Oculto"}
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="rounded-md p-1.5 text-white/45 hover:bg-red-500/15 hover:text-red-400 disabled:opacity-50"
                aria-label="Eliminar preset"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {preset.description ? (
            <p className="line-clamp-2 text-xs text-white/60">{preset.description}</p>
          ) : null}
          <div className="mt-auto flex items-center justify-between gap-2 text-xs text-white/55">
            <span>{formatUYU(preset.price)}</span>
            <Link
              href={`/admin/disenos-base/${preset.id}`}
              className="rounded-md border border-white/10 px-2.5 py-1 font-semibold hover:bg-white/5"
            >
              Editar
            </Link>
          </div>
        </div>
      </div>
    </li>
  )
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}