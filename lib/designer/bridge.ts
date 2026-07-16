// Puente postMessage que escucha los eventos del iframe del diseñador 3D.
//
// El iframe (public/disenador/index.html) ejecuta public/disenador/js/parent-comms.js
// que al hacer click en "Solicitar Cotización" envía:
//   { type: 'BORAC_DESIGN_COMPLETED', payload: <autosave snapshot> }
// a window.parent con targetOrigin: '*'.
//
// Este listener:
//  1. Valida origin (allowlist, con TODO para endurecer).
//  2. Valida el shape del payload.
//  3. Cap de tamaño para no romper la cuota de localStorage.
//  4. Agrega el diseño al carrito Zustand (con un designId nuevo).
//  5. Dispara toast de éxito.
//  6. Si el usuario está logueado, persiste el snapshot en boracsport.designs
//     (fire-and-forget, no bloquea la UI).

"use client"

import { toast } from "sonner"
import { useCartStore } from "@/stores/cart-store"
import type { ThreeDDesignPayload } from "@/lib/designer/design-types"
import { MAX_DESIGN_BYTES } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"

const MESSAGE_TYPE = "BORAC_DESIGN_COMPLETED" as const

function isValidPayload(value: unknown): value is ThreeDDesignPayload {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return v.version === 2 && typeof v.savedAt === "number" && typeof v.templateId === "string" && typeof v.templateVersion === "number" && typeof v.templateName === "string" && typeof v.baseColor === "string" && typeof v.previewUrl === "string" && Array.isArray(v.layers) && Array.isArray(v.logos)
}

function isTrustedOrigin(origin: string): boolean {
  if (origin === "null") return true // sandbox iframes
  if (origin === window.location.origin) return true
  // Dev convenience.
  if (origin.startsWith("http://localhost:")) return true
  if (origin.startsWith("http://127.0.0.1:")) return true
  // Allowlist explícita vía env (ej: dominio de prod o previews de Vercel).
  const allowed = [
    process.env.NEXT_PUBLIC_APP_URL?.trim(),
    process.env.NEXT_PUBLIC_SITE_URL?.trim(),
    process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL.trim()}` : undefined,
  ].filter((u): u is string => Boolean(u))
  for (const url of allowed) {
    try {
      const u = new URL(url)
      if (u.origin === origin) return true
    } catch {
      // ignore
    }
  }
  return false
}

function buildEditorUrl(designId: string): string {
  return `/personalizar?design=${encodeURIComponent(designId)}`
}

function generateDesignId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `design_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

async function persistDesignForUser(designId: string, payload: ThreeDDesignPayload) {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    await fetch("/api/disenos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ designId, payload }),
    }).catch(() => undefined)
  } catch {
    // Silenciar — el carrito local ya tiene el diseño.
  }
}

/**
 * Monta el listener de postMessage.
 * Devuelve una función de cleanup (segura para HMR).
 */
export function setupDesignerBridge(): () => void {
  const handler = (event: MessageEvent) => {
    if (!isTrustedOrigin(event.origin)) return

    const data = event.data as { type?: string; payload?: unknown } | null
    if (!data || data.type !== MESSAGE_TYPE) return

    if (!isValidPayload(data.payload)) {
      console.warn("[designer-bridge] payload inválido", data.payload)
      return
    }

    const payload = data.payload
    const blob = JSON.stringify(payload)
    if (blob.length > MAX_DESIGN_BYTES) {
      toast.error("El diseño es demasiado grande para guardarlo localmente")
      return
    }

    const designId = generateDesignId()
    const editorUrl = buildEditorUrl(designId)
    useCartStore
      .getState()
      .addDesignSnapshot(payload, designId, editorUrl)
    toast.success("Diseño agregado al carrito", {
      description: "Lo vas a ver en el panel lateral.",
    })

    // Persistir en Supabase si el usuario está logueado.
    void persistDesignForUser(designId, payload)
  }

  window.addEventListener("message", handler)
  return () => window.removeEventListener("message", handler)
}
