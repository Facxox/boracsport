"use client"

// Modal "¿Recuperar diseño?".
// Aparece en mount si hay un snapshot en `localStorage["borac-design-v1"]`
// y el store ya hidrató. Opciones: Recuperar o Empezar de cero.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDesignStore, useDesignHasHydrated } from "@/stores/design-store"
import { BORAC_DESIGN_STORAGE_KEY } from "@/lib/constants"

// Lee el snapshot de localStorage durante el render post-hidratación.
// Antes de hidratar devuelve false → no se renderiza el modal.
// Después de hidratar se ejecuta en cada render, pero como es idempotente
// (sólo verifica version === 1) no provoca renders extras.
function hasRecoverableSnapshot(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = window.localStorage.getItem(BORAC_DESIGN_STORAGE_KEY)
    if (!raw) return false
    const snapshot = JSON.parse(raw)
    const version = snapshot?.state?.version
    return version === 1 && Boolean(snapshot?.state)
  } catch {
    return false
  }
}

export function RecoverDesignModal() {
  const hydrated = useDesignHasHydrated()
  // `dismissed` se setea cuando el usuario elige "Empezar de cero" o
  // "Recuperar". Mientras no esté dismissed y haya snapshot, el modal está
  // abierto. Derivar durante el render (no en effect) cumple la regla
  // react-hooks/set-state-in-effect: la fuente de verdad es localStorage,
  // un sistema externo a React.
  const [dismissed, setDismissed] = useState(false)
  const open = hydrated && !dismissed && hasRecoverableSnapshot()

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) setDismissed(true) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Recuperar tu diseño anterior?</DialogTitle>
          <DialogDescription>
            Encontramos un diseño sin terminar en este navegador. Querés
            seguir donde lo dejaste o empezar de cero?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => discard(setDismissed)}>
            Empezar de cero
          </Button>
          <Button onClick={() => setDismissed(true)}>Recuperar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function discard(setDismissed: (b: boolean) => void) {
  // Reset sin pisar templateId porque todavía no sabemos si hay uno.
  useDesignStore.getState().reset(null)
  setDismissed(true)
}
