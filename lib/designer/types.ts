// Tipos del módulo diseñador.
// No confundir con DesignRow (Supabase row del bucket designs):
// - `DesignState` es el estado en memoria/localStorage/URL.
// - La columna `payload` en `designs` guarda un JSONB con este mismo shape
//   (vía `serialize` en lib/utils/url-serializer.ts).

export type ZoneId =
  | "front"
  | "back"
  | "neck"
  | "collar"
  | "sleeve_l"
  | "sleeve_r"
  | "cuff_l"
  | "cuff_r"
  | "short"
  | "short_back"
  | "socks"
  | "socks_back"

export type MoldId = "round_classic" | "v_classic" | "round_raglan" | "v_raglan"
export type KitId = "shirt" | "shirt_short" | "full"

// Hex color "#rrggbb" o "#rgb". El Compositor tolera cualquier string que CSS
// entienda (incluye "transparent"), pero las zonas se inicializan con hex.
export type RgbColor = `#${string}` | (string & {})

export type PatternId =
  | "solid"
  | "hoops"
  | "bastones_v"
  | "bastones_h"
  | "chevron"
  | "sash"
  | "half"
  | "quarters"
  | "check"
  | "salt_pepper"
  | "argyle"
  | "gradient"

export type ZoneType = "color" | "text" | "number" | "logo" | "sponsor" | "pattern"

// Cada zona tiene un `type` discriminante y campos asociados a ese tipo.
// Mantener esto explícito (en vez de `any`) permite que el Compositor y el
// store tipen correctamente cada setter.
export type ZoneConfig =
  | { id: ZoneId; type: "color"; color: RgbColor }
  | {
      id: ZoneId
      type: "text"
      text: string
      color: RgbColor
      fontId: string
      size: number
      bold: boolean
      strokeColor: RgbColor
      strokeWidth: number
    }
  | {
      id: ZoneId
      type: "number"
      value: string
      color: RgbColor
      fontId: string
      size: number
      bold: boolean
      strokeColor: RgbColor
      strokeWidth: number
    }
  | {
      id: ZoneId
      type: "logo"
      dataUrl: string | null
      scale: number
      offsetX: number
      offsetY: number
    }
  | {
      id: ZoneId
      type: "sponsor"
      text: string
      color: RgbColor
      fontId: string
      size: number
      bold: boolean
    }
  | {
      id: ZoneId
      type: "pattern"
      patternId: PatternId
      color1: RgbColor
      color2: RgbColor
      scale: number
    }

export interface DesignState {
  version: 1
  templateId: string | null
  mold: MoldId
  kit: KitId
  zones: Record<ZoneId, ZoneConfig>
  pattern: { id: PatternId; color1: RgbColor; color2: RgbColor; scale: number }
  createdAt: string
  updatedAt: string
}

// Payload compacto serializado en URL.
// Imágenes NO viajan en el link (no son portables). El campo `p` (pattern)
// es global al kit; las zonas pueden sobrescribirlo con `type: "pattern"`.
export interface SerializedDesign {
  v: 1
  t: string | null
  m: MoldId
  k: KitId
  z: Array<[ZoneId, unknown[]]>
  p: { i: PatternId; c1: RgbColor; c2: RgbColor; s: number }
  ca: string
  ua: string
}
