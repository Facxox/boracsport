"use client"

// Editor de variantes para productos kind='pelota'.
// - Si no hay variantes definidas, se ofrece un set de presets 1..5 con
//   stock=0 para que el admin las active/ajuste.
// - Permite agregar talles libres (texto editable) y eliminarlos.
// - No usa color: cada variante tiene color="" (consistente con la matriz).
// - Stock por talle (entero >= 0). Stock total derivado.
// - Reutiliza VariantFormValue del variant-matrix-editor (shape idéntica)
//   y emite hidden inputs variants[N][size|color|sku|stock|price_override]
//   para que el server action las parsee con la misma lógica.
//
// Decisiones:
// - color se mantiene como "" (string vacío) en cada VariantFormValue para
//   que el server action pueda distinguir "pelota" de "ropa" en función
//   del kind de la categoría (no del campo color).
// - El preset 1..5 sólo aparece cuando variants está vacío; si el admin
//   elimina todas las variantes y vuelve a entrar, vuelven a aparecer.

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Mantener el mismo tipo para no romper el contrato con el server action.
// Importamos desde el editor matriz para evitar divergencias.
import type { VariantFormValue } from "@/components/admin/variant-matrix-editor"

const BALL_PRESET_SIZES = ["1", "2", "3", "4", "5"] as const

function variantsToSizes(value: VariantFormValue[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const v of value) {
    const key = (v.size || "").trim()
    if (!key) continue
    // Sumamos si hay duplicados para no perder stock al re-editar.
    out.set(key, (out.get(key) ?? 0) + (Number(v.stock) || 0))
  }
  return out
}

function sizesToVariants(sizes: Map<string, number>): VariantFormValue[] {
  const out: VariantFormValue[] = []
  for (const [size, stock] of sizes.entries()) {
    out.push({
      size,
      color: "",
      sku: "",
      stock,
      price_override: "",
    })
  }
  return out
}

interface BallSizeVariantsEditorProps {
  value: VariantFormValue[]
  onChange: (next: VariantFormValue[]) => void
}

