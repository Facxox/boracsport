"use client"

import { useSearchParams } from "next/navigation"
import { useCartStore } from "@/stores/cart-store"
import { useCartHasHydrated } from "@/stores/cart-store"
import { Button, ButtonLink } from "@/components/ui/button"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"

export function PersonalizarTopBar() {
  const searchParams = useSearchParams()
  const designId = searchParams.get("design")
  const cartCount = useCartStore((s) =>
    s.items.reduce((acc, it) => acc + it.qty, 0),
  )
  const hasHydrated = useCartHasHydrated()
  const openCart = useCartStore((s) => s.open)

  return (
    <div className="absolute top-0 right-0 left-0 z-50 flex items-center justify-between gap-2 bg-gradient-to-b from-black/80 to-transparent p-3 backdrop-blur-sm md:p-4">
      <ButtonLink
        href="/"
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/10"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        <span className="hidden sm:inline">Volver a la tienda</span>
        <span className="sm:hidden">Salir</span>
      </ButtonLink>
      <div className="flex items-center gap-2">
        {designId && (
          <span className="hidden rounded-full border border-white/20 bg-black/50 px-3 py-1 font-mono text-xs text-white/80 md:inline">
            Diseño #{designId.slice(0, 8)}
          </span>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={openCart}
          className="relative bg-white/10 text-white hover:bg-white/20"
        >
          <ShoppingBag className="mr-1.5 h-4 w-4" />
          Carrito
          {hasHydrated && cartCount > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1.5 text-xs font-bold text-white">
              {cartCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
