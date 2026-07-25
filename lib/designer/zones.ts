// Regiones UV dentro del atlas 2048×2048 usado por el `TextureCompositor`.
// Cada zona del kit mapea a un rectángulo del atlas; el modelo 3D
// (ShirtModel o PlaceholderModel) muestrea esa región en su `material.map`.
//
// Layout del atlas:
//   - Mitad izquierda (0..1024) = frente
//   - Mitad derecha  (1024..2048) = espalda
//   - Mangas y cuellos van arriba, body en el centro,
//     short/medias abajo.
//
// Estos valores son razonables para una camiseta estándar. Si la plantilla
// tiene GLB real con UVs custom, el PlaceholderModel escala el rectángulo
// de cada zona sobre su cilindro de fallback.

export interface ZoneRegion {
  x: number
  y: number
  w: number
  h: number
}

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
  | "socks"

export const ZONE_REGIONS: Record<ZoneId, ZoneRegion> = {
  // Frente
  front: { x: 0, y: 384, w: 1024, h: 896 },
  back: { x: 1024, y: 384, w: 1024, h: 896 },
  // Cuello/solapa arriba al medio
  neck: { x: 768, y: 0, w: 512, h: 192 },
  collar: { x: 768, y: 192, w: 512, h: 192 },
  // Mangas (cilindro): regiones angostas a izquierda/derecha del frente
  sleeve_l: { x: 0, y: 0, w: 384, h: 384 },
  sleeve_r: { x: 1648, y: 0, w: 384, h: 384 },
  // Puños: tira fina bajo cada manga
  cuff_l: { x: 0, y: 1280, w: 384, h: 96 },
  cuff_r: { x: 1648, y: 1280, w: 384, h: 96 },
  // Short: debajo del body, ancho completo
  short: { x: 0, y: 1376, w: 2048, h: 512 },
  // Medias: dos rectángulos angostos en la parte más baja
  socks: { x: 0, y: 1888, w: 2048, h: 160 },
}

export const CANVAS_SIZE = 2048

// Lista canónica de zonas presentes en una camiseta típica.
export const ALL_ZONES: ReadonlyArray<ZoneId> = [
  "front",
  "back",
  "neck",
  "collar",
  "sleeve_l",
  "sleeve_r",
  "cuff_l",
  "cuff_r",
  "short",
  "socks",
]

// Devuelve las zonas visibles según el kit seleccionado.
// `shirt` muestra sólo la parte superior; `shirt_short` suma short; `full`
// incluye medias también.
export function computeActiveZones(kit: "shirt" | "shirt_short" | "full"): ZoneId[] {
  const base: ZoneId[] = [
    "front",
    "back",
    "neck",
    "collar",
    "sleeve_l",
    "sleeve_r",
    "cuff_l",
    "cuff_r",
  ]
  if (kit === "shirt") return base
  if (kit === "shirt_short") return [...base, "short"]
  return [...base, "short", "socks"]
}
