"use client"

// Tarjeta de producto del catálogo. Reglas:
// - Si el producto tiene variantes, la acción rápida es "Elegir opciones"
//   y abre la PDP (no permite agregar al carrito sin elegir variante).
// - Si NO tiene variantes, la acción rápida es "Agregar" con qty=1.
// - Muestra badge "Oferta" sólo si `on_sale`. No tenemos `compare_at_price`
//   en el schema, así que tachamos como "antes" sólo si la categoría de
//   promoción lo permite (futuro: hook de compare-at-price).
// - Muestra "Últimas unidades" si stock <= 5 (visible) y "Sin stock" si 0.

import Link from "next/link"
import Image from "next/image"
import { Plus, ShoppingBag } from "lucide-react"
import { Button, ButtonLink } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { formatUYU } from "@/lib/format"
import { CATEGORY_LABELS, type Category } from "@/lib/constants"
import type { Product } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"
import { safeImageUrl } from "@/lib/safe-image"

const LOW_STOCK_THRESHOLD = 5

type ProductWithFlags = Product & {
  stock?: number | null
  on_sale?: boolean | null
  category_id?: string | null
}

export function ProductCard({
  product,
  hasVariants,
}: {
  product: ProductWithFlags
  hasVariants: boolean
}) {
  const addProduct = useCartStore((s) => s.addProduct)
  const image = safeImageUrl(product.images?.[0])
  // Sanitizar stock: parseInt con fallback para evitar NaN si la DB devuelve
  // string o null. Para productos con variantes, el stock top-level es un
  // derivado (suma); si viene en 0 pero hay variantes, el cliente debe ir
  // a la PDP para ver la disponibilidad real.
  const rawStock = typeof product.stock === "number" ? product.stock : Number.parseInt(String(product.stock ?? ""), 10)
  const safeStock = Number.isFinite(rawStock) && rawStock >= 0 ? rawStock : null
  const outOfStock = !hasVariants && safeStock != null && safeStock <= 0
  const lowStock = !hasVariants && safeStock != null && safeStock > 0 && safeStock <= LOW_STOCK_THRESHOLD
  const onSale = Boolean(product.on_sale)

  const actionLabel = hasVariants ? "Elegir opciones" : "Agregar"

  return (
    <div className="group bg-bg-titanium relative flex flex-col overflow-hidden rounded-xl border border-white/5 transition-all hover:border-white/15">
      <Link
        href={`/productos/${product.slug}`}
        className="bg-muted/30 relative block aspect-square overflow-hidden"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-1 text-xs">
            <ShoppingBag className="h-7 w-7 opacity-40" aria-hidden />
            <span>Sin imagen</span>
          </div>
        )}

        <span className="bg-background/80 text-foreground/80 absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase backdrop-blur">
          {CATEGORY_LABELS[product.category as Category] ?? product.category}
        </span>

        {onSale ? (
          <span className="absolute top-2 right-2 rounded-full bg-[#dc2626] px-2 py-0.5 text-[10px] font-bold tracking-wider text-black uppercase shadow-lg shadow-[#dc2626]/40">
            Oferta
          </span>
        ) : null}

        {outOfStock ? (
          <span
            aria-label="Sin stock"
            className="bg-background/85 text-foreground/80 absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase backdrop-blur"
          >
            Sin stock
          </span>
        ) : lowStock && safeStock != null ? (
          <span
            aria-label={`Últimas ${safeStock} unidades`}
            className="bg-amber-500/15 text-amber-300 absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
          >
            ¡Últimas {safeStock}!
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
          <div className="flex flex-col">
            <span className="font-display text-base font-bold">{formatUYU(product.price)}</span>
            {onSale ? (
              <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Precio oferta
              </span>
            ) : null}
          </div>

          {hasVariants ? (
            <ButtonLink
              href={`/productos/${product.slug}`}
              size="default"
              variant="outline"
              className="min-h-[44px] px-3 text-xs font-semibold"
              aria-label={`Elegir opciones para ${product.name}`}
            >
              {actionLabel}
            </ButtonLink>
          ) : (
            <Button
              size="icon-lg"
              variant="default"
              disabled={outOfStock}
              onClick={() => {
                if (outOfStock) return
                addProduct({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: image ?? undefined,
                  qty: 1,
                  stockCap: safeStock ?? undefined,
                })
              }}
              className={cn(
                "min-h-[44px] min-w-[44px]",
                !outOfStock && "bg-brand-red text-foreground hover:bg-[#ef4444]",
              )}
              aria-label={
                outOfStock
                  ? `${product.name} sin stock`
                  : `Agregar ${product.name} al carrito`
              }
            >
              {outOfStock ? (
                <ShoppingBag className="h-4 w-4 opacity-50" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
