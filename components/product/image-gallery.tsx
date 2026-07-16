"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

// Solo aceptamos http/https. Bloquea javascript:, data:, vbscript:, etc.
// para evitar XSS vía SVG u otros payloads.
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
  const [activeIdx, setActiveIdx] = useState(0)
  const safeImages = images
    .map(safeImgUrl)
    .filter((u): u is string => u != null)
  if (safeImages.length === 0) {
    return (
      <div className="bg-muted/30 flex aspect-square w-full items-center justify-center rounded-2xl border border-white/5 text-sm text-white/50">
        Sin imagen
      </div>
    )
  }
  const active = safeImages[Math.min(activeIdx, safeImages.length - 1)]
  return (
    <div className="flex w-full flex-col gap-3 md:flex-row-reverse">
      <div className="bg-muted/30 aspect-square w-full overflow-hidden rounded-2xl border border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active} alt={alt} className="h-full w-full object-cover" />
      </div>
      {safeImages.length > 1 && (
        <div className="flex shrink-0 gap-2 md:w-20 md:flex-col">
          {safeImages.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              className={cn(
                "bg-muted/30 aspect-square w-16 shrink-0 overflow-hidden rounded-md border transition-all md:w-full",
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