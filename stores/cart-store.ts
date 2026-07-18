// Cart store con Zustand + persist.
// - hasHydrated flag para evitar SSR mismatch en el CartBadge.
// - partialize: NO persiste el flag _hasHydrated, solo los items.
// - Soporta items 'product' y 'design' (snapshot del iframe 3D).

"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CartItem, ProductLine, DesignLine } from "@/types/cart"
import type { ExpressDesignPayload } from "@/lib/designer/design-types"
import { FLAT_SHIPPING_UYU } from "@/lib/constants"

type AddProductInput = Omit<ProductLine, "kind" | "key"> & { qty?: number }

type CartState = {
  items: CartItem[]
  isOpen: boolean
  _hasHydrated: boolean

  open: () => void
  close: () => void
  toggle: () => void

  addProduct: (input: AddProductInput) => void
  addDesignSnapshot: (
    payload: ExpressDesignPayload,
    designId: string,
    editorUrl?: string,
  ) => void
  updateQty: (key: string, qty: number) => void
  removeItem: (key: string) => void
  clear: () => void

  _setHasHydrated: (b: boolean) => void
}

function makeKey(): string {
  return `k_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function previewLabelFromDesign(payload: ExpressDesignPayload): string {
  return payload.templateName || "Diseño personalizado"
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      addProduct: (input) =>
        set((state) => {
          const qty = input.qty ?? 1
          const variantId = input.variantId ?? null
          // Sin stockCap y sin variantId, no podemos limitar qty en UI → bloqueamos.
          // Productos legacy sin variantId quedan permitidos (cap = Infinity) para
          // no romper el flujo existente, pero los nuevos deben llegar con stockCap.
          const stockCap = input.stockCap
          if (stockCap != null && stockCap <= 0) {
            // Stock agotado: ignorar silenciosamente. UI ya debería deshabilitar
            // el botón; si llega acá es por bug o estado desincronizado.
            return state
          }
          // Dedupe por (id, variantId) — variantes distintas de un mismo
          // producto son líneas separadas.
          const existing = state.items.find(
            (it): it is ProductLine =>
              it.kind === "product" &&
              it.id === input.id &&
              (it.variantId ?? null) === variantId,
          )
          if (existing) {
            const cap = existing.stockCap ?? stockCap ?? Infinity
            const nextQty = Math.min(existing.qty + qty, cap)
            return {
              items: state.items.map((it) =>
                it.kind === "product" && it.key === existing.key
                  ? { ...it, qty: nextQty }
                  : it,
              ),
              isOpen: true,
            }
          }
          const initialQty = stockCap != null ? Math.min(qty, stockCap) : qty
          const line: ProductLine = {
            kind: "product",
            key: makeKey(),
            id: input.id,
            slug: input.slug,
            name: input.name,
            price: input.price,
            qty: initialQty,
            image: input.image,
            variantId,
            size: input.size,
            color: input.color,
            stockCap: stockCap ?? undefined,
          }
          return { items: [...state.items, line], isOpen: true }
        }),

      addDesignSnapshot: (payload, designId, editorUrl = "/personalizar") =>
        set((state) => {
          // Evitar duplicados por designId.
          if (
            state.items.some(
              (it) => it.kind === "design" && it.designId === designId,
            )
          ) {
            return { isOpen: true }
          }
          const line: DesignLine = {
            kind: "design",
            key: makeKey(),
            designId,
            payload,
            customPrice: 0,
            qty: 1,
            editorUrl,
            previewLabel: previewLabelFromDesign(payload),
          }
          return { items: [...state.items, line], isOpen: true }
        }),

      updateQty: (key, qty) =>
        set((state) => ({
          items: state.items
            .map((it) => {
              if (it.kind !== "product" || it.key !== key) return it
              // Si tenemos stockCap lo respetamos; si no, permitimos hasta 99
              // para productos legacy (en lugar de Infinity) como salvaguarda.
              const cap = it.stockCap ?? 99
              return { ...it, qty: Math.max(1, Math.min(qty, cap)) }
            }),
        })),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((it) => it.key !== key),
        })),

      clear: () => set({ items: [] }),

      _setHasHydrated: (b) => set({ _hasHydrated: b }),
    }),
    {
      name: "borac-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[cart] rehydrate failed, clearing corrupted storage:", error)
          try {
            localStorage.removeItem("borac-cart-v1")
          } catch {
            /* ignore */
          }
        }
        state?._setHasHydrated(true)
      },
    },
  ),
)

// Hook de hidratación: usar en componentes que dependen del carrito para
// evitar parpadeo / hydration mismatch.
export function useCartHasHydrated(): boolean {
  return useCartStore((s) => s._hasHydrated)
}

// Selectores derivados (puros, no memoizan — usar `useShallow` si hace falta).
export function selectSubtotal(items: CartItem[]): number {
  return items.reduce((acc, it) => {
    if (it.kind === "product") return acc + it.price * it.qty
    return acc
  }, 0)
}

export function selectCount(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + it.qty, 0)
}

export function selectTotal(items: CartItem[]): {
  subtotal: number
  shipping: number
  total: number
} {
  const subtotal = selectSubtotal(items)
  // Solo cobramos envío si hay productos físicos (los designs se coordinan aparte).
  const hasPhysical = items.some((it) => it.kind === "product")
  const shipping = hasPhysical ? FLAT_SHIPPING_UYU : 0
  return { subtotal, shipping, total: subtotal + shipping }
}
