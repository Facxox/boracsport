"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"

type Props = {
  product: {
    id: string
    slug: string
    name: string
    price: number
    image?: string
  }
}

export function AddToCartButton({ product }: Props) {
  const addProduct = useCartStore((s) => s.addProduct)
  return (
    <Button
      size="lg"
      className="bg-brand-red text-foreground hover:bg-[#ef4444] w-full sm:w-auto"
      onClick={() => addProduct({ ...product, qty: 1 })}
    >
      <ShoppingBag className="mr-2 h-4 w-4" />
      Agregar al carrito
    </Button>
  )
}
