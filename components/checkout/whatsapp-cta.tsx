"use client"

import { useState } from "react"
import { Loader2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildWhatsAppUrl } from "@/lib/cart/whatsapp-message"
import type { CartItem } from "@/types/cart"

type Props = {
  cart: { items: CartItem[] }
  customerName: string
  customerEmail?: string
  customerPhone?: string
  className?: string
  label?: string
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
}

export function WhatsAppCTA({ cart, customerName, customerEmail, customerPhone, className, label = "Coordinar por WhatsApp", variant = "default" }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart.items, paymentMethod: "whatsapp", customer: { name: customerName, email: customerEmail, phone: customerPhone } }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "No se pudo registrar el pedido")
      const url = buildWhatsAppUrl(cart.items, { name: customerName || undefined, email: customerEmail, phone: customerPhone }) + `&order=${encodeURIComponent(result.orderId)}`
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo registrar el pedido")
    } finally {
      setLoading(false)
    }
  }

  return <div className="space-y-2"><Button type="button" onClick={onClick} disabled={loading} variant={variant} className={className}><MessageCircle className="mr-2 h-4 w-4" />{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registrando…</> : label}</Button>{error && <p className="text-sm text-red-400" role="alert">{error}</p>}</div>
}
