"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"

export function MercadoPagoModal({ open, onOpenChange, customer }: { open: boolean; onOpenChange: (b: boolean) => void; customer?: { name: string; email: string; phone: string } }) {
  const items = useCartStore((state) => state.items)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onPay() {
    if (loading) return
    setLoading(true); setError(null)
    try {
      const response = await fetch("/api/checkout/mercadopago", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, customer }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.initPoint) throw new Error(data.error || "No se pudo iniciar Mercado Pago")
      window.location.assign(data.initPoint)
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo iniciar el pago") } finally { setLoading(false) }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle className="font-display">Mercado Pago (UYU)</DialogTitle><DialogDescription>Vas a pagar con Mercado Pago Uruguay.</DialogDescription></DialogHeader><div className="bg-card/60 rounded-lg border border-white/5 p-4 text-sm"><p className="text-muted-foreground">El pedido se registra y luego te redirigimos a la pasarela segura.</p></div>{error && <p className="text-sm text-red-400" role="alert">{error}</p>}<div className="flex gap-2"><Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cerrar</Button><Button onClick={() => void onPay()} disabled={loading} className="flex-1">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando</> : "Pagar con Mercado Pago"}</Button></div></DialogContent></Dialog>
}
