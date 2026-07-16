"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface CategoryOption {
  slug: string
  label: string
  emoji: string
}

export function CategoryFilter({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const active = params.get("category") ?? null

  const setCategory = (slug: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (slug) next.set("category", slug)
    else next.delete("category")
    router.replace(`/?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="sticky top-[80px] z-30 -mx-4 mb-6 border-b border-white/5 bg-background/85 px-4 backdrop-blur md:top-[88px]">
      <div className="no-scrollbar flex gap-2 overflow-x-auto py-3">
        <Pill active={active === null} onClick={() => setCategory(null)} label="Todo" />
        {categories.map((c) => (
          <Pill
            key={c.slug}
            active={active === c.slug}
            onClick={() => setCategory(c.slug)}
            label={`${c.emoji ? `${c.emoji} ` : ""}${c.label}`}
          />
        ))}
      </div>
    </div>
  )
}

function Pill({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all " +
        (active
          ? "border-brand-red bg-brand-red/15 text-brand-red shadow-[0_0_0_3px_rgba(255,90,0,0.08)]"
          : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground")
      }
    >
      {label}
    </button>
  )
}