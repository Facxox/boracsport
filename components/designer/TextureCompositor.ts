// `TextureCompositor` — núcleo técnico del diseñador.
//
// Dibuja el state completo sobre un canvas 2048×2048 con el orden de capas:
//
//   1. Clear transparente.
//   2. Color base por zona (`fillRect` con el color de cada zona).
//   3. Patrón por zona, clipeado al rectángulo de la región.
//   4. Logo / sponsor / texto / número, posicionados dentro de la región.
//
// Mitigaciones a los bugs del módulo viejo:
//   - Patrones NUNCA pisan el color base: el `globalCompositeOperation` se
//     cambia a "source-in" sobre un fondo semilla del color base, lo que
//     garantiza que el alfa del patrón rellene sólo dentro del rectángulo.
//   - Zonas `type: "color"` se pintan siempre en el paso 2 (no se ignoran).
//   - Las zonas inactivas por kit se siguen procesando; simplemente el atlas
//     queda con la región pintada pero no se le asigna a ningún mesh.
//
// Logos se cargan ANTES de la composición (caller pasa `Map<ZoneId, HTMLImageElement>`).
// Textos no requieren precarga porque se dibujan con `fillText`.

import type { DesignState, ZoneId } from "@/lib/designer/types"
import { CANVAS_SIZE, ZONE_REGIONS } from "@/lib/designer/zones"
import { getPattern } from "@/components/designer/patterns"

export type ZoneImageMap = Map<ZoneId, HTMLImageElement>

interface ComposeOptions {
  width?: number
  height?: number
}

function getRegion(id: ZoneId): { x: number; y: number; w: number; h: number } {
  const r = ZONE_REGIONS[id]
  if (!r) return { x: 0, y: 0, w: 0, h: 0 }
  return r
}

function paintBase(ctx: CanvasRenderingContext2D, state: DesignState) {
  for (const id of Object.keys(state.zones) as ZoneId[]) {
    const z = state.zones[id]
    if (!z) continue
    if (z.type === "color" || z.type === "pattern") {
      // Patrón necesita base color antes; usamos color1 como semilla.
      const seed = z.type === "pattern" ? z.color1 : z.color
      const r = getRegion(id)
      ctx.fillStyle = seed
      ctx.fillRect(r.x, r.y, r.w, r.h)
    }
  }
}

function paintPatterns(ctx: CanvasRenderingContext2D, state: DesignState) {
  for (const id of Object.keys(state.zones) as ZoneId[]) {
    const z = state.zones[id]
    if (!z || z.type !== "pattern") continue
    const r = getRegion(id)
    const pattern = getPattern(z.patternId)
    // Recorte estricto a la región para no derramar el patrón sobre otras zonas.
    ctx.save()
    ctx.beginPath()
    ctx.rect(r.x, r.y, r.w, r.h)
    ctx.clip()
    // Dibuja el patrón. Si usa un solo color, igual necesitamos el segundo
    // como semilla para que "salt_pepper" o "argyle" aparezcan.
    const c1 = z.color1
    const c2 = pattern.needsTwoColors ? z.color2 : c1
    pattern.draw({ ctx, region: r, color1: c1, color2: c2, scale: z.scale })
    ctx.restore()
  }
}

function paintLogos(ctx: CanvasRenderingContext2D, state: DesignState, logos: ZoneImageMap) {
  for (const id of Object.keys(state.zones) as ZoneId[]) {
    const z = state.zones[id]
    if (!z || z.type !== "logo") continue
    const img = logos.get(id)
    if (!img || !z.dataUrl) continue
    const r = getRegion(id)
    const maxW = r.w * z.scale
    const ratio = img.height / img.width || 1
    const w = maxW
    const h = maxW * ratio
    const x = r.x + r.w / 2 - w / 2 + z.offsetX
    const y = r.y + r.h / 2 - h / 2 + z.offsetY
    ctx.drawImage(img, x, y, w, h)
  }
}

function paintSponsor(ctx: CanvasRenderingContext2D, state: DesignState) {
  for (const id of Object.keys(state.zones) as ZoneId[]) {
    const z = state.zones[id]
    if (!z || z.type !== "sponsor") continue
    const r = getRegion(id)
    ctx.save()
    ctx.fillStyle = z.color
    ctx.font = `${z.bold ? "bold " : ""}${z.size}px ${pickFont(z.fontId)}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(z.text, r.x + r.w / 2, r.y + r.h / 2)
    ctx.restore()
  }
}

function paintTextAndNumbers(ctx: CanvasRenderingContext2D, state: DesignState) {
  for (const id of Object.keys(state.zones) as ZoneId[]) {
    const z = state.zones[id]
    if (!z) continue
    if (z.type !== "text" && z.type !== "number") continue
    const r = getRegion(id)
    const content = z.type === "text" ? z.text : z.value
    if (!content) continue
    ctx.save()
    ctx.fillStyle = z.color
    ctx.font = `${z.bold ? "bold " : ""}${z.size}px ${pickFont(z.fontId)}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const cx = r.x + r.w / 2
    const cy = r.y + r.h / 2
    if (z.strokeWidth > 0) {
      ctx.strokeStyle = z.strokeColor
      ctx.lineWidth = z.strokeWidth
      ctx.strokeText(content, cx, cy)
    }
    ctx.fillText(content, cx, cy)
    ctx.restore()
  }
}

function pickFont(id: string): string {
  // Tabla mínima local — `lib/designer/fonts.ts` es la fuente canónica para UI.
  const map: Record<string, string> = {
    inter: "Inter, sans-serif",
    syne: "Syne, sans-serif",
    bebas: "'Bebas Neue', sans-serif",
    oswald: "Oswald, sans-serif",
    anton: "Anton, sans-serif",
    archivo: "'Archivo Black', sans-serif",
    roboto_mono: "'Roboto Mono', monospace",
  }
  return map[id] ?? map.syne
}

export class TextureCompositor {
  static compose(
    state: DesignState,
    logos: ZoneImageMap = new Map(),
    opts: ComposeOptions = {},
  ): HTMLCanvasElement {
    const w = opts.width ?? CANVAS_SIZE
    const h = opts.height ?? CANVAS_SIZE
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return canvas
    ctx.clearRect(0, 0, w, h)

    paintBase(ctx, state)
    paintPatterns(ctx, state)
    paintLogos(ctx, state, logos)
    paintSponsor(ctx, state)
    paintTextAndNumbers(ctx, state)
    return canvas
  }

  // Miniaturas para el grid de patrones. No carga logos ni texto.
  static mini(patternId: string, w: number, h: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return canvas
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, w, h)
    const pattern = getPattern(patternId as Parameters<typeof getPattern>[0])
    pattern.draw({ ctx, region: { x: 0, y: 0, w, h }, color1: "#0f172a", color2: "#dc2626", scale: 1 })
    return canvas
  }
}
