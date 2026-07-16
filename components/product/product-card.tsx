"use client"

import Link from "next/link"
import { Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { formatUYU } from "@/lib/format"
import { CATEGORY_LABELS, type Category } from "@/lib/constants"
import type { Product } from "@/lib/supabase/types"

function safeImageUrl(u: unknown): string | null {
  if (typeof u !== "string" || u.length === 0 || u.length > 2048) return null
  try {
    const url = new URL(u, "https://placeholder.local")
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return u
  } catch {
    return null
  }
}

export function ProductCard({ product }: { product: Product }) {
  const addProduct = useCartStore((s) => s.addProduct)
  const image = safeImageUrl(product.images?.[0])

  return (
    <div className="group bg-bg-titanium relative flex flex-col overflow-hidden rounded-xl border border-white/5 transition-all hover:border-white/15">
      <Link
        href={`/productos/${product.slug}`}
        className="bg-muted/30 relative block aspect-square overflow-hidden"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
            Sin imagen
          </div>
        )}
        <span className="bg-background/80 text-foreground/80 absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase backdrop-blur">
          {CATEGORY_LABELS[product.category as Category] ?? product.category}
        </span>
        {product.on_sale ? (
          <span className="absolute top-2 right-2 rounded-full bg-[#dc2626] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg shadow-[#dc2626]/40">
            Oferta
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={`/productos/${product.slug}`}
          className="hover:text-brand-red line-clamp-2 text-sm font-semibold"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="font-display text-base font-bold">
            {formatUYU(product.price)}
          </span>
          <Button
            size="sm"
            onClick={() =>
              addProduct({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image,
                qty: 1,
              })
            }
            className="h-8 px-2.5"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus className="h-3.5 w-3.5" />
            <ShoppingBag className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
