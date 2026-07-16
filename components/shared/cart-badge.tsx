"use client"

import { useCartHasHydrated, useCartStore } from "@/stores/cart-store"

export function CartBadge() {
  const count = useCartStore((s) =>
    s.items.reduce((acc, it) => acc + it.qty, 0),
  )
  const hasHydrated = useCartHasHydrated()
  if (!hasHydrated) return null
  if (count === 0) return null
  return (
    <span className="bg-brand-red text-foreground inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
      {count}
    </span>
  )
}
