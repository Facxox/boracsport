"use client"

// Hash determinístico del contenido del carrito. Se usa como
// "cart_hash" para evitar crear pedidos duplicados cuando el cliente
// pasa por WhatsApp y después por Mercado Pago (o viceversa) con el
// mismo carrito.
//
// Hash simple no criptográfico — sólo necesitamos identificar igualdad.

import type { CartItem } from "@/types/cart"

export function computeCartHash(items: CartItem[]): string {
  const normalized = items
    .map((it) => {
      if (it.kind === "product") {
        return `p:${it.id}|v:${it.variantId ?? ""}|q:${it.qty}`
      }
      return `d:${it.designId}`
    })
    .sort()
  return `${items.length}:${normalized.join(";")}`
}

const KEY_PREFIX = "borac-cart-hash-"
const ORDER_KEY = "borac-last-order"

type StoredOrder = {
  orderId: string
  cartHash: string
  paymentMethod: string
  ts: number
}

export function rememberOrder(orderId: string, cartHash: string, paymentMethod: string) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(
      ORDER_KEY,
      JSON.stringify({ orderId, cartHash, paymentMethod, ts: Date.now() }),
    )
  } catch {
    /* ignore */
  }
}

export function getRememberedOrder(): StoredOrder | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(ORDER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredOrder
    if (typeof parsed.orderId !== "string" || typeof parsed.cartHash !== "string") return null
    return parsed
  } catch {
    return null
  }
}

export function clearRememberedOrder() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(ORDER_KEY)
  } catch {
    /* ignore */
  }
}

export { KEY_PREFIX }
