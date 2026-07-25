"use client"

// Banner amarillo que se muestra cuando el patrón seleccionado es continuo
// (degradé). Sirve como aviso: en tela real los degradés generan cortes
// visibles; el usuario debería preferir un patrón con costuras.

import { Info } from "lucide-react"
import { useDesignStore } from "@/stores/design-store"
import { isPatternContinuous } from "@/lib/designer/warnings"

export function ContinuousPatternBanner() {
  const patternId = useDesignStore((s) => s.state.pattern.id)
  if (!isPatternContinuous(patternId)) return null

  return (
    <div
      role="status"
      className="border-amber-500/40 bg-amber-500/10 text-amber-100/90 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs"
    >
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        El patrón <strong>degradé</strong> se imprime con cortes visibles en
        la tela. Para producción preferí patrones con costuras (rayas,
        bastones, cuadros).
      </p>
    </div>
  )
}
