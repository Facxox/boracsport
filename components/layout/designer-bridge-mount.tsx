"use client"

import { useEffect } from "react"
import { setupDesignerBridge } from "@/lib/designer/bridge"

/**
 * Componente "no-op" que monta el listener global de postMessage
 * una sola vez en el layout raíz. Cleanup en unmount (HMR-safe).
 */
export function DesignerBridgeMount() {
  useEffect(() => {
    return setupDesignerBridge()
  }, [])
  return null
}
