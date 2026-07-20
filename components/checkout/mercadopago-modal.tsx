"use client"

import { useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { selectTotal, useCartStore } from "@/stores/cart-store"
import { computeCartHash, rememberOrder } from "@/lib/cart/hash"
import { formatUYU } from "@/lib/format"

export function MercadoPagoModal({
  open,
  onOpenChange,
  customer,
  forceNew = false,
}: {
  open: boolean
  onOpenChange: (b: boolean) => void
  customer?: { name: string; email: string; phone: string }
  /**
   * Bug 1.3: si el cliente repite el mismo carrito en <5min, el server
   * dedupe por cartHash. Permitimos forzar "es un pedido nuevo" para no
   * pisar la orden anterior.
   */
  forceNew?: boolean
}) {
  const items = useCartStore((state) => state.items)
  const totals = selectTotal(items)
  const hasDesign = items.some((it) => it.kind === "design")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onPay() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const cartHash = computeCartHash(items)
      const response = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer, cartHash, forceNew }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        error?: string
        initPoint?: string
        orderId?: string
      }
      if (!response.ok || !data.initPoint) {
        throw new Error(data.error || "No se pudo iniciar Mercado Pago")
      }
      if (data.orderId) rememberOrder(data.orderId, cartHash, "mercadopago")
      window.location.assign(data.initPoint)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo iniciar el pago")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Mercado Pago (UYU)</DialogTitle>
          <DialogDescription>
            Te llevamos a la pasarela oficial para completar el pago.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-card/60 space-y-3 rounded-lg border border-white/5 p-4 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-muted-foreground">Total a pagar ahora</span>
            <span className="text-brand-red font-display text-2xl font-extrabold">
              {formatUYU(totals.total)}
            </span>
          </div>
          {hasDesign ? (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
              Este pedido tiene diseños personalizados. Necesitamos coordinar el precio antes de cobrar el total final.
            </p>
          ) : null}
          <p className="text-muted-foreground text-xs">
            Al confirmar te redirigimos a Mercado Pago. Cuando vuelvas vas a ver el resultado del pago en pantalla y te enviamos un email con el comprobante.
          </p>
        </div>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Pago procesado por Mercado Pago.
          </p>
          <div className="flex flex-1 gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-[44px] flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void onPay()}
              disabled={loading}
              className="min-h-[44px] flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando
                </>
              ) : (
                "Ir a Mercado Pago"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
