"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { TemplateRow } from "@/lib/supabase/types"
import { safeImageUrl } from "@/lib/safe-image"
import {
  deleteTemplateAction,
  toggleTemplateActiveAction,
} from "@/app/admin/actions"

type Row = Pick<
  TemplateRow,
  | "id"
  | "name"
  | "mockup_url_front"
  | "mockup_url_back"
  | "mockup_url_neck"
  | "mockup_url_collar"
  | "mockup_url_sleeves"
  | "mockup_url_cuffs"
  | "mockup_url_short"
  | "mockup_url_socks"
  | "price"
  | "version"
  | "active"
  | "updated_at"
>

function formatUYU(value: number) {
  return `$U ${Math.round(value).toLocaleString("es-UY")}`
}

const MOCKUP_KEYS = [
  "mockup_url_front",
  "mockup_url_back",
  "mockup_url_neck",
  "mockup_url_collar",
  "mockup_url_sleeves",
  "mockup_url_cuffs",
  "mockup_url_short",
  "mockup_url_socks",
] as const

function countMockups(t: Row): number {
  let n = 0
  for (const k of MOCKUP_KEYS) if (t[k]) n += 1
  return n
}

export function TemplateRowActions({ template }: { template: Row }) {
  const [pending, startTransition] = useTransition()

  function onToggle() {
    startTransition(async () => {
      try {
        await toggleTemplateActiveAction(template.id, !template.active)
        toast.success(template.active ? "Silueta desactivada" : "Silueta activada")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error")
      }
    })
  }

  function onDelete() {
    if (typeof window !== "undefined" && !window.confirm(`Eliminar "${template.name}"?`)) return
    startTransition(async () => {
      try {
        const result = await deleteTemplateAction(template.id)
        if (!result.ok) throw new Error(result.error)
        toast.success("Silueta eliminada")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error")
      }
    })
  }

  const preview = safeImageUrl(template.mockup_url_front)
  const mockupsCount = countMockups(template)

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#101012]">
      <div className="relative aspect-[4/3] w-full bg-black">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={template.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-white/40">
            Sin mockup
          </div>
        )}
        <span
          className={
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold " +
            (template.active
              ? "bg-emerald-500/80 text-black"
              : "bg-black/70 text-white/70")
          }
        >
          {template.active ? "Activa" : "Oculta"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-sans text-sm font-bold">{template.name}</p>
        <p className="mt-0.5 text-xs text-white/50">
          v{template.version} · {formatUYU(template.price)}
        </p>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-white/55">
          <span aria-label={`${mockupsCount} de 8 mockups cargados`}>
            {mockupsCount}/8 mockups
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Link
            href={`/admin/templates/${template.id}`}
            className="h-9 inline-flex items-center rounded-lg border border-white/10 px-3 text-xs hover:bg-white/5"
          >
            Editar
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              disabled={pending}
              className="h-9 rounded-lg border border-white/10 px-3 text-xs hover:bg-white/5 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : template.active ? "Desactivar" : "Activar"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="h-9 rounded-lg border border-red-500/30 px-3 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
