"use client"

// Viewer 2D del diseñador.
//
// En lugar del antiguo render Three.js, este viewer muestra el atlas
// 2048×2048 producido por `TextureCompositor` recortado a las dos caras
// principales (frente / espalda). Cuando el kit incluye short o medias,
// esos recortes aparecen debajo como filas adicionales.
//
// El atlas completo (mismo `HTMLCanvasElement` que devuelve `compose`) se
// expone al cliente vía `getAtlasCanvas()` para que `SaveDesignModal`
// pueda descargar el PNG completo.

import { forwardRef, useImperativeHandle, useMemo } from "react"
import { TextureCompositor } from "@/components/designer/TextureCompositor"
import { CANVAS_SIZE, ZONE_REGIONS, computeActiveZones } from "@/lib/designer/zones"
import type { ZoneRegion } from "@/lib/designer/zones"
import type { DesignState } from "@/lib/designer/types"
import { useLoadedLogos } from "@/lib/designer/use-loaded-logos"
import { SinglePreview } from "@/components/designer/viewer-2d/SinglePreview"
import { TwoUpPreview } from "@/components/designer/viewer-2d/TwoUpPreview"

export interface Viewer2DHandle {
  /** Devuelve el canvas atlas completo (para `SaveDesignModal`). */
  getAtlasCanvas(): HTMLCanvasElement | null
}

interface Viewer2DProps {
  state: DesignState
}

export const Viewer2D = forwardRef<Viewer2DHandle, Viewer2DProps>(function Viewer2D(
  { state },
  ref,
) {
  // Logos precargados (mismo cache que antes vivía en ShirtModel).
  const logos = useLoadedLogos(state)

  // Atlas 2048×2048. Recomputa sólo cuando cambia el state o el set de logos.
  const atlas = useMemo(
    () => TextureCompositor.compose(state, logos, { width: CANVAS_SIZE, height: CANVAS_SIZE }),
    [state, logos],
  )

  useImperativeHandle(ref, () => ({
    getAtlasCanvas: () => atlas,
  }))

  const activeZones = computeActiveZones(state.kit)

  // Tipo local para que TS no se queje al pasar regiones a `SinglePreview`.
  const frontRegion: ZoneRegion = ZONE_REGIONS.front
  const backRegion: ZoneRegion = ZONE_REGIONS.back

  return (
    <div className="space-y-3">
      {/* Caras principales: siempre frente y espalda. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SinglePreview
          atlas={atlas}
          region={frontRegion}
          label="Frente"
          className="aspect-[1/0.875] w-full"
        />
        <SinglePreview
          atlas={atlas}
          region={backRegion}
          label="Espalda"
          className="aspect-[1/0.875] w-full"
        />
      </div>

      {/* Mangas / cuello — sólo si el kit activo las incluye. */}
      {(activeZones.includes("sleeve_l") || activeZones.includes("sleeve_r")) ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {activeZones.includes("sleeve_l") ? (
            <SinglePreview
              atlas={atlas}
              region={ZONE_REGIONS.sleeve_l}
              label="Manga izquierda"
              className="aspect-square w-full"
            />
          ) : null}
          {activeZones.includes("sleeve_r") ? (
            <SinglePreview
              atlas={atlas}
              region={ZONE_REGIONS.sleeve_r}
              label="Manga derecha"
              className="aspect-square w-full"
            />
          ) : null}
        </div>
      ) : null}

      {/* Short y medias cuando el kit lo incluye. */}
      {activeZones.includes("short") || activeZones.includes("socks") ? (
        <TwoUpPreview atlas={atlas} activeZones={activeZones} />
      ) : null}
    </div>
  )
})