"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export interface VariantOption {
  id: string
  size: string
  color: string
  stock: number
  priceOverride: number | null
}

interface VariantPickerProps {
  variants: VariantOption[]
  basePrice: number
  onChange: (variant: VariantOption | null) => void
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount)
}

function pickInitial<T extends string>(
  values: T[],
  match: (value: T) => boolean,
): T | "" {
  return values.find(match) ?? ""
}

export function VariantPicker({ variants, basePrice, onChange }: VariantPickerProps) {
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))),
    [variants],
  )
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
    [variants],
  )
  const hasSizes = sizes.length > 0
  const hasColors = colors.length > 0

  // Defaults sincrónicos: primer size y color con stock disponible.
  const [size, setSize] = useState<string>(() =>
    pickInitial(sizes, (s) => variants.some((v) => v.size === s && v.stock > 0)),
  )
  const [color, setColor] = useState<string>(() =>
    pickInitial(colors, (c) => variants.some((v) => v.color === c && v.stock > 0)),
  )

  // Si `variants` cambia (re-fetch o nuevo producto), sincronizamos los
  // selects al primer match disponible SOLO si el actual está vacío o
  // ya no existe. Diferimos el setState con queueMicrotask para evitar
  // cascading renders detectados por react-hooks/set-state-in-effect.
  useEffect(() => {
    const mismatchSize = hasSizes && (!size || !sizes.includes(size))
    const mismatchColor = hasColors && (!color || !colors.includes(color))
    if (!mismatchSize && !mismatchColor) return
    queueMicrotask(() => {
      if (hasSizes && (!size || !sizes.includes(size))) {
        const next = pickInitial(sizes, (s) =>
          variants.some((v) => v.size === s && v.stock > 0),
        )
        if (next) setSize(next)
      }
      if (hasColors && (!color || !colors.includes(color))) {
        const next = pickInitial(colors, (c) =>
          variants.some((v) => v.color === c && v.stock > 0),
        )
        if (next) setColor(next)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants])

  const selected = useMemo(() => {
    return (
      variants.find((v) => {
        const sizeMatch = !hasSizes || v.size === size
        const colorMatch = !hasColors || v.color === color
        return sizeMatch && colorMatch
      }) ?? null
    )
  }, [variants, size, color, hasSizes, hasColors])

  useEffect(() => {
    onChange(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id])

  function pickSize(next: string) {
    setSize(next)
    const matches = variants.filter((v) => v.size === next && (!hasColors || v.color === color))
    const hasStock = matches.some((v) => v.stock > 0)
    if (!hasStock) {
      const first = variants.find((v) => v.size === next && v.stock > 0)
      if (first && hasColors) setColor(first.color)
    }
  }

  function pickColor(next: string) {
    setColor(next)
    const matches = variants.filter((v) => v.color === next && (!hasSizes || v.size === size))
    const hasStock = matches.some((v) => v.stock > 0)
    if (!hasStock) {
      const first = variants.find((v) => v.color === next && v.stock > 0)
      if (first && hasSizes) setSize(first.size)
    }
  }

  const effectivePrice = selected?.priceOverride ?? basePrice
  const stock = selected?.stock ?? 0

  return (
    <div className="space-y-4">
      {hasSizes && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
            Talle
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const anyInStock = variants.some((v) => v.size === s && v.stock > 0)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => pickSize(s)}
                  disabled={!anyInStock}
                  className={cn(
                    "min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    size === s
                      ? "border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626]"
                      : "border-white/10 hover:border-white/30",
                    !anyInStock && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {hasColors && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const anyInStock = variants.some((v) => v.color === c && v.stock > 0)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickColor(c)}
                  disabled={!anyInStock}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    color === c
                      ? "border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626]"
                      : "border-white/10 hover:border-white/30",
                    !anyInStock && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="font-display text-2xl font-bold">
          {formatPrice(effectivePrice)}
        </span>
        <StockBadge stock={stock} />
      </div>
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="rounded-full border border-red-400/40 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
        Sin stock
      </span>
    )
  }
  if (stock === 1) {
    return (
      <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
        ¡Última unidad!
      </span>
    )
  }
  if (stock <= 3) {
    return (
      <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
        Quedan {stock}
      </span>
    )
  }
  return (
    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
      En stock ({stock})
    </span>
  )
}