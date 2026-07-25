"use client"

// Selector de molde de camiseta.
// 4 moldes: cuello redondo/V × manga clásica/ranglan.

import { useDesignStore } from "@/stores/design-store"
import type { MoldId } from "@/lib/designer/types"
import { cn } from "@/lib/utils"

interface MoldOption {
  id: MoldId
  label: string
  hint: string
}

const MOLDS: ReadonlyArray<MoldOption> = [
  { id: "round_classic", label: "Redondo · clásica", hint: "Manga corta" },
  { id: "v_classic", label: "V · clásica", hint: "Manga corta" },
  { id: "round_raglan", label: "Redondo · raglan", hint: "Manga raglan" },
  { id: "v_raglan", label: "V · raglan", hint: "Manga raglan" },
]

export function MoldSwitcher() {
  const mold = useDesignStore((s) => s.state.mold)
  const setMold = useDesignStore((s) => s.setMold)

  return (
    <fieldset>
      <legend className="text-foreground/70 mb-2 text-xs font-semibold tracking-wider uppercase">
        Molde
      </legend>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Molde de camiseta">
        {MOLDS.map((m) => {
          const selected = mold === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMold(m.id)}
              className={cn(
                "min-h-[44px] rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected
                  ? "border-brand-red bg-brand-red/10 text-brand-red"
                  : "border-foreground/10 hover:border-foreground/30",
              )}
            >
              <span className="block leading-tight">{m.label}</span>
              <span className="text-muted-foreground block text-[11px] font-normal">
                {m.hint}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