export function BallSizeVariantsEditor({ value, onChange }: BallSizeVariantsEditorProps) {
  const initial = useMemo(() => variantsToSizes(value), [value])
  const [sizes, setSizes] = useState<Map<string, number>>(initial)
  const [draft, setDraft] = useState("")
  const [bulk, setBulk] = useState("")

  // Re-sincronizar sizes si `value` cambia externamente (router.refresh
  // tras un fallo de validación). Usamos un ref para evitar pisar
  // ediciones locales del usuario mientras escribe.
  const lastSyncedRef = useRef<string>(JSON.stringify(value))
  useEffect(() => {
    const serialized = JSON.stringify(value)
    if (serialized === lastSyncedRef.current) return
    lastSyncedRef.current = serialized
    setSizes(variantsToSizes(value))
  }, [value])

  function commit(next: Map<string, number>) {
    setSizes(next)
    onChange(sizesToVariants(next))
  }

  function addSize(raw: string) {
    const s = raw.trim()
    if (!s) return
    if (sizes.has(s)) return
    const next = new Map(sizes)
    next.set(s, 0)
    commit(next)
    setDraft("")
  }

  function removeSize(size: string) {
    const next = new Map(sizes)
    next.delete(size)
    commit(next)
  }

  function updateStock(size: string, raw: string) {
    const n = Math.max(0, Math.floor(Number(raw) || 0))
    const next = new Map(sizes)
    next.set(size, n)
    setSizes(next)
    onChange(sizesToVariants(next))
  }

  function renameSize(prev: string, nextRaw: string) {
    const next = nextRaw.trim()
    if (!next || next === prev) return
    if (sizes.has(next)) return
    const stock = sizes.get(prev) ?? 0
    const out = new Map<string, number>()
    for (const [k, v] of sizes.entries()) {
      if (k === prev) out.set(next, stock)
      else out.set(k, v)
    }
    commit(out)
  }

  function applyBulk() {
    const n = Math.max(0, Math.floor(Number(bulk) || 0))
    if (sizes.size === 0) return
    const next = new Map<string, number>()
    for (const k of sizes.keys()) next.set(k, n)
    setSizes(next)
    onChange(sizesToVariants(next))
    setBulk("")
  }

  function loadPresets() {
    const next = new Map<string, number>()
    for (const s of BALL_PRESET_SIZES) next.set(s, 0)
    commit(next)
  }

  const totalStock = Array.from(sizes.values()).reduce((acc, n) => acc + (Number(n) || 0), 0)

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0d0d0f]/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
            Talles de pelota
          </p>
          <p className="mt-1 text-xs text-white/50">
            Cargá el stock por talle. Sumá presets 1 a 5 o definí talles libres.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sizes.size === 0 ? (
            <button
              type="button"
              onClick={loadPresets}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
            >
              <Plus className="h-3.5 w-3.5" /> Cargar presets 1–5
            </button>
          ) : (
            <button
              type="button"
              onClick={() => commit(new Map())}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Vaciar
            </button>
          )}
        </div>
      </div>

      {sizes.size > 0 && (
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
          <span className="text-muted-foreground text-xs">Setea el mismo stock en todos los talles.</span>
        </div>
      )}

      {sizes.size > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-white/5">
                <th className="border-b border-r border-white/10 px-3 py-2 text-left font-semibold tracking-wider text-white/60 uppercase">
                  Talle
                </th>
                <th className="border-b border-r border-white/10 px-3 py-2 text-center font-semibold tracking-wider text-white/60 uppercase">
                  Stock
                </th>
                <th className="border-b border-white/10 px-3 py-2 text-center font-semibold tracking-wider text-white/60 uppercase">
                  Quitar
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from(sizes.entries()).map(([size, stock]) => (
                <SizeRow
                  key={size}
                  size={size}
                  stock={stock}
                  onStockChange={(raw) => updateStock(size, raw)}
                  onRename={(raw) => renameSize(size, raw)}
                  onRemove={() => removeSize(size)}
                />
              ))}
              <tr className="bg-white/5">
                <td className="px-3 py-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Total general
                </td>
                <td className="px-3 py-2 text-center text-sm font-extrabold text-[#dc2626]">
                  {totalStock}
                </td>
                <td className="px-3 py-2" />
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          Sin talles cargados. Sumá los presets 1 a 5 o agregá un talle libre abajo.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">
          Agregar talle
        </span>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addSize(draft)
              }
            }}
            placeholder="Ej: 5 o XL"
            className="w-32 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
          />
          <button
            type="button"
            onClick={() => addSize(draft)}
            aria-label="Agregar talle"
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-white/15 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/5"
          >
            <Plus className="h-3 w-3" /> Agregar
          </button>
        </div>
      </div>

      <p className="text-muted-foreground text-[11px]">
        El stock total del producto se calcula como la suma del stock por talle. El campo
        &quot;color&quot; queda vacío para pelotas (no se usa en el checkout público).
      </p>

      {/* Hidden inputs para que las variantes viajen con el form. Mismo shape
          que VariantMatrixEditor para que el server action las parsee igual. */}
      {value.map((v, idx) => (
        <span key={`hidden-${idx}`} aria-hidden style={{ display: "none" }}>
          <input type="hidden" name={`variants[${idx}][size]`} value={v.size} />
          <input type="hidden" name={`variants[${idx}][color]`} value={v.color ?? ""} />
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

function SizeRow({
  size,
  stock,
  onStockChange,
  onRename,
  onRemove,
}: {
  size: string
  stock: number
  onStockChange: (raw: string) => void
  onRename: (raw: string) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(size)

  function commit() {
    const next = draft.trim()
    if (next && next !== size) onRename(next)
    else setDraft(size)
    setEditing(false)
  }

  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="border-b border-r border-white/10 px-3 py-2 font-medium">
        {editing ? (
          <input
            type="text"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commit()
              } else if (e.key === "Escape") {
                setDraft(size)
                setEditing(false)
              }
            }}
            className="w-24 rounded border border-white/10 bg-black/30 px-2 py-1 text-xs focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
            aria-label={`Renombrar talle ${size}`}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded px-1 text-left text-xs font-semibold hover:bg-white/5"
            aria-label={`Editar talle ${size}`}
          >
            {size}
          </button>
        )}
      </td>
      <td className="border-b border-r border-white/10 p-1">
        <input
          type="number"
          min="0"
          value={String(stock)}
          onChange={(e) => onStockChange(e.target.value)}
          className={cn(
            "w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-center text-xs",
            "focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]",
            stock > 0 && "text-white",
          )}
          aria-label={`Stock talle ${size}`}
        />
      </td>
      <td className="border-b border-white/10 px-3 py-2 text-center">
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-red-400"
          aria-label={`Quitar talle ${size}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  )
}