"use client"

// Componentes que agrupan líneas del carrito en secciones:
// - ProductSection: productos físicos (precio, qty, variantes).
//
// Se usan tanto en /carrito como en el drawer para mantener una única
// presentación visual.

import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUYU } from "@/lib/format"
import { safeImageUrl } from "@/lib/safe-image"
import type { CartItem, ProductLine } from "@/types/cart"

interface CartItemBaseProps {
  onRemove: (key: string) => void
}

export function ProductSection({
  items,
  onRemove,
  onUpdateQty,
}: {
  items: ProductLine[]
  onRemove: CartItemBaseProps["onRemove"]
  onUpdateQty: (key: string, qty: number) => void
}) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="cart-products-heading" className="space-y-3">
      <header className="flex items-baseline justify-between gap-2">
        <h3
          id="cart-products-heading"
          className="text-foreground/90 text-xs font-semibold tracking-wider uppercase"
        >
          Productos
        </h3>
        <span className="text-muted-foreground text-xs">
          {items.length} {items.length === 1 ? "ítem" : "ítems"}
        </span>
      </header>
      <ul className="space-y-3">
        {items.map((it) => (
          <ProductCard
            key={it.key}
            item={it}
            onRemove={onRemove}
            onUpdateQty={onUpdateQty}
          />
        ))}
      </ul>
    </section>
  )
}

export function splitCartItems(items: CartItem[]) {
  const products: ProductLine[] = []
  for (const it of items) {
    if (it.kind === "product") products.push(it)
  }
  return { products }
}

function ProductCard({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: ProductLine
  onRemove: CartItemBaseProps["onRemove"]
  onUpdateQty: (key: string, qty: number) => void
}) {
  const variantLabel = [item.size, item.color].filter(Boolean).join(" · ")
  const image = safeImageUrl(item.image)
  return (
    <li className="bg-card flex items-start gap-4 rounded-xl border border-white/5 p-4">
      <div className="bg-muted/30 relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {image ? (
          <Image
            src={image}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <ShoppingBag className="text-muted-foreground h-5 w-5" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{item.name}</p>
        {variantLabel ? (
          <p className="text-muted-foreground text-sm">{variantLabel}</p>
        ) : null}
        <p className="text-muted-foreground text-sm">{formatUYU(item.price)} c/u</p>
        <div className="mt-2 flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onUpdateQty(item.key, Math.max(1, item.qty - 1))}
            aria-label={`Restar una unidad de ${item.name}`}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={item.stockCap != null && item.qty >= item.stockCap}
            onClick={() => onUpdateQty(item.key, item.qty + 1)}
            aria-label={`Sumar una unidad de ${item.name}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          {item.stockCap != null ? (
            <span className="text-muted-foreground ml-1 text-xs">
              / {item.stockCap} disp.
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-semibold">{formatUYU(item.price * item.qty)}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.key)}
          aria-label={`Eliminar ${item.name}`}
          className="hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  )
}

export function summarizeCart(items: CartItem[]) {
  const { products } = splitCartItems(items)
  const subtotal = products.reduce((acc, it) => acc + it.price * it.qty, 0)
  const hasPhysical = products.length > 0
  // El envío se coordina aparte: no se suma al total en línea.
  const shipping = 0
  const total = subtotal
  return { products, subtotal, shipping, total, hasPhysical }
}

