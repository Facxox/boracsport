"use client"

// Galería de imágenes del producto.
// - Desktop: thumbnails en columna a la derecha.
// - Mobile: imagen principal swipeable horizontal + thumbnails en fila
//   debajo, con scroll-snap. aria-live al cambiar la imagen activa.

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

// Solo aceptamos http/https. Bloquea javascript:, data:, vbscript:, etc.
function safeImgUrl(u: string): string | null {
  if (typeof u !== "string" || u.length === 0 || u.length > 2048) return null
  try {
    const url = new URL(u, "https://placeholder.local")
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return u
  } catch {
    return null
  }
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const safeImages = images.map(safeImgUrl).filter((u): u is string => u != null)
  const [activeIdx, setActiveIdx] = useState(0)
  const mainRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)

  // Si cambia la lista (ej: navegación a otro producto), reseteamos.
  // queueMicrotask difiere el set para evitar cascading renders.
  useEffect(() => {
    queueMicrotask(() => {
      setActiveIdx((prev) => (prev === 0 ? prev : 0))
    })
  }, [images])

  if (safeImages.length === 0) {
    return (
      <div className="bg-muted/30 flex aspect-square w-full items-center justify-center rounded-2xl border border-white/5 text-sm text-white/50">
        Sin imagen
      </div>
    )
  }

  const active = safeImages[Math.min(activeIdx, safeImages.length - 1)]

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || safeImages.length <= 1) return
    const end = e.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = end - touchStartX.current
    if (Math.abs(delta) < 40) return
    if (delta < 0 && activeIdx < safeImages.length - 1) setActiveIdx(activeIdx + 1)
    if (delta > 0 && activeIdx > 0) setActiveIdx(activeIdx - 1)
    touchStartX.current = null
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        ref={mainRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="bg-muted/30 relative aspect-square w-full overflow-hidden rounded-2xl border border-white/5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active}
          alt={alt}
          className="h-full w-full object-cover"
          draggable={false}
        />
        {safeImages.length > 1 ? (
          <>
            <div className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {activeIdx + 1} / {safeImages.length}
            </div>
            <span className="sr-only" aria-live="polite">
              Imagen {activeIdx + 1} de {safeImages.length}
            </span>
          </>
        ) : null}
      </div>

      {safeImages.length > 1 && (
        <div
          className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:max-w-20 md:grid-cols-1 md:gap-2 md:overflow-visible md:px-0 md:pb-0"
          role="tablist"
          aria-label="Miniaturas del producto"
        >
          {safeImages.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              role="tab"
              aria-selected={idx === activeIdx}
              aria-label={`Ver imagen ${idx + 1}`}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "bg-muted/30 aspect-square w-16 shrink-0 snap-center overflow-hidden rounded-md border transition-all md:w-full",
                "min-h-[64px] min-w-[64px]",
                idx === activeIdx
                  ? "border-[#dc2626] ring-1 ring-[#dc2626]"
                  : "border-white/10 hover:border-white/30",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
