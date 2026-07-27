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

  const hasSleeves =
    activeZones.includes("sleeve_l") || activeZones.includes("sleeve_r")
  const hasShort = activeZones.includes("short") || activeZones.includes("short_back")
  const hasSocks = activeZones.includes("socks") || activeZones.includes("socks_back")
  const extraCount =
    (hasSleeves ? 2 : 0) + (hasShort ? 2 : 0) + (hasSocks ? 2 : 0)

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

      {/* Resto: plegable para no saturar el preview principal. */}
      {extraCount > 0 ? (
        <details className="border-foreground/10 group rounded-lg border">
          <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-medium tracking-wider uppercase">
            <span>Más vistas</span>
            <span className="text-[10px] font-normal">
              {extraCount} zona{extraCount === 1 ? "" : "s"}
            </span>
          </summary>
          <div className="space-y-3 border-t p-3">
            {/* Mangas izq/der cuando el kit las incluye. */}
            {hasSleeves ? (
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

            {/* Short y medias (frente + atrás) cuando el kit los incluye. */}
            {hasShort || hasSocks ? (
              <TwoUpPreview atlas={atlas} activeZones={activeZones} />
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  )
})