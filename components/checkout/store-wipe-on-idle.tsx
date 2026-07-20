"use client"

// Bug 5.2: hard隐私 en dispositivos compartidos. Si el usuario cierra la
// pestaña o abandona el navegador sin desloguearse explícitamente, el
// SignOutCleanup no se dispara. Este componente limpia cart-store y
// customer-store después de 30 minutos continuos en `visibilityState =
// 'hidden'`. Si el usuario vuelve antes, el timer se cancela.
//
// Detalles:
// - 30 min es un balance entre privacidad y tolerar pausas reales
//   (reuniones, almuerzo).
// - Solo escucha `visibilitychange`; no tocamos `beforeunload` para no
//   ser agresivos con un refresh rápido.
// - Idempotente: si ya estaba vacío, clear() no rompe nada.

import { useEffect } from "react"
import { useCartStore } from "@/stores/cart-store"
import { useCustomerStore } from "@/stores/customer-store"

const IDLE_THRESHOLD_MS = 30 * 60 * 1000

export function StoreWipeOnIdle() {
  useEffect(() => {
    if (typeof document === "undefined") return
    let hiddenAt: number | null = null
    let timer: ReturnType<typeof setTimeout> | null = null

    function wipe() {
      try {
        useCartStore.getState().clear()
      } catch {
        /* ignore */
      }
      try {
        useCustomerStore.getState().clearProfile()
      } catch {
        /* ignore */
      }
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        if (hiddenAt == null) hiddenAt = Date.now()
        if (timer == null) {
          timer = setTimeout(() => {
            wipe()
            hiddenAt = null
            timer = null
          }, IDLE_THRESHOLD_MS)
        }
      } else {
        // visible otra vez: cancelamos el timer.
        if (timer != null) {
          clearTimeout(timer)
          timer = null
        }
        hiddenAt = null
      }
    }

    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      if (timer != null) clearTimeout(timer)
    }
  }, [])

  return null
}
