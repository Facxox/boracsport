"use client"

// Pestaña "Colores" — molde, kit, color por zona.

import { useMemo } from "react"
import { RotateCcw } from "lucide-react"
import { useDesignStore } from "@/stores/design-store"
import { computeActiveZones } from "@/lib/designer/zones"
import type { ZoneId } from "@/lib/designer/types"
import { Button } from "@/components/ui/button"
import { MoldSwitcher } from "./MoldSwitcher"
import { KitSwitcher } from "./KitSwitcher"
import { ColorPicker } from "./ColorPicker"

const ZONE_LABEL: Record<ZoneId, string> = {
  front: "Frente",
  back: "Espalda",
  neck: "Cuello",
  collar: "Solapa",
  sleeve_l: "Manga izquierda",
  sleeve_r: "Manga derecha",
  cuff_l: "Puño izquierdo",
  cuff_r: "Puño derecho",
  short: "Short",
  short_back: "Short (atrás)",
  socks: "Medias",
  socks_back: "Medias (atrás)",
}

export function TabColores() {
  const kit = useDesignStore((s) => s.state.kit)
  const zones = useDesignStore((s) => s.state.zones)
  const setZoneColor = useDesignStore((s) => s.setZoneColor)
  const reset = useDesignStore((s) => s.reset)

  // Sólo mostramos zonas del kit actual (short/medias condicionales).
  const active = useMemo(() => computeActiveZones(kit), [kit])

  return (
    <div className="space-y-6">
      <MoldSwitcher />
      <KitSwitcher />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground/70 text-xs font-semibold tracking-wider uppercase">
            Color por zona
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => reset(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
        {active.map((id) => {
          const z = zones[id]
          if (!z || z.type !== "color") return null
          return (
            <div key={id} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{ZONE_LABEL[id]}</span>
                <span className="text-muted-foreground text-[11px] font-mono uppercase">
                  {String(z.color)}
                </span>
              </div>
              <ColorPicker
                value={z.color}
                onChange={(c) => setZoneColor(id, c)}
                ariaLabel={`Color ${ZONE_LABEL[id]}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
