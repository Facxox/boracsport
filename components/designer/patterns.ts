// Catálogo de patrones procedurales (12).
// Todos se dibujan sobre el `CanvasRenderingContext2D` recortado a la región
// de cada zona. Las funciones reciben el `region` exacto para que el patrón
// escale con el tamaño del rectángulo (no asume píxeles fijos).
//
// ATENCIÓN: el alpha del patrón SIEMPRE se compone sobre el color base de
// la zona (lo hace el TextureCompositor con `globalCompositeOperation`).
// Si el patrón "pisa" el color, es bug del compositor, no del patrón.

import type { PatternId } from "@/lib/designer/types"

export interface PatternDrawArgs {
  ctx: CanvasRenderingContext2D
  region: { x: number; y: number; w: number; h: number }
  color1: string
  color2: string
  scale: number
}

export type PatternDrawer = (args: PatternDrawArgs) => void

export interface PatternDescriptor {
  id: PatternId
  label: string
  needsTwoColors: boolean
  continuous: boolean
  category: "base" | "bandas" | "geometrico"
  draw: PatternDrawer
}

function fillRegion({ ctx, region, color1 }: PatternDrawArgs) {
  ctx.fillStyle = color1
  ctx.fillRect(region.x, region.y, region.w, region.h)
}

function drawHStripes({ ctx, region, color2, scale }: PatternDrawArgs) {
  const band = Math.max(8, 20 * scale)
  let i = 0
  for (let y = region.y; y < region.y + region.h; y += band) {
    ctx.fillStyle = i % 2 === 0 ? color2 : "transparent"
    ctx.fillRect(region.x, y, region.w, band)
    i++
  }
}

function drawVStripes({ ctx, region, color2, scale }: PatternDrawArgs) {
  const band = Math.max(8, 30 * scale)
  let i = 0
  for (let x = region.x; x < region.x + region.w; x += band) {
    ctx.fillStyle = i % 2 === 0 ? color2 : "transparent"
    ctx.fillRect(x, region.y, band, region.h)
    i++
  }
}

function drawChevron({ ctx, region, color2, scale }: PatternDrawArgs) {
  const step = Math.max(20, 60 * scale)
  const offset = step / 2
  ctx.fillStyle = color2
  ctx.beginPath()
  // Una sola V centrada; el resto del área queda en color1.
  ctx.moveTo(region.x, region.y + region.h / 2)
  ctx.lineTo(region.x + region.w / 2, region.y + region.h / 2 + offset)
  ctx.lineTo(region.x + region.w, region.y + region.h / 2)
  ctx.lineTo(region.x + region.w, region.y + region.h / 2 - offset)
  ctx.lineTo(region.x + region.w / 2, region.y + region.h / 2)
  ctx.closePath()
  ctx.fill()
}

function drawSash({ ctx, region, color2 }: PatternDrawArgs) {
  ctx.save()
  ctx.fillStyle = color2
  ctx.beginPath()
  const stripe = Math.max(40, region.w * 0.18)
  ctx.moveTo(region.x, region.y + region.h)
  ctx.lineTo(region.x + stripe, region.y)
  ctx.lineTo(region.x + region.w, region.y)
  ctx.lineTo(region.x + region.w - stripe, region.y + region.h)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawHalf({ ctx, region, color2 }: PatternDrawArgs) {
  ctx.fillStyle = color2
  ctx.fillRect(region.x + region.w / 2, region.y, region.w / 2, region.h)
}

function drawQuarters({ ctx, region, color2 }: PatternDrawArgs) {
  ctx.fillStyle = color2
  const qw = region.w / 2
  const qh = region.h / 2
  // Esquina sup-der e inf-izq (clásico de cuatro cuartos).
  ctx.fillRect(region.x + qw, region.y, qw, qh)
  ctx.fillRect(region.x, region.y + qh, qw, qh)
}

function drawCheck({ ctx, region, color2, scale }: PatternDrawArgs) {
  const cell = Math.max(12, 40 * scale)
  let row = 0
  for (let y = region.y; y < region.y + region.h; y += cell) {
    let col = 0
    for (let x = region.x; x < region.x + region.w; x += cell) {
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = color2
        ctx.fillRect(x, y, cell, cell)
      }
      col++
    }
    row++
  }
}

function drawSaltPepper({ ctx, region, color2, scale }: PatternDrawArgs) {
  const radius = Math.max(3, 6 * scale)
  const step = Math.max(12, 28 * scale)
  ctx.fillStyle = color2
  for (let y = region.y + step / 2; y < region.y + region.h; y += step) {
    for (let x = region.x + (Math.floor((y - region.y) / step) % 2 === 0 ? 0 : step / 2); x < region.x + region.w; x += step) {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawArgyle({ ctx, region, color2, scale }: PatternDrawArgs) {
  const step = Math.max(20, 60 * scale)
  ctx.fillStyle = color2
  ctx.strokeStyle = color2
  ctx.lineWidth = Math.max(1, 3 * scale)
  for (let y = region.y - step; y < region.y + region.h + step; y += step) {
    for (let x = region.x - step; x < region.x + region.w + step; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + step, y + step)
      ctx.lineTo(x, y + step * 2)
      ctx.lineTo(x - step, y + step)
      ctx.closePath()
      ctx.fill()
    }
  }
}

function drawGradient({ ctx, region, color1, color2 }: PatternDrawArgs) {
  // El "alpha" no aplica al gradiente; rellena el rect con el gradiente
  // mismo (lo enmascara el globalCompositeOperation del compositor).
  const g = ctx.createLinearGradient(region.x, region.y, region.x + region.w, region.y + region.h)
  g.addColorStop(0, color1)
  g.addColorStop(1, color2)
  ctx.fillStyle = g
  ctx.fillRect(region.x, region.y, region.w, region.h)
}

export const PATTERNS: PatternDescriptor[] = [
  { id: "solid", label: "Sólido", needsTwoColors: false, continuous: false, category: "base", draw: fillRegion },
  { id: "hoops", label: "Franjas horizontales", needsTwoColors: true, continuous: false, category: "bandas", draw: drawHStripes },
  { id: "bastones_v", label: "Bastones verticales", needsTwoColors: true, continuous: false, category: "bandas", draw: drawVStripes },
  { id: "bastones_h", label: "Bastones horizontales", needsTwoColors: true, continuous: false, category: "bandas", draw: drawHStripes },
  { id: "chevron", label: "Chevron central", needsTwoColors: true, continuous: false, category: "geometrico", draw: drawChevron },
  { id: "sash", label: "Banda diagonal", needsTwoColors: true, continuous: false, category: "geometrico", draw: drawSash },
  { id: "half", label: "Mitad y mitad", needsTwoColors: true, continuous: false, category: "geometrico", draw: drawHalf },
  { id: "quarters", label: "Cuatro cuartos", needsTwoColors: true, continuous: false, category: "geometrico", draw: drawQuarters },
  { id: "check", label: "Cuadros", needsTwoColors: true, continuous: false, category: "geometrico", draw: drawCheck },
  { id: "salt_pepper", label: "Lunares", needsTwoColors: true, continuous: false, category: "geometrico", draw: drawSaltPepper },
  { id: "argyle", label: "Rombos", needsTwoColors: true, continuous: false, category: "geometrico", draw: drawArgyle },
  { id: "gradient", label: "Degradé", needsTwoColors: true, continuous: true, category: "geometrico", draw: drawGradient },
]

export function getPattern(id: PatternId): PatternDescriptor {
  return PATTERNS.find((p) => p.id === id) ?? PATTERNS[0]
}
