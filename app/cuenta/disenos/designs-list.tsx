"use client"

import { useEffect, useRef, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { TextureCompositor } from "@/components/designer/TextureCompositor"
import type { DesignState } from "@/lib/designer/types"
import { deleteDesignAction } from "@/app/cuenta/actions"

interface DesignItem {
  id: string
  payload: DesignState
  createdAt: string
  updatedAt: string
}

function summarize(payload: DesignState): string {
  const parts: string[] = []
  if (payload.zones.front?.type === "text") parts.push(`Frente: "${payload.zones.front.text}"`)
  else if (payload.zones.front?.type === "logo") parts.push("Frente: logo")
  else if (payload.zones.front?.type === "pattern") parts.push(`Frente: ${payload.zones.front.patternId}`)
  if (payload.zones.back?.type === "text") parts.push(`Espalda: "${payload.zones.back.text}"`)
  else if (payload.zones.back?.type === "number") parts.push(`Espalda: #${payload.zones.back.value}`)
  else if (payload.zones.back?.type === "logo") parts.push("Espalda: logo")
  return parts.join(" · ") || "Sin contenido"
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(d)
  } catch {
    return iso
  }
}

function moldLabel(mold: string): string {
  return mold.replace("round_", "Cuello redondo · ").replace("v_", "Cuello V · ").replace("classic", "clásica").replace("raglan", "raglán")
}

export function DesignsList({ designs }: { designs: DesignItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </ul>
  )
}

function Thumbnail({ payload }: { payload: DesignState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const target = canvasRef.current
    if (!target) return
    try {
      const src = TextureCompositor.compose(payload, new Map(), { width: 384, height: 384 })
      const ctx = target.getContext("2d")
      if (!ctx) return
      target.width = src.width
      target.height = src.height
      ctx.clearRect(0, 0, target.width, target.height)
      ctx.drawImage(src, 0, 0)
    } catch (err) {
      console.warn("[designs-list] no se pudo renderizar la miniatura:", err)
    }
  }, [payload])
  return (
    <canvas
      ref={canvasRef}
      width={384}
      height={384}
      className="bg-muted h-full w-full"
      aria-label="Miniatura del diseño"
    />
  )
}

function DesignCard({ design }: { design: DesignItem }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function onDelete() {
    if (typeof window !== "undefined" && !window.confirm("¿Eliminar este diseño?")) return
    startTransition(async () => {
      try {
        const result = await deleteDesignAction(design.id)
        if (!result.ok) {
          toast.error("No se pudo eliminar")
          return
        }
        toast.success("Diseño eliminado")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error")
      }
    })
  }

  return (
    <li className="bg-card flex flex-col overflow-hidden rounded-2xl border border-white/5">
      <Link
        href={`/personalizar?design=${design.id}`}
        className="bg-muted relative block aspect-square w-full"
      >
        <Thumbnail payload={design.payload} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm font-semibold">{summarize(design.payload)}</p>
        <p className="text-muted-foreground text-xs">
          {moldLabel(design.payload.mold)} · {design.payload.kit}
        </p>
        <p className="text-muted-foreground text-xs">Actualizado {formatDate(design.updatedAt)}</p>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <Link
            href={`/personalizar?design=${design.id}`}
            className="bg-brand-red text-black inline-flex h-9 flex-1 items-center justify-center rounded-md text-xs font-bold hover:bg-[#ef4444]"
          >
            Abrir
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="border-destructive/40 text-destructive inline-flex h-9 items-center gap-1 rounded-md border px-3 text-xs hover:bg-destructive/10 disabled:opacity-50"
            aria-label="Eliminar diseño"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Borrar
          </button>
        </div>
      </div>
    </li>
  )
}