"use client"

// TwoUpPreview: muestra short y medias (frente + atrás) cuando el kit
// activo lo requiere. Se usa dentro del `<details>` plegable del viewer
// principal para no saturar la vista default. Cada recorte puede llevar
// un mockup de fondo subido por el admin.

import type { ZoneId } from "@/lib/designer/types"
import { ZONE_REGIONS } from "@/lib/designer/zones"
import { SinglePreview } from "@/components/designer/viewer-2d/SinglePreview"

interface TwoUpPreviewProps {
  atlas: HTMLCanvasElement
  activeZones: ZoneId[]
  backgrounds?: Partial<Record<ZoneId, string | null>>
}

export function TwoUpPreview({ atlas, activeZones, backgrounds }: TwoUpPreviewProps) {
  const hasShortFront = activeZones.includes("short")
  const hasShortBack = activeZones.includes("short_back")
  const hasSocksFront = activeZones.includes("socks")
  const hasSocksBack = activeZones.includes("socks_back")

  const bg = backgrounds ?? {}

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
              backgroundUrl={bg.short ?? null}
            />
          ) : null}
          {hasShortBack ? (
            <SinglePreview
              atlas={atlas}
              region={ZONE_REGIONS.short_back}
              label="Short (atrás)"
              className="aspect-[2/1] w-full"
              backgroundUrl={bg.short_back ?? null}
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
              backgroundUrl={bg.socks ?? null}
            />
          ) : null}
          {hasSocksBack ? (
            <SinglePreview
              atlas={atlas}
              region={ZONE_REGIONS.socks_back}
              label="Medias (atrás)"
              className="aspect-[6/1] w-full"
              backgroundUrl={bg.socks_back ?? null}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}