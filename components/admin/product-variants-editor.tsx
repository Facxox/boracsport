"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"

export interface VariantFormValue {
  size: string
  color: string
  sku: string
  stock: number
  price_override: string
}

const DEFAULT_VARIANT: VariantFormValue = { size: "", color: "", sku: "", stock: 0, price_override: "" }

interface ProductVariantsEditorProps {
  value: VariantFormValue[]
  onChange: (next: VariantFormValue[]) => void
}

export function ProductVariantsEditor({ value, onChange }: ProductVariantsEditorProps) {
  const variants = value
  const [adding, setAdding] = useState(false)

  function updateAt(idx: number, patch: Partial<VariantFormValue>) {
    const next = variants.map((v, i) => (i === idx ? { ...v, ...patch } : v))
    onChange(next)
  }

  function add() {
    onChange([...variants, { ...DEFAULT_VARIANT }])
    setAdding(false)
  }

  function remove(idx: number) {
    onChange(variants.filter((_, i) => i !== idx))
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir
    if (target < 0 || target >= variants.length) return
    const next = [...variants]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {variants.length === 0 ? (
        <p className="text-muted-foreground text-xs">Sin variantes. Sumá la primera.</p>
      ) : (
        <div className="grid gap-2">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-2 text-xs"
            >
              <input
                type="text"
                value={v.size}
                onChange={(e) => updateAt(idx, { size: e.target.value })}
                placeholder="Talle (S, M, L)"
                className="col-span-2 rounded border border-white/10 bg-black/30 px-2 py-1"
                name={`variants[${idx}][size]`}
              />
              <input
                type="text"
                value={v.color}
                onChange={(e) => updateAt(idx, { color: e.target.value })}
                placeholder="Color"
                className="col-span-3 rounded border border-white/10 bg-black/30 px-2 py-1"
                name={`variants[${idx}][color]`}
              />
              <input
                type="text"
                value={v.sku}
                onChange={(e) => updateAt(idx, { sku: e.target.value })}
                placeholder="SKU (opcional)"
                className="col-span-2 rounded border border-white/10 bg-black/30 px-2 py-1"
                name={`variants[${idx}][sku]`}
              />
              <input
                type="number"
                min="0"
                value={String(v.stock)}
                onChange={(e) => updateAt(idx, { stock: Number(e.target.value) })}
                placeholder="Stock"
                className="col-span-2 rounded border border-white/10 bg-black/30 px-2 py-1"
                name={`variants[${idx}][stock]`}
              />
              <input
                type="number"
                min="0"
                value={v.price_override}
                onChange={(e) => updateAt(idx, { price_override: e.target.value })}
                placeholder="Precio override"
                className="col-span-2 rounded border border-white/10 bg-black/30 px-2 py-1"
                name={`variants[${idx}][price_override]`}
              />
              <div className="col-span-1 flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded p-1 text-white/60 hover:bg-white/10 disabled:opacity-30"
                  aria-label="Mover arriba"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === variants.length - 1}
                  className="rounded p-1 text-white/60 hover:bg-white/10 disabled:opacity-30"
                  aria-label="Mover abajo"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="col-span-1 ml-auto rounded p-1 text-red-400 hover:bg-red-500/10"
                aria-label="Eliminar variante"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
      >
        <Plus className="h-3.5 w-3.5" /> Agregar variante
      </button>
    </div>
  )
}