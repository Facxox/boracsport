// Badge unificado para representar un diseño personalizado en el carrito.
// Antes había dos variantes: el drawer usaba un ícono Sparkles + texto, y
// la página completa usaba "3D" en un cuadrado rojo. Esto provocaba
// inconsistencia visual entre los dos lados. Unificamos en un solo
// componente: badge ámbar con sparkles + texto "3D", escalable.

import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface DesignBadgeProps {
  /**
   * Tamaño: `sm` (drawer, compacto) o `md` (página completa).
   */
  size?: "sm" | "md"
  className?: string
}

export function DesignBadge({ size = "md", className }: DesignBadgeProps) {
  const isSm = size === "sm"
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10",
        isSm ? "h-14 w-14" : "h-16 w-16",
        className,
      )}
      aria-label="Diseño personalizado"
    >
      <div className="flex flex-col items-center gap-0.5">
        <Sparkles
          className={cn("text-amber-300", isSm ? "h-3.5 w-3.5" : "h-4 w-4")}
          aria-hidden
        />
        <span
          className={cn(
            "font-display font-extrabold text-amber-300",
            isSm ? "text-sm" : "text-lg",
          )}
        >
          3D
        </span>
      </div>
    </div>
  )
}
