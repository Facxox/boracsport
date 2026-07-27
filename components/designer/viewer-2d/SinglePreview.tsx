"use client"

// SinglePreview: muestra un recorte del atlas 2D en su propio `<canvas>`.
// Si se pasa `backgroundUrl`, primero pinta esa imagen como fondo (mockup
// de referencia subido por el admin) y después compone la región del
// atlas encima con `source-over`. Donde el atlas tenga alpha=0 se ve el
// mockup; donde hay color/patrón/logo del usuario, se ve el estampado.

import { useEffect, useRef, useSyncExternalStore } from "react"
import type { ZoneRegion } from "@/lib/designer/zones"

interface SinglePreviewProps {
  atlas: HTMLCanvasElement
  region: ZoneRegion
  label: string
  className?: string
  backgroundUrl?: string | null
}

// Cache de imágenes a nivel de módulo + contador de versión para que
// cada componente se entere cuando una URL resuelve. Lo registramos en
// `bgImageCache` y notificamos via `bgImageListeners` cuando una promesa
// termina (éxito o error).
const bgImageCache = new Map<string, HTMLImageElement>()
const bgImageInflight = new Map<string, Promise<void>>()
const bgImageListeners = new Set<() => void>()
let bgImageVersion = 0

function subscribeBg(listener: () => void): () => void {
  bgImageListeners.add(listener)
  return () => {
    bgImageListeners.delete(listener)
  }
}

function getBgImageVersion(): number {
  return bgImageVersion
}

function ensureBackgroundLoaded(src: string): void {
  if (bgImageCache.has(src)) return
  const inflight = bgImageInflight.get(src)
  if (inflight) return
  const promise = new Promise<void>((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      bgImageCache.set(src, img)
      bgImageInflight.delete(src)
      bgImageVersion += 1
      bgImageListeners.forEach((l) => l())
      resolve()
    }
    img.onerror = () => {
      bgImageInflight.delete(src)
      bgImageVersion += 1
      bgImageListeners.forEach((l) => l())
      resolve()
    }
    img.src = src
  })
  bgImageInflight.set(src, promise)
}

function getCachedBackground(src: string): HTMLImageElement | undefined {
  return bgImageCache.get(src)
}

export function SinglePreview({
  atlas,
  region,
  label,
  className,
  backgroundUrl,
}: SinglePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Re-render cuando el cache de fondos cambia (imagen resuelve).
  useSyncExternalStore(subscribeBg, getBgImageVersion, getBgImageVersion)

  // Disparar la carga si la URL es nueva. No hace falta un useEffect:
  // la carga se inicia sincrónicamente (cache hit) o en background
  // (cache miss) sincrónicamente; el `useSyncExternalStore` de arriba
  // nos notifica cuando la promesa resuelve.
  const bgImage = backgroundUrl ? (ensureBackgroundLoaded(backgroundUrl), getCachedBackground(backgroundUrl) ?? null) : null

  // Pintar el canvas cada vez que cambia el atlas, la región o el fondo.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = region.w
    canvas.height = region.h
    ctx.clearRect(0, 0, region.w, region.h)
    // 1) Fondo: si hay imagen, estirada al tamaño del recorte.
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, region.w, region.h)
    }
    // 2) Atlas encima: la región pintada del compositor.
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
  }, [atlas, region, bgImage])

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