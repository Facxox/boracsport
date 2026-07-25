// Serializa / deserializa un `DesignState` a un string compacto apto para URL.
// Usa lz-string con `compressToEncodedURIComponent` (URL-safe).
//
// Codificación:
//   v    = version (siempre 1)
//   t    = templateId
//   m    = mold
//   k    = kit
//   p    = pattern { i, c1, c2, s }
//   z    = array [ZoneId, ZoneConfigCompact][]
//   ca   = createdAt
//   ua   = updatedAt
//
// Las imágenes NO se serializan (no son portables vía URL). Si una zona
// tiene `dataUrl`, se descarta al deserializar (la zona queda como `color`).

import type {
  DesignState,
  SerializedDesign,
  ZoneConfig,
  ZoneId,
} from "@/lib/designer/types"
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "@/lib/utils/lz"
import { createDefaultDesign } from "@/lib/designer/default-design"

const PROTOCOL_VERSION = 1

type ZoneConfigCompact = unknown[]
type ColorType = Extract<ZoneConfig, { type: "color" }>["color"]
type PatternIdFromConfig = Extract<ZoneConfig, { type: "pattern" }>["patternId"]

function encodeZone(z: ZoneConfig): ZoneConfigCompact {
  switch (z.type) {
    case "color":
      return ["c", z.color]
    case "text":
      return ["t", z.text, z.color, z.fontId, z.size, z.bold, z.strokeColor, z.strokeWidth]
    case "number":
      return ["n", z.value, z.color, z.fontId, z.size, z.bold, z.strokeColor, z.strokeWidth]
    case "logo":
      // dataUrl se descarta en serialización (ver doc del archivo).
      return ["l", null, z.scale, z.offsetX, z.offsetY]
    case "sponsor":
      return ["s", z.text, z.color, z.fontId, z.size, z.bold]
    case "pattern": {
      const p = z
      return ["p", p.patternId, p.color1, p.color2, p.scale]
    }
  }
}

function decodeZone(id: ZoneId, arr: unknown[]): ZoneConfig | null {
  const t = arr[0]
  switch (t) {
    case "c":
      return { id, type: "color", color: String(arr[1] ?? "#0f172a") as ColorType }
    case "t":
      return {
        id,
        type: "text",
        text: String(arr[1] ?? ""),
        color: String(arr[2] ?? "#fff") as ColorType,
        fontId: String(arr[3] ?? "syne"),
        size: Number(arr[4] ?? 220),
        bold: Boolean(arr[5]),
        strokeColor: String(arr[6] ?? "#000") as ColorType,
        strokeWidth: Number(arr[7] ?? 0),
      }
    case "n":
      return {
        id,
        type: "number",
        value: String(arr[1] ?? "10"),
        color: String(arr[2] ?? "#fff") as ColorType,
        fontId: String(arr[3] ?? "bebas"),
        size: Number(arr[4] ?? 520),
        bold: Boolean(arr[5]),
        strokeColor: String(arr[6] ?? "#000") as ColorType,
        strokeWidth: Number(arr[7] ?? 8),
      }
    case "l":
      return {
        id,
        type: "logo",
        dataUrl: null,
        scale: Number(arr[2] ?? 0.4),
        offsetX: Number(arr[3] ?? 0),
        offsetY: Number(arr[4] ?? 0),
      }
    case "s":
      return {
        id,
        type: "sponsor",
        text: String(arr[1] ?? ""),
        color: String(arr[2] ?? "#fff") as ColorType,
        fontId: String(arr[3] ?? "syne"),
        size: Number(arr[4] ?? 220),
        bold: Boolean(arr[5]),
      }
    case "p":
      return {
        id,
        type: "pattern",
        patternId: (arr[1] ?? "solid") as PatternIdFromConfig,
        color1: String(arr[2] ?? "#0f172a") as ColorType,
        color2: String(arr[3] ?? "#dc2626") as ColorType,
        scale: Number(arr[4] ?? 1),
      }
    default:
      return null
  }
}

export function serialize(state: DesignState): string {
  const payload: SerializedDesign = {
    v: PROTOCOL_VERSION,
    t: state.templateId,
    m: state.mold,
    k: state.kit,
    z: Object.entries(state.zones).map(([id, z]) => [id as ZoneId, encodeZone(z)]),
    p: { i: state.pattern.id, c1: state.pattern.color1, c2: state.pattern.color2, s: state.pattern.scale },
    ca: state.createdAt,
    ua: state.updatedAt,
  }
  return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function deserialize(s: string): DesignState | null {
  const raw = decompressFromEncodedURIComponent(s)
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== "object") return null
  const obj = parsed as Partial<SerializedDesign>
  if (obj.v !== PROTOCOL_VERSION) return null

  // Reconstruir base con defaults, luego pisar cada zona decodificada.
  const base = createDefaultDesign(obj.t ?? null, obj.m ?? "round_classic", obj.k ?? "shirt")
  if (Array.isArray(obj.z)) {
    for (const entry of obj.z) {
      if (!Array.isArray(entry) || entry.length < 2) continue
      const id = entry[0] as ZoneId
      const arr = entry[1]
      if (!Array.isArray(arr)) continue
      const z = decodeZone(id, arr)
      if (z) base.zones[id] = z
    }
  }
  if (obj.p && typeof obj.p === "object") {
    base.pattern = {
      id: obj.p.i ?? "solid",
      color1: obj.p.c1 ?? base.pattern.color1,
      color2: obj.p.c2 ?? base.pattern.color2,
      scale: obj.p.s ?? 1,
    }
  }
  if (typeof obj.ca === "string") base.createdAt = obj.ca
  if (typeof obj.ua === "string") base.updatedAt = obj.ua
  base.templateId = obj.t ?? base.templateId
  return base
}
