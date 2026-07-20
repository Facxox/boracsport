"use client"

// Error boundary del checkout. Ofrece reintentar, volver al carrito y
// contactar por WhatsApp para no dejar al cliente sin salida si la
// página falla por algún motivo de red o de Supabase.

import { useEffect } from "react"
import { MessageCircle, RotateCcw } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"
import { WHATSAPP_NUMBER } from "@/lib/constants"

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[checkout] error boundary:", error)
  }, [error])

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, tuve un problema cargando el checkout. ¿Pueden ayudarme?")}`

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">
        No pudimos cargar el checkout
      </h1>
      <p className="text-muted-foreground max-w-md text-sm">
        Algo falló al cargar la página. Podés intentar de nuevo o escribirnos
        por WhatsApp para terminar el pedido.
      </p>
      {error.digest ? (
        <p className="text-muted-foreground text-[11px]">
          Código de error: <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-brand-red text-foreground hover:bg-[#ef4444] inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
        >
          <RotateCcw className="h-4 w-4" />
          Intentar de nuevo
        </button>
        <ButtonLink href="/carrito" variant="outline">
          Volver al carrito
        </ButtonLink>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card/60 text-foreground hover:bg-card inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold"
        >
          <MessageCircle className="h-4 w-4" />
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  )
}
