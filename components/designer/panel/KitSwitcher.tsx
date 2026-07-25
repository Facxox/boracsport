"use client"

// Selector de kit (camiseta / short / completo).
// Es la decisión base del personalizador: define qué zonas
// quedan visibles en el viewer.

import { useDesignStore } from "@/stores/design-store"
import type { KitId } from "@/lib/designer/types"
import { computeActiveZones } from "@/lib/designer/zones"
import { cn } from "@/lib/utils"

interface KitOption {
  id: KitId
  label: string
}

const KITS: ReadonlyArray<KitOption> = [
  { id: "shirt", label: "Camiseta" },
  { id: "shirt_short", label: "+ Short" },
  { id: "full", label: "Completo" },
]

export function KitSwitcher() {
  const kit = useDesignStore((s) => s.state.kit)
  const setKit = useDesignStore((s) => s.setKit)

  return (
    <fieldset>
      <legend className="text-foreground/70 mb-2 text-xs font-semibold tracking-wider uppercase">
        Kit
      </legend>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Kit">
        {KITS.map((k) => {
          const selected = kit === k.id
          const count = computeActiveZones(k.id).length
          return (
            <button
              key={k.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setKit(k.id)}
              className={cn(
                "min-h-[44px] rounded-lg border px-2 py-2 text-center text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected
                  ? "border-brand-red bg-brand-red/10 text-brand-red"
                  : "border-foreground/10 hover:border-foreground/30",
              )}
            >
              <span className="block leading-tight">{k.label}</span>
              <span className="text-muted-foreground block text-[10px] font-normal">
                {count} zonas
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
