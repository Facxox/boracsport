"use client"

// Editor de variantes para design_presets.
// - Convencional: size + color obligatorios (kind='ropa').
// - Ofrece presets S/M/L/XL si la lista está vacía.
// - Permite agregar talles y colores libres.
// - Stock entero no negativo por variante.
// - Emite hidden inputs variants[N][size|color|sku|stock|price_override]
//   (al final del JSX) que consume createDesignPresetAction / updateDesignPresetAction.
//   Sin estos hidden inputs, parseVariants(formData, "ropa") no recibe la
//   matriz y replacePresetVariants borra todas las variantes existentes.

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import type { VariantFormValue } from "@/components/admin/variant-matrix-editor"

const PRESET_SIZES = ["S", "M", "L", "XL"] as const
const PRESET_COLORS = ["#dc2626", "#0f172a", "#f4f4f5", "#16a34a", "#2563eb"] as const

function variantsToMap(value: VariantFormValue[]): Map<string, VariantFormValue> {
  const out = new Map<string, VariantFormValue>()
  for (const v of value) {
    const size = (v.size || "").trim()
    const color = (v.color || "").trim()
    if (!size || !color) continue
    out.set(`${size}|${color.toLowerCase()}`, v)
  }
  return out
}

function mapToVariants(map: Map<string, VariantFormValue>): VariantFormValue[] {
  return Array.from(map.values())
}

interface PresetVariantsEditorProps {
  value: VariantFormValue[]
  onChange: (next: VariantFormValue[]) => void
}

function colorLabel(c: string): string {
  if (!c) return "Sin color"
  return c.toUpperCase()
}

export function PresetVariantsEditor({ value, onChange }: PresetVariantsEditorProps) {
  const initial = useMemo(() => variantsToMap(value), [value])
  const [rows, setRows] = useState<Map<string, VariantFormValue>>(initial)

  // Re-sincronizar si `value` cambia externamente.
  const lastSyncedRef = useRef<string>(JSON.stringify(value))
  useEffect(() => {
    const serialized = JSON.stringify(value)
    if (serialized === lastSyncedRef.current) return
    lastSyncedRef.current = serialized
    setRows(variantsToMap(value))
  }, [value])

  function commit(next: Map<string, VariantFormValue>) {
    setRows(next)
    onChange(mapToVariants(next))
  }

  function addVariant(size: string, color: string) {
    const key = `${size}|${color.toLowerCase()}`
    if (rows.has(key)) return
    const next = new Map(rows)
    next.set(key, {
      size,
      color,
      sku: "",
      stock: 0,
      price_override: "",
    })
    commit(next)
  }

  function updateVariant(key: string, patch: Partial<VariantFormValue>) {
    const current = rows.get(key)
    if (!current) return
    const next = new Map(rows)
    next.set(key, { ...current, ...patch })
    commit(next)
  }

  function removeVariant(key: string) {
    const next = new Map(rows)
    next.delete(key)
    commit(next)
  }

  function applyPresets() {
    const next = new Map(rows)
    for (const size of PRESET_SIZES) {
      for (const color of PRESET_COLORS) {
        const key = `${size}|${color.toLowerCase()}`
        if (!next.has(key)) {
          next.set(key, {
            size,
            color,
            sku: "",
            stock: 0,
            price_override: "",
          })
        }
      }
    }
    commit(next)
  }

  const totalStock = Array.from(rows.values()).reduce(
    (acc, v) => acc + (Number(v.stock) || 0),
    0,
  )

  const sortedKeys = Array.from(rows.keys()).sort()
  const [draftSize, setDraftSize] = useState("")
  const [draftColor, setDraftColor] = useState("")

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/60">
          {sortedKeys.length} variante{sortedKeys.length === 1 ? "" : "s"} · Stock total:{" "}
          <span className="font-semibold text-white">{totalStock}</span>
        </p>
        {sortedKeys.length === 0 ? (
          <button
            type="button"
            onClick={applyPresets}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
          >
            Cargar presets S/M/L/XL
          </button>
        ) : null}
      </div>

      {sortedKeys.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/55">
              <tr>
                <th className="px-3 py-2 font-medium">Talle</th>
                <th className="px-3 py-2 font-medium">Color</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Stock</th>
                <th className="px-3 py-2 font-medium">Precio override</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sortedKeys.map((key) => {
                const v = rows.get(key)!
                return (
                  <tr key={key} className="border-t border-white/10">
                    <td className="px-3 py-2 font-semibold">{v.size}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-white/20"
                          style={{ backgroundColor: v.color }}
                          aria-hidden
                        />
                        <span className="font-mono">{colorLabel(v.color)}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={v.sku ?? ""}
                        onChange={(e) => updateVariant(key, { sku: e.target.value })}
                        className="h-8 w-32 rounded-md border border-white/10 bg-black/30 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={v.stock}
                        onChange={(e) => updateVariant(key, { stock: Number(e.target.value) || 0 })}
                        className="h-8 w-20 rounded-md border border-white/10 bg-black/30 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={v.price_override ?? ""}
                        onChange={(e) =>
                          updateVariant(key, {
                            price_override: e.target.value,
                          })
                        }
                        className="h-8 w-24 rounded-md border border-white/10 bg-black/30 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeVariant(key)}
                        className="rounded-md p-1.5 text-white/55 hover:bg-red-500/15 hover:text-red-400"
                        aria-label={`Quitar ${v.size} ${v.color}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Agregar variante libre */}
      <div className="grid gap-2 rounded-lg border border-dashed border-white/10 bg-black/10 p-3 sm:grid-cols-[1fr_120px_auto]">
        <input
          type="text"
          value={draftSize}
          onChange={(e) => setDraftSize(e.target.value)}
          placeholder="Talle (ej. S, M, L, XXL, 10)"
          className="h-9 rounded-md border border-white/15 bg-black/30 px-3 text-xs"
        />
        <input
          type="text"
          value={draftColor}
          onChange={(e) => setDraftColor(e.target.value)}
          placeholder="#hex"
          className="h-9 rounded-md border border-white/15 bg-black/30 px-3 font-mono text-xs"
        />
        <button
          type="button"
          disabled={!draftSize.trim() || !draftColor.trim()}
          onClick={() => {
            addVariant(draftSize.trim(), draftColor.trim())
            setDraftSize("")
            setDraftColor("")
          }}
          className="inline-flex items-center justify-center gap-1 rounded-md bg-[#dc2626] px-3 py-2 text-xs font-bold text-black disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>

      <p className="text-[11px] text-white/45">
        El stock total del preset es la suma del stock de sus variantes activas.
        Las compras decrementan por variante específica.
      </p>

      {/* Hidden inputs para que las variantes viajen con el form. Sin esto,
          el server action no podría reconstruirlas y replacePresetVariants
          borraría todas las existentes en cada guardado. */}
      {mapToVariants(rows).map((v, idx) => (
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