"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { toast } from "sonner"
import { reorderCategoriesAction } from "@/app/admin/actions"

interface CategoryItem {
  id: string
  slug: string
  label: string
  emoji: string
  description: string
  display_order: number
  active: boolean
}

export function CategoryList({ initial }: { initial: CategoryItem[] }) {
  const [items, setItems] = useState(initial)
  const [pending, startTransition] = useTransition()

  function swap(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    const previous = items
    setItems(next)
    startTransition(async () => {
      try {
        await reorderCategoriesAction(next.map((c) => c.id))
        toast.success("Orden guardado")
      } catch (err) {
        setItems(previous)
        toast.error(err instanceof Error ? err.message : "No se pudo reordenar")
      }
    })
  }

  if (items.length === 0) {
    return <p className="mt-3 text-sm text-white/50">No hay categorías todavía.</p>
  }

  return (
    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
      {items.map((cat, idx) => (
        <li
          key={cat.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#101012] p-4"
        >
          <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
            <button
              type="button"
              onClick={() => swap(idx, -1)}
              disabled={pending || idx === 0}
              aria-label="Mover arriba"
              className="rounded p-1 text-white/60 hover:bg-white/10 disabled:opacity-30"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => swap(idx, 1)}
              disabled={pending || idx === items.length - 1}
              aria-label="Mover abajo"
              className="rounded p-1 text-white/60 hover:bg-white/10 disabled:opacity-30"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <p className="font-sans text-base font-bold">
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}{" "}
              <span className="ml-2 text-xs font-normal text-white/40">/{cat.slug}</span>
            </p>
            <p className="mt-1 text-xs text-white/50">Orden {cat.display_order}</p>
            {cat.description ? (
              <p className="mt-2 text-xs text-white/60 line-clamp-2">{cat.description}</p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={
                cat.active
                  ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400"
                  : "rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50"
              }
            >
              {cat.active ? "Activa" : "Oculta"}
            </span>
            <Link
              href={`/admin/categorias/${cat.id}`}
              className="h-9 inline-flex items-center rounded-lg border border-white/10 px-3 text-xs hover:bg-white/5"
            >
              Editar
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )
}