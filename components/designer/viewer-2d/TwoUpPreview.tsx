"use client"

// TwoUpPreview: muestra short y medias cuando el kit activo lo requiere.
// El short es un rectángulo ancho (2048×512); las medias un strip aún más
// fino (2048×160). Ambos comparten el ancho del atlas y se renderizan
// lado a lado o apilados según el viewport.

import type { ZoneId } from "@/lib/designer/types"
import { ZONE_REGIONS } from "@/lib/designer/zones"
import { SinglePreview } from "@/components/designer/viewer-2d/SinglePreview"

interface TwoUpPreviewProps {
  atlas: HTMLCanvasElement
  activeZones: ZoneId[]
}

export function TwoUpPreview({ atlas, activeZones }: TwoUpPreviewProps) {
  return (
    <div className="grid gap-3">
      {activeZones.includes("short") ? (
        <SinglePreview
          atlas={atlas}
          region={ZONE_REGIONS.short}
          label="Short"
          className="aspect-[4/1] w-full"
        />
      ) : null}
      {activeZones.includes("socks") ? (
        <SinglePreview
          atlas={atlas}
          region={ZONE_REGIONS.socks}
          label="Medias"
          className="aspect-[12/1] w-full"
        />
      ) : null}
    </div>
  )
}