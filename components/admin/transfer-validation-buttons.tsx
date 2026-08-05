"use client"

// Botones para que el admin valide (o rechace) un comprobante de transferencia.
// La página padre pasa el orderId y los flags del estado actual; el componente
// resuelve el confirm + toast + server action por su cuenta.

import { useState, useTransition } from "react"
import { Check, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import {
  approveTransferPaymentAction,
  rejectTransferPaymentAction,
} from "@/app/admin/actions"
import { cn } from "@/lib/utils"

type Props = {
  orderId: string
  paymentStatus: "pendiente" | "aprobado" | "rechazado" | "reembolsado"
  /**
   * Compacto = sólo ícono de ticket, ocupa una fila. Default = ancho completo.
   * Usar en listas; usar `variant="full"` en la página de detalle.
   */
  variant?: "compact" | "full"
}

export function TransferValidationButtons({
  orderId,
  paymentStatus,
  variant = "full",
}: Props) {
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null)

  function handleApprove() {
    if (
      !confirm(
        "¿Aprobar el comprobante de transferencia? El pedido pasará a 'Confirmado'.",
      )
    ) {
      return
    }
    setBusy("approve")
    startTransition(async () => {
      try {
        await approveTransferPaymentAction(orderId)
        toast.success("Pago aprobado. Pedido confirmado.")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "No se pudo aprobar el pago",
        )
      } finally {
        setBusy(null)
      }
    })
  }

  function handleReject() {
    if (
      !confirm(
        "¿Rechazar el comprobante? El cliente deberá subir uno nuevo para seguir.",
      )
    ) {
      return
    }
    setBusy("reject")
    startTransition(async () => {
      try {
        await rejectTransferPaymentAction(orderId)
        toast.success("Pago rechazado. Pedido sigue pendiente.")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "No se pudo rechazar el pago",
        )
      } finally {
        setBusy(null)
      }
    })
  }

  const disabled = pending || paymentStatus === "aprobado"

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleApprove}
          disabled={disabled}
          aria-label="Aprobar pago"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border transition",
            "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
            "hover:bg-emerald-500/20",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {busy === "approve" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={pending || paymentStatus === "rechazado"}
          aria-label="Rechazar pago"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border transition",
            "border-red-500/40 bg-red-500/10 text-red-300",
            "hover:bg-red-500/20",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {busy === "reject" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition",
          "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/40",
          "hover:bg-emerald-500/25",
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {busy === "approve" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Aprobar pago
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={pending || paymentStatus === "rechazado"}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition",
          "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-400/40",
          "hover:bg-red-500/20",
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {busy === "reject" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
        Rechazar pago
      </button>
      {paymentStatus === "aprobado" ? (
        <span className="text-emerald-300/80 text-xs">Pago ya aprobado</span>
      ) : paymentStatus === "rechazado" ? (
        <span className="text-red-300/80 text-xs">Pago rechazado</span>
      ) : null}
    </div>
  )
}
