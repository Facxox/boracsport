"use client"

// SinglePreview: muestra un recorte del atlas 2D en su propio `<canvas>`.
// Usa `ctx.drawImage` para copiar la región del atlas cada vez que el
// atlas cambia. Mantener un canvas por preview permite que cada recorte
// escale al tamaño de su contenedor sin deformar el resto del atlas.

import { useEffect, useRef } from "react"
import type { ZoneRegion } from "@/lib/designer/zones"

interface SinglePreviewProps {
  atlas: HTMLCanvasElement
  region: ZoneRegion
  label: string
  className?: string
}

export function SinglePreview({ atlas, region, label, className }: SinglePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // Aseguramos que el canvas destino tiene las dimensiones de la región.
    // Usamos las dimensiones reales del atlas para que la copia sea 1:1
    // y luego CSS escala a tamaño visible.
    canvas.width = region.w
    canvas.height = region.h
    ctx.clearRect(0, 0, region.w, region.h)
    ctx.drawImage(
      atlas,
      region.x,
      region.y,
      region.w,
      region.h,
      0,
      0,
      region.w,
      region.h,
    )
  }, [atlas, region])

  return (
    <figure className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="h-full w-full rounded-md border border-foreground/10 bg-muted/40 object-contain"
      />
      <figcaption className="text-muted-foreground mt-1 text-center text-xs uppercase tracking-wider">
        {label}
      </figcaption>
    </figure>
  )
}