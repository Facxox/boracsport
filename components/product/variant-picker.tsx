"use client"

// Selector de variantes con flujo explícito:
//   1. Elegí color.
//   2. Elegí talle.
//   3. Revisá disponibilidad.
//   4. Agregá al carrito (CTA en PDP).
//
// Cuando el color es interpretable como CSS color, lo mostramos como
// swatch (con etiqueta accesible). Si no, mostramos etiqueta de texto.
// Las opciones sin stock quedan visualmente tachadas y deshabilitadas.

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

// Mapa de nombres de color en español → hex. Sólo lo usamos cuando el
// color es una palabra reconocible para mostrar un swatch. Si no está en
// el mapa, caemos a etiqueta de texto.
const NAMED_COLORS: Record<string, string> = {
  rojo: "#dc2626",
  "rojo oscuro": "#7f1d1d",
  bordó: "#7f1d1d",
  bordo: "#7f1d1d",
  azul: "#2563eb",
  "azul marino": "#1e3a8a",
  marino: "#1e3a8a",
  celeste: "#38bdf8",
  verde: "#16a34a",
  "verde oscuro": "#14532d",
  amarillo: "#facc15",
  negro: "#0a0a0a",
  blanco: "#f8fafc",
  gris: "#6b7280",
  "gris oscuro": "#1f2937",
  rosa: "#ec4899",
  fucsia: "#d946ef",
  violeta: "#7c3aed",
  naranja: "#f97316",
  beige: "#d6cfbf",
  crema: "#fef3c7",
  marrón: "#78350f",
  marfil: "#fefce8",
}

function colorToHex(name: string): string | null {
  const key = name.trim().toLowerCase()
  return NAMED_COLORS[key] ?? null
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
    <div className="space-y-5" role="group" aria-label="Elegí las opciones del producto">
      {hasColors && (
        <fieldset>
          <legend className="mb-2 flex items-baseline gap-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
            <span className="text-brand-red mr-1">1.</span>
            Color
            {color ? <span className="text-foreground/80 font-normal normal-case">· {color}</span> : null}
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const anyInStock = variants.some((v) => v.color === c && v.stock > 0)
              const hex = colorToHex(c)
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-current={color === c ? "true" : undefined}
                  aria-label={`Color ${c}${anyInStock ? "" : " (sin stock)"}`}
                  onClick={() => pickColor(c)}
                  disabled={!anyInStock}
                  className={cn(
                    "group/swatch relative inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium motion-safe:transition-all min-h-[44px]",
                    color === c
                      ? "border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626]"
                      : "border-white/10 hover:border-white/30",
                    !anyInStock && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  {hex ? (
                    <span
                      aria-hidden
                      className="border-border inline-block h-4 w-4 shrink-0 rounded-full border"
                      style={{ backgroundColor: hex }}
                    />
                  ) : null}
                  <span>{c}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {hasSizes && (
        <fieldset>
          <legend className="mb-2 flex items-baseline gap-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
            <span className="text-brand-red mr-1">{hasColors ? "2." : "1."}</span>
            Talle
            {size ? <span className="text-foreground/80 font-normal normal-case">· {size}</span> : null}
          </legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const anyInStock = variants.some((v) => v.size === s && v.stock > 0)
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  aria-current={size === s ? "true" : undefined}
                  aria-label={`Talle ${s}${anyInStock ? "" : " (sin stock)"}`}
                  onClick={() => pickSize(s)}
                  disabled={!anyInStock}
                  className={cn(
                    "min-h-[44px] min-w-12 rounded-lg border px-4 py-2 text-sm font-medium motion-safe:transition-all",
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
        </fieldset>
      )}

      <div className="bg-card/40 flex items-center justify-between gap-3 rounded-xl border border-white/5 px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold">
            {formatPrice(effectivePrice)}
          </span>
          <StockBadge stock={stock} />
        </div>
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
