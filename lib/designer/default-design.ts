// Defaults explícitos del estado del diseñador.
// Esta es la FUENTE DE VERDAD — el store NUNCA debe depender del JSONB
// legacy `editable_zones` / `default_config` de la plantilla. Las plantillas
// proveen los mockups de fondo; el configurador provee el comportamiento
// por defecto de cada zona.

import type { DesignState, MoldId, KitId, PatternId, RgbColor, ZoneConfig, ZoneId } from "@/lib/designer/types"
import { ALL_ZONES } from "@/lib/designer/zones"

function nowIso(): string {
  return new Date().toISOString()
}

function defaultZone(id: ZoneId): ZoneConfig {
  return { id, type: "color", color: "#0f172a" as RgbColor }
}

function textZone(id: ZoneId, text: string): ZoneConfig {
  return {
    id,
    type: "text",
    text,
    color: "#f4f4f5" as RgbColor,
    fontId: "syne",
    size: 220,
    bold: true,
    strokeColor: "#000000" as RgbColor,
    strokeWidth: 0,
  }
}

function numberZone(id: ZoneId, value: string): ZoneConfig {
  return {
    id,
    type: "number",
    value,
    color: "#f4f4f5" as RgbColor,
    fontId: "bebas",
    size: 520,
    bold: true,
    strokeColor: "#000000" as RgbColor,
    strokeWidth: 8,
  }
}

function logoZone(id: ZoneId): ZoneConfig {
  return { id, type: "logo", dataUrl: null, scale: 0.4, offsetX: 0, offsetY: 0 }
}

function patternZone(id: ZoneId, patternId: PatternId): ZoneConfig {
  return {
    id,
    type: "pattern",
    patternId,
    color1: "#0f172a" as RgbColor,
    color2: "#dc2626" as RgbColor,
    scale: 1,
  }
}

export function createDefaultDesign(
  templateId: string | null,
  mold: MoldId = "round_classic",
  kit: KitId = "shirt",
): DesignState {
  const zones: Record<ZoneId, ZoneConfig> = {} as Record<ZoneId, ZoneConfig>
  for (const z of ALL_ZONES) {
    const id = z as ZoneId
    zones[id] = defaultZone(id)
  }
  // Defaults visuales: dorsal "10" + nombre de equipo en espalda,
  // escudo en frente, patrón en sleeves.
  zones.back = numberZone("back", "10")
  zones.front = logoZone("front")
  zones.sleeve_l = patternZone("sleeve_l", "hoops")
  zones.sleeve_r = patternZone("sleeve_r", "hoops")

  return {
    version: 1,
    templateId,
    mold,
    kit,
    zones,
    pattern: { id: "solid", color1: "#0f172a" as RgbColor, color2: "#dc2626" as RgbColor, scale: 1 },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}
