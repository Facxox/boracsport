"use client"

// Filtro de categorías visible en el catálogo y en la home.
// - aria-current en el filtro activo.
// - Scroll horizontal en móvil con snap.
// - Navega a la ruta actual preservando `q` y otros params.
// - Muestra un botón "Limpiar" sólo cuando hay filtros aplicados.

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryOption {
  slug: string
  label: string
  emoji: string
}

export function CategoryFilter({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const active = params.get("category") ?? null
  const query = params.get("q") ?? ""

  const setCategory = (slug: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (slug) next.set("category", slug)
    else next.delete("category")
    push(next)
  }

  function clearAll() {
    const next = new URLSearchParams(params.toString())
    next.delete("category")
    next.delete("q")
    push(next)
  }

  function push(next: URLSearchParams) {
    const qs = next.toString()
    const target = qs.length > 0 ? `${pathname}?${qs}` : pathname
    router.replace(target, { scroll: false })
  }

  const hasFilter = useMemo(() => active != null || query.length > 0, [active, query])

  return (
    <div className="sticky top-[64px] z-30 -mx-4 mb-6 border-b border-white/5 bg-background/85 px-4 backdrop-blur md:top-[80px]">
      <div className="flex items-center gap-2 py-3">
        <div
          className="no-scrollbar -mx-1 flex flex-1 snap-x snap-mandatory gap-2 overflow-x-auto px-1"
          role="tablist"
          aria-label="Filtrar por categoría"
        >
          <Pill
            label="Todo"
            active={active === null}
            onClick={() => setCategory(null)}
            ariaCurrent={active === null}
          />
          {categories.map((c) => (
            <Pill
              key={c.slug}
              label={`${c.emoji ? `${c.emoji} ` : ""}${c.label}`}
              active={active === c.slug}
              onClick={() => setCategory(c.slug)}
              ariaCurrent={active === c.slug}
            />
          ))}
        </div>
        {hasFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-white/10 px-2.5 text-xs font-medium transition-colors hover:border-white/30"
            aria-label="Limpiar filtros"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Pill({
  active,
  onClick,
  label,
  ariaCurrent,
}: {
  active: boolean
  onClick: () => void
  label: string
  ariaCurrent: boolean
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-current={ariaCurrent ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
        "min-h-[36px]", // touch target
        active
          ? "border-brand-red bg-brand-red/15 text-brand-red shadow-[0_0_0_3px_rgba(220,38,38,0.08)]"
          : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}
