// Helpers puros de totales del carrito (server-safe).

import type { CartItem } from "@/types/cart"
import { FLAT_SHIPPING_UYU } from "@/lib/constants"

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((acc, it) => {
    if (it.kind === "product") return acc + it.price * it.qty
    return acc
  }, 0)
}

export function calcShipping(items: CartItem[]): number {
  // Solo cobramos envío si hay productos físicos.
  const hasPhysical = items.some((it) => it.kind === "product")
  return hasPhysical ? FLAT_SHIPPING_UYU : 0
}

export function calcTotals(items: CartItem[]) {
  const subtotal = calcSubtotal(items)
  const shipping = calcShipping(items)
  return { subtotal, shipping, total: subtotal + shipping }
}
