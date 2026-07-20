"use client"

// Input de búsqueda visible para el catálogo y (opcionalmente) el header.
// Lee y escribe el parámetro `?q=` preservando el resto de la query
// (categoría, etc.). Debounce corto para no spamear la navegación.
// Usamos `startTransition` para que la sincronización desde la URL
// (back/forward) no se considere set-state síncrono dentro de un effect.

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

const DEBOUNCE_MS = 250

export function ProductSearch({
  className,
  placeholder = "Buscar productos…",
  autoFocus = false,
}: {
  className?: string
  placeholder?: string
  autoFocus?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [, startTransition] = useTransition()

  const initial = params.get("q") ?? ""
  const [value, setValue] = useState(initial)

  // Sincronizar el input cuando la URL cambia desde fuera (back/forward).
  // startTransition marca la actualización como no urgente.
  useEffect(() => {
    startTransition(() => {
      setValue((prev) => (prev === initial ? prev : initial))
    })
  }, [initial, startTransition])

  // Debounce para escribir el query en la URL.
  useEffect(() => {
    if (value === initial) return
    const handle = setTimeout(() => {
      const next = new URLSearchParams(params.toString())
      if (value.trim().length > 0) next.set("q", value.trim())
      else next.delete("q")
      const qs = next.toString()
      router.replace(qs.length > 0 ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, DEBOUNCE_MS)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function clear() {
    setValue("")
    const next = new URLSearchParams(params.toString())
    next.delete("q")
    const qs = next.toString()
    router.replace(qs.length > 0 ? `${pathname}?${qs}` : pathname, { scroll: false })
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar productos"
        className="bg-card/60 focus:border-brand-red focus:ring-brand-red/40 h-10 w-full rounded-lg border border-white/10 pr-9 pl-8 text-sm transition-colors outline-none focus:ring-2"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpiar búsqueda"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
