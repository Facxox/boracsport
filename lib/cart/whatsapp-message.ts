// Builder del mensaje pre-formateado para WhatsApp.

import type { CartItem } from "@/types/cart"
import { formatUYU } from "@/lib/format"
import { calcTotals } from "./totals"
import { siteConfig } from "@/lib/config/site"
import { getBaseUrl } from "@/lib/env"

export function buildWhatsAppMessage(
  items: CartItem[],
  customer: { name?: string; email?: string; phone?: string },
): string {
  const lines: string[] = []
  lines.push(`Hola ${siteConfig.name}, quiero coordinar un pedido:`)
  if (customer.name) lines.push(`— Nombre: ${customer.name}`)
  if (customer.email) lines.push(`— Email: ${customer.email}`)
  if (customer.phone) lines.push(`— Teléfono: ${customer.phone}`)

  const products = items.filter((i): i is Extract<CartItem, { kind: "product" }> => i.kind === "product")
  const designs = items.filter((i): i is Extract<CartItem, { kind: "design" }> => i.kind === "design")

  if (products.length > 0) {
    lines.push("— Productos:")
    for (const p of products) {
      lines.push(
        `  · ${p.qty}× ${p.name} (${formatUYU(p.price)} c/u) = ${formatUYU(p.price * p.qty)}`,
      )
    }
  }

  if (designs.length > 0) {
    lines.push("— Diseños 3D:")
    for (const d of designs) {
      const team = d.payload.templateName || "Diseño personalizado"
      const link = `${getBaseUrl()}/personalizar?design=${encodeURIComponent(d.designId)}`
      lines.push(`  · ${team} (${link})`)
    }
  }

  const { subtotal, total } = calcTotals(items)
  if (products.length > 0) {
    lines.push(`— Subtotal: ${formatUYU(subtotal)}`)
    lines.push(`— Total estimado: ${formatUYU(total)}`)
  }
  lines.push("")
  lines.push("¡Gracias!")

  return lines.join("\n")
}

export function buildWhatsAppUrl(
  items: CartItem[],
  customer: { name?: string; email?: string; phone?: string },
): string {
  const phone = siteConfig.social.whatsapp.replace(/^https?:\/\/wa\.me\//, "")
  const text = encodeURIComponent(buildWhatsAppMessage(items, customer))
  return `https://wa.me/${phone}?text=${text}`
}
