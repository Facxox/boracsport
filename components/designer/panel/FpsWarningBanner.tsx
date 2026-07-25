"use client"

// Banner de FPS bajos. Se muestra cuando el viewport reporta fps < umbral.
// El botón "No volver a mostrar" persiste la decisión en localStorage.
//
// El valor de fps se lee de una variable de módulo expuesta por
// `viewer/FpsMonitor.tsx` (no del store de Zustand, porque fps cambia ~60x/s
// y no queremos re-renderizar todo el árbol del diseñador).
//
// Mientras FpsMonitor no haya publicado ningún valor, el banner no se muestra.

import { useSyncExternalStore } from "react"
import { AlertTriangle, X } from "lucide-react"
import {
  isFpsWarningDismissed,
  setFpsWarningDismissed,
  useClientFlag,
} from "@/lib/designer/warnings"

const THRESHOLD = 30

// API expuesta por viewer/FpsMonitor. La registramos cuando el Scene monta.
let currentFps: number | null = null
const listeners = new Set<() => void>()

export function __setCurrentFps(next: number | null) {
  if (currentFps === next) return
  currentFps = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): number | null {
  return currentFps
}

function getServerSnapshot(): number | null {
  return null
}

export function FpsWarningBanner() {
  const ready = useClientFlag()
  const fps = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const dismissed = useSyncExternalStore(
    (l) => {
      // Nos suscribimos a `storage` events para reflejar cambios cross-tab.
      if (typeof window === "undefined") return () => {}
      window.addEventListener("storage", l)
      return () => window.removeEventListener("storage", l)
    },
    () => (typeof window === "undefined" ? false : isFpsWarningDismissed()),
    () => false,
  )

  if (!ready) return null
  if (fps == null) return null
  if (fps >= THRESHOLD) return null
  if (dismissed) return null

  return (
    <div
      role="alert"
      className="border-amber-500/40 bg-amber-500/10 text-amber-100/90 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs"
    >
      <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">
          Tu navegador está renderizando lento ({Math.round(fps)} fps).
        </p>
        <p className="text-amber-100/70 mt-0.5">
          Bajá la resolución de la ventana o cerrá otras pestañas. Si
          persiste, probá desde otro equipo.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setFpsWarningDismissed()}
        aria-label="No volver a mostrar"
        title="No volver a mostrar"
        className="text-amber-100/70 hover:text-amber-50 -mr-1 -mt-1 rounded p-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
