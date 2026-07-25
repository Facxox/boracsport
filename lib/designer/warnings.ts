"use client"

import type { PatternId } from "@/lib/designer/types"

// Patrones que generan cortes visuales si se imprimen en tela real.
// Sirve para mostrar un banner amarillo cuando el usuario los selecciona.
export function isPatternContinuous(p: PatternId): boolean {
  return p === "gradient"
}

const STORAGE_KEY = "borac-fps-warning-dismissed-v1"

export function isFpsWarningDismissed(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function setFpsWarningDismissed(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, "1")
  } catch {
    /* ignore */
  }
}

// Hook para que `PatternGrid` sepa en render si debe mostrar el banner.
// La fuente de verdad es localStorage, un sistema externo a React, por
// lo que derivamos durante el render (no en effect).
export function useIsPatternContinuous(p: PatternId): boolean {
  return isPatternContinuous(p)
}

// Hook genérico de hidratación para componentes que dependen de
// localStorage y deben evitar SSR mismatch. Lee durante el render
// después de que el guard typeof window se cumpla.
export function useClientFlag(): boolean {
  return typeof window !== "undefined"
}
