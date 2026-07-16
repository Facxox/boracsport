"use client"

import { useEffect } from "react"
import { setupDesignerBridge } from "@/lib/designer/bridge"

type Props = {
  /** Default: /disenador/index.html?embedded=1 */
  src?: string
  className?: string
}

export function DesignerIframe({
  src = "/disenador/index.html?embedded=1",
  className,
}: Props) {
  useEffect(() => {
    return setupDesignerBridge()
  }, [])

  return (
    <div className={className ?? "h-screen w-full overflow-hidden bg-black"}>
      <iframe
        src={src}
        title="Configurador 3D Borac Sport"
        // Sandbox: allow-same-origin es OBLIGATORIO para que el iframe
        // pueda escribir en su propio localStorage.
        sandbox="allow-scripts allow-same-origin allow-forms"
        allow="clipboard-read; clipboard-write"
        scrolling="no"
        className="h-full w-full border-0"
      />
    </div>
  )
}
