"use client"

// Selector de color — paleta Borac + color libre.
// Usado por TabColores (color base de cada zona) y por la zona `pattern`
// (color1 / color2).

import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { RgbColor } from "@/lib/designer/types"

const SWATCHES: ReadonlyArray<{ label: string; hex: string }> = [
  { label: "Negro", hex: "#0f172a" },
  { label: "Rojo Borac", hex: "#dc2626" },
  { label: "Blanco", hex: "#f4f4f5" },
  { label: "Amarillo", hex: "#f59e0b" },
  { label: "Verde", hex: "#16a34a" },
  { label: "Azul", hex: "#2563eb" },
  { label: "Violeta", hex: "#7c3aed" },
  { label: "Personalizado", hex: "#ffffff" },
]

interface ColorPickerProps {
  value: RgbColor | string
  onChange: (next: RgbColor) => void
  ariaLabel?: string
}

export function ColorPicker({ value, onChange, ariaLabel }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const current = (value ?? "#0f172a") as string

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ariaLabel ?? "Color"}>
      {SWATCHES.map((s) => {
        const selected = isSameHex(current, s.hex)
        return (
          <button
            key={s.label}
            type="button"
            aria-label={s.label}
            aria-pressed={selected}
            title={s.label}
            onClick={() => onChange(s.hex as RgbColor)}
            className={cn(
              "relative h-8 w-8 rounded-full border border-white/15 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
              selected && "ring-2 ring-brand-red ring-offset-2 ring-offset-background",
            )}
            style={{ backgroundColor: s.hex }}
          />
        )
      })}
      <label className="border-foreground/15 hover:border-foreground/30 flex h-8 cursor-pointer items-center gap-1.5 rounded-md border bg-background px-2 text-xs font-medium transition-colors">
        <span
          aria-hidden
          className="border-border inline-block h-4 w-4 rounded-full border"
          style={{ backgroundColor: current }}
        />
        <span className="text-muted-foreground">{current.toUpperCase()}</span>
        <input
          ref={inputRef}
          type="color"
          value={normalizeHex(current)}
          onChange={(e) => onChange(e.target.value as RgbColor)}
          className="sr-only"
          aria-label="Color personalizado"
        />
      </label>
    </div>
  )
}

// `<input type="color">` requiere `#rrggbb` lowercase. Si el usuario está
// usando `#rgb` o un valor no-hex, caemos a blanco para no romper el picker.
function normalizeHex(input: string): string {
  const v = input.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const r = v[1]
    const g = v[2]
    const b = v[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return "#ffffff"
}

function isSameHex(a: string, b: string): boolean {
  return normalizeHex(a) === normalizeHex(b)
}
