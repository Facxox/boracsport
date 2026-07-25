"use client"

// Modelo placeholder procedural. Se usa cuando la plantilla activa no tiene
// `model_url` (GLB) o cuando falla la carga. No pretende ser realista: es
// un cilindro para el torso, dos cilindros para mangas, un cono truncado
// para el cuello, un cono truncado para el short y dos conos finos para
// medias. Cada parte tiene un color sólido derivado de la zona `color`.
//
// Cuando la zona es `text`, `number`, `logo`, `sponsor` o `pattern` se usa
// la `color1` como semilla; la textura detallada la aporta el módulo
// `ShirtModel` cuando hay GLB real.

import { useMemo } from "react"
import * as THREE from "three"
import type { DesignState, ZoneId, RgbColor } from "@/lib/designer/types"
import { computeActiveZones } from "@/lib/designer/zones"

function solid(id: ZoneId, state: DesignState, fallback: RgbColor): string {
  const z = state.zones[id]
  if (!z) return fallback
  switch (z.type) {
    case "color":
      return z.color as string
    case "pattern":
      return z.color1 as string
    case "text":
    case "number":
      return z.color as string
    case "sponsor":
      return z.color as string
    case "logo":
      // Si no hay logo, caemos al fallback. Si lo hay, el color del atlas 2D
      // lo aporta el Compositor; acá sólo necesitamos un color "neutro".
      return fallback
  }
}

interface PlaceholderModelProps {
  state: DesignState
}

export function PlaceholderModel({ state }: PlaceholderModelProps) {
  const active = useMemo(() => computeActiveZones(state.kit), [state.kit])

  const colors = useMemo(() => {
    const map: Partial<Record<ZoneId, string>> = {}
    const list: Array<[ZoneId, RgbColor]> = [
      ["front", "#0f172a"],
      ["back", "#0f172a"],
      ["neck", "#f4f4f5"],
      ["collar", "#dc2626"],
      ["sleeve_l", "#0f172a"],
      ["sleeve_r", "#0f172a"],
      ["cuff_l", "#dc2626"],
      ["cuff_r", "#dc2626"],
      ["short", "#0f172a"],
      ["socks", "#f4f4f5"],
    ]
    for (const [k, fb] of list) map[k] = solid(k, state, fb)
    return map
  }, [state])

  return (
    <group position={[0, 1.2, 0]}>
      {/* Torso (cilindro). */}
      {active.includes("front") || active.includes("back") ? (
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 1.4, 48]} />
          <meshStandardMaterial color={colors.front ?? "#0f172a"} />
        </mesh>
      ) : null}

      {/* Mangas (cilindros finos horizontales). */}
      {active.includes("sleeve_l") ? (
        <mesh castShadow receiveShadow position={[-0.9, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.7, 24]} />
          <meshStandardMaterial color={colors.sleeve_l ?? "#0f172a"} />
        </mesh>
      ) : null}
      {active.includes("sleeve_r") ? (
        <mesh castShadow receiveShadow position={[0.9, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.7, 24]} />
          <meshStandardMaterial color={colors.sleeve_r ?? "#0f172a"} />
        </mesh>
      ) : null}

      {/* Cuello / solapa. */}
      {active.includes("neck") || active.includes("collar") ? (
        <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.18, 32]} />
          <meshStandardMaterial color={colors.collar ?? "#dc2626"} />
        </mesh>
      ) : null}

      {/* Short. */}
      {active.includes("short") ? (
        <mesh castShadow receiveShadow position={[0, -1.0, 0]}>
          <cylinderGeometry args={[0.55, 0.45, 0.6, 32]} />
          <meshStandardMaterial color={colors.short ?? "#0f172a"} />
        </mesh>
      ) : null}

      {/* Medias (dos conos finos). */}
      {active.includes("socks") ? (
        <>
          <mesh castShadow receiveShadow position={[-0.22, -2.0, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.9, 16]} />
            <meshStandardMaterial color={colors.socks ?? "#f4f4f5"} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.22, -2.0, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.9, 16]} />
            <meshStandardMaterial color={colors.socks ?? "#f4f4f5"} />
          </mesh>
        </>
      ) : null}
    </group>
  )
}
