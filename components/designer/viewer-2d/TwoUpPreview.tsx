"use client"

// TwoUpPreview: muestra short y medias (frente + atrás) cuando el kit
// activo lo requiere. Se usa dentro del `<details>` plegable del viewer
// principal para no saturar la vista default.

import type { ZoneId } from "@/lib/designer/types"
import { ZONE_REGIONS } from "@/lib/designer/zones"
import { SinglePreview } from "@/components/designer/viewer-2d/SinglePreview"

interface TwoUpPreviewProps {
  atlas: HTMLCanvasElement
  activeZones: ZoneId[]
}

export function TwoUpPreview({ atlas, activeZones }: TwoUpPreviewProps) {
  const hasShortFront = activeZones.includes("short")
  const hasShortBack = activeZones.includes("short_back")
  const hasSocksFront = activeZones.includes("socks")
  const hasSocksBack = activeZones.includes("socks_back")

  return (
    <div className="grid gap-3">
      {hasShortFront || hasShortBack ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {hasShortFront ? (
            <SinglePreview
              atlas={atlas}
              region={ZONE_REGIONS.short}
              label="Short (frente)"
              className="aspect-[2/1] w-full"
            />
          ) : null}
          {hasShortBack ? (
            <SinglePreview
              atlas={atlas}
              region={ZONE_REGIONS.short_back}
              label="Short (atrás)"
              className="aspect-[2/1] w-full"
            />
          ) : null}
        </div>
      ) : null}
      {hasSocksFront || hasSocksBack ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {hasSocksFront ? (
            <SinglePreview
              atlas={atlas}
              region={ZONE_REGIONS.socks}
              label="Medias (frente)"
              className="aspect-[6/1] w-full"
            />
          ) : null}
          {hasSocksBack ? (
            <SinglePreview
              atlas={atlas}
              region={ZONE_REGIONS.socks_back}
              label="Medias (atrás)"
              className="aspect-[6/1] w-full"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}