"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface VariantFormValue {
  size: string
  color: string
  sku: string
  stock: number
  price_override: string
}

export const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"] as const

interface VariantMatrixEditorProps {
  value: VariantFormValue[]
  onChange: (next: VariantFormValue[]) => void
}

function variantsToMatrix(value: VariantFormValue[]): {
  colors: string[]
  matrix: Record<string, Record<string, number>>
} {
  const colorsSet = new Set<string>()
  const matrix: Record<string, Record<string, number>> = {}
  for (const v of value) {
    const colorKey = (v.color || "").trim()
    const sizeKey = (v.size || "").trim()
    if (!colorKey && !sizeKey) continue
    if (colorKey) colorsSet.add(colorKey)
    if (colorKey && sizeKey) {
      if (!matrix[colorKey]) matrix[colorKey] = {}
      // Mantenemos stock=0 en la matriz para que la celda visual no desaparezca
      // al navegar. Las variantes con stock=0 viajamos igual al server.
      matrix[colorKey][sizeKey] = Number(v.stock) || 0
    }
  }
  return { colors: Array.from(colorsSet), matrix }
}

function matrixToVariants(
  colors: string[],
  matrix: Record<string, Record<string, number>>,
): VariantFormValue[] {
  const out: VariantFormValue[] = []
  for (const color of colors) {
    for (const size of STANDARD_SIZES) {
      const stock = matrix[color]?.[size]
      // Incluimos TODAS las celdas (incluso stock=0) para que el form
      // emita hidden inputs consistentes y el admin pueda borrar stock
      // (poner 0) sin que la fila desaparezca del state del padre.
      if (stock === undefined) continue
      out.push({
        size,
        color,
        sku: "",
        stock,
        price_override: "",
      })
    }
  }
  return out
}

export function VariantMatrixEditor({ value, onChange }: VariantMatrixEditorProps) {
  const initial = useMemo(() => variantsToMatrix(value), [value])
  const [colors, setColors] = useState<string[]>(initial.colors)
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>(initial.matrix)
  const [draft, setDraft] = useState("")
  const [bulk, setBulk] = useState("")

  // Re-sincronizar colors/matrix si `value` cambia externamente (ej. router.refresh
  // tras un fallo de validación). Usamos un ref para evitar pisar ediciones
  // locales del usuario mientras escribe.
  const lastSyncedRef = useRef<string>(JSON.stringify(value))
  useEffect(() => {
    const serialized = JSON.stringify(value)
    if (serialized === lastSyncedRef.current) return
    lastSyncedRef.current = serialized
    const next = variantsToMatrix(value)
    setColors(next.colors)
    setMatrix(next.matrix)
  }, [value])

  function commit(nextColors: string[], nextMatrix: Record<string, Record<string, number>>) {
    setColors(nextColors)
    setMatrix(nextMatrix)
    onChange(matrixToVariants(nextColors, nextMatrix))
  }

  function addColor(raw: string) {
    const c = raw.trim()
    if (!c) return
    if (colors.some((x) => x.toLowerCase() === c.toLowerCase())) return
    commit([...colors, c], { ...matrix, [c]: {} })
    setDraft("")
  }

  function removeColor(color: string) {
    const nextMatrix = { ...matrix }
    delete nextMatrix[color]
    commit(
      colors.filter((c) => c !== color),
      nextMatrix,
    )
  }

  function updateCell(color: string, size: string, raw: string) {
    const n = Math.max(0, Math.floor(Number(raw) || 0))
    const nextMatrix = {
      ...matrix,
      [color]: { ...(matrix[color] ?? {}), [size]: n },
    }
    setMatrix(nextMatrix)
    onChange(matrixToVariants(colors, nextMatrix))
  }

  function applyBulk() {
    const n = Math.max(0, Math.floor(Number(bulk) || 0))
    if (colors.length === 0) return
    const nextMatrix: Record<string, Record<string, number>> = {}
    for (const color of colors) {
      nextMatrix[color] = {}
      for (const size of STANDARD_SIZES) {
        nextMatrix[color][size] = n
      }
    }
    setMatrix(nextMatrix)
    onChange(matrixToVariants(colors, nextMatrix))
    setBulk("")
  }

  function totalFor(color: string): number {
    const row = matrix[color] ?? {}
    return STANDARD_SIZES.reduce((acc, s) => acc + (row[s] ?? 0), 0)
  }

  const grandTotal = colors.reduce((acc, c) => acc + totalFor(c), 0)

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0d0d0f]/60 p-5">
      {/* Paso A — colores (tags) */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
          Colores
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {colors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dc2626]/40 bg-[#dc2626]/10 px-3 py-1 text-xs font-semibold text-[#dc2626]"
            >
              {c}
              <button
                type="button"
                onClick={() => removeColor(c)}
                aria-label={`Quitar color ${c}`}
                className="hover:bg-[#dc2626]/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addColor(draft)
                }
              }}
              placeholder="Ej: Negro"
              className="w-32 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
            />
            <button
              type="button"
              onClick={() => addColor(draft)}
              aria-label="Agregar color"
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-white/15 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/5"
            >
              <Plus className="h-3 w-3" /> Agregar
            </button>
          </div>
        </div>
        {colors.length === 0 && (
          <p className="mt-2 text-xs text-white/40">
            Agregá al menos un color (Enter o botón +). Si no, se creará una variante default vacía.
          </p>
        )}
      </div>

      {/* Paso C — bulk fill */}
      {colors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-2">
          <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">
            Llenado rápido
          </span>
          <input
            type="number"
            min="0"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder="0"
            className="w-20 rounded border border-white/10 bg-black/30 px-2 py-1 text-xs"
          />
          <button
            type="button"
            onClick={applyBulk}
            className="rounded-lg bg-[#dc2626] px-3 py-1 text-xs font-bold text-black hover:bg-[#ef4444]"
          >
            Aplicar a todo
          </button>
          <span className="text-muted-foreground text-xs">
            Esto setea el mismo stock en todas las celdas.
          </span>
        </div>
      )}

      {/* Paso B — matriz */}
      {colors.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-white/5">
                <th className="border-b border-r border-white/10 px-3 py-2 text-left font-semibold tracking-wider text-white/60 uppercase">
                  Color
                </th>
                {STANDARD_SIZES.map((s) => (
                  <th
                    key={s}
                    className="border-b border-r border-white/10 px-2 py-2 text-center font-semibold tracking-wider text-white/60 uppercase"
                  >
                    {s}
                  </th>
                ))}
                <th className="border-b border-white/10 px-3 py-2 text-center font-semibold tracking-wider text-white/60 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {colors.map((c) => {
                const row = matrix[c] ?? {}
                return (
                  <tr key={c} className="hover:bg-white/[0.02]">
                    <td className="border-b border-r border-white/10 px-3 py-2 font-medium">
                      <div className="flex items-center justify-between gap-2">
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(c)}
                          className="text-muted-foreground hover:text-red-400"
                          aria-label={`Quitar ${c}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    {STANDARD_SIZES.map((s) => (
                      <td key={s} className="border-b border-r border-white/10 p-1">
                        <input
                          type="number"
                          min="0"
                          value={String(row[s] ?? 0)}
                          onChange={(e) => updateCell(c, s, e.target.value)}
                          className={cn(
                            "w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-center text-xs",
                            "focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]",
                            (row[s] ?? 0) > 0 && "text-white",
                          )}
                          aria-label={`Stock ${c} ${s}`}
                        />
                      </td>
                    ))}
                    <td className="border-b border-white/10 px-3 py-2 text-center font-bold">
                      {totalFor(c)}
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-white/5">
                <td className="px-3 py-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Total general
                </td>
                {STANDARD_SIZES.map((s) => {
                  const sum = colors.reduce(
                    (acc, c) => acc + (matrix[c]?.[s] ?? 0),
                    0,
                  )
                  return (
                    <td
                      key={s}
                      className="px-2 py-2 text-center text-xs font-bold text-white/80"
                    >
                      {sum}
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-center text-sm font-extrabold text-[#dc2626]">
                  {grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <p className="text-muted-foreground text-[11px]">
        Las celdas con stock &gt; 0 generan variantes (size, color, stock) al enviar el formulario. Talles: S, M, L, XL, XXL.
      </p>

      {/* Hidden inputs para que las variantes viajen con el form. Sin esto,
          el server action no podría reconstruirlas y replaceVariants borraría
          todas las existentes. */}
      {value.map((v, idx) => (
        <span key={`hidden-${idx}`} aria-hidden style={{ display: "none" }}>
          <input type="hidden" name={`variants[${idx}][size]`} value={v.size} />
          <input type="hidden" name={`variants[${idx}][color]`} value={v.color} />
          <input type="hidden" name={`variants[${idx}][sku]`} value={v.sku ?? ""} />
          <input type="hidden" name={`variants[${idx}][stock]`} value={String(v.stock)} />
          <input
            type="hidden"
            name={`variants[${idx}][price_override]`}
            value={v.price_override ?? ""}
          />
        </span>
      ))}
    </div>
  )
}