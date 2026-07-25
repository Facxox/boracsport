"use client"

// Grid de patrones procedurales.
// Genera las miniaturas con `TextureCompositor.mini()` y las guarda en
// cache para no recomputar en cada render.

import { useEffect, useState } from "react"
import { PATTERNS } from "@/components/designer/patterns"
import { TextureCompositor } from "@/components/designer/TextureCompositor"
import { useDesignStore } from "@/stores/design-store"
import type { PatternId } from "@/lib/designer/types"
import { cn } from "@/lib/utils"

export function PatternGrid() {
  const patternId = useDesignStore((s) => s.state.pattern.id)
  const setPattern = useDesignStore((s) => s.setPattern)

  return (
    <fieldset>
      <legend className="text-foreground/70 mb-2 text-xs font-semibold tracking-wider uppercase">
        Patrón
      </legend>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Patrón">
        {PATTERNS.map((p) => {
          const selected = patternId === p.id
          return (
            <PatternTile
              key={p.id}
              id={p.id}
              label={p.label}
              continuous={p.continuous}
              selected={selected}
              onSelect={() => setPattern(p.id)}
            />
          )
        })}
      </div>
    </fieldset>
  )
}

interface TileProps {
  id: PatternId
  label: string
  continuous: boolean
  selected: boolean
  onSelect: () => void
}

function PatternTile({ id, label, continuous, selected, onSelect }: TileProps) {
  const [thumb, setThumb] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    // Generamos la miniatura en mount; la pasamos a <img src> para que el
    // navegador la cachee y no haya que recomputar el canvas en cada render.
    // Diferimos con queueMicrotask para no provocar un render en cascada.
    const canvas = TextureCompositor.mini(id, 96, 96)
    const url = canvas.toDataURL("image/png")
    queueMicrotask(() => setThumb(url))
  }, [id])

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group flex min-h-[64px] flex-col items-stretch overflow-hidden rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        selected
          ? "border-brand-red ring-2 ring-brand-red/40"
          : "border-foreground/10 hover:border-foreground/30",
      )}
    >
      <span
        aria-hidden
        className="bg-muted relative block aspect-square w-full overflow-hidden"
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="bg-foreground/10 block h-full w-full" />
        )}
        {continuous ? (
          <span className="border-foreground/30 bg-background/80 text-foreground/80 absolute top-1 right-1 rounded border px-1 py-px text-[9px] font-semibold tracking-wide uppercase">
            Continuo
          </span>
        ) : null}
      </span>
      <span className="block truncate px-1.5 py-1 text-[11px] font-medium">
        {label}
      </span>
    </button>
  )
}
