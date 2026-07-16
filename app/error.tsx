"use client"

import { useEffect } from "react"
import { Button, ButtonLink } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[app/error]", error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-3xl font-extrabold">
        Algo salió mal
      </p>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Tuvimos un problema procesando tu solicitud. Podés intentar de nuevo o
        volver al inicio.
      </p>
      {error.digest && (
        <p className="text-muted-foreground/70 mt-1 font-mono text-xs">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <ButtonLink href="/" variant="outline">
          Volver al inicio
        </ButtonLink>
      </div>
    </div>
  )
}
