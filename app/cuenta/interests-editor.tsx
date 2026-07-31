"use client"

// Editor inline de intereses para "Mi cuenta".
// Lista las categorías activas y permite tildar/destildar.
// Persiste vía server action updateInteresesAction.

import { useState, useTransition } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateInteresesAction } from "./actions"

interface Category {
  id: string
  slug: string
  label: string
  emoji: string
  description: string | null
}

export function InterestsEditor({
  categories,
  initialSelected,
}: {
  categories: Category[]
  initialSelected: string[]
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [pending, startTransition] = useTransition()
  const [dirty, setDirty] = useState(false)

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      setDirty(
        next.length !== initialSelected.length ||
          next.some((s) => !initialSelected.includes(s)),
      )
      return next
    })
  }

  function onSave() {
    startTransition(async () => {
      const formData = new FormData()
      for (const slug of selected) formData.append("intereses", slug)
      const result = await updateInteresesAction(formData)
      if (!result.ok) {
        toast.error(result.error === "unauthenticated" ? "Iniciá sesión de nuevo" : result.error)
        return
      }
      toast.success("Intereses actualizados")
      setDirty(false)
    })
  }

  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground mt-2 text-sm">
        Aún no hay categorías activas para elegir.
      </p>
    )
  }

  return (
    <div className="mt-3 grid gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map((c) => {
          const isSelected = selected.includes(c.slug)
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => toggle(c.slug)}
              aria-pressed={isSelected}
              className={
                "relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors " +
                (isSelected
                  ? "border-[#dc2626] bg-brand-red/5"
                  : "border-white/10 hover:border-white/25")
              }
            >
              <span className="text-2xl" aria-hidden>
                {c.emoji || "✨"}
              </span>
              <span className="text-sm font-semibold">{c.label}</span>
              {c.description ? (
                <span className="text-muted-foreground text-xs leading-snug">
                  {c.description}
                </span>
              ) : null}
              {isSelected ? (
                <span
                  aria-hidden
                  className="bg-brand-red text-foreground absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full"
                >
                  <Check className="h-3 w-3" />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      <div className="flex items-center justify-end gap-2">
        {dirty ? (
          <span className="text-muted-foreground text-xs">Tenés cambios sin guardar.</span>
        ) : null}
        <Button
          type="button"
          onClick={onSave}
          disabled={!dirty || pending}
          className="bg-brand-red text-foreground hover:bg-[#ef4444]"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar intereses"
          )}
        </Button>
      </div>
    </div>
  )
}
