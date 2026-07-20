"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button, ButtonLink } from "@/components/ui/button"
import { DesignBadge } from "@/components/ui/design-badge"
import { Separator } from "@/components/ui/separator"
import {
  useCartHasHydrated,
  useCartStore,
} from "@/stores/cart-store"
import { formatUYU } from "@/lib/format"
import { FLAT_SHIPPING_UYU } from "@/lib/constants"
import { safeImageUrl } from "@/lib/safe-image"
import { WhatsAppCTA } from "@/components/checkout/whatsapp-cta"
import { ProductSection, DesignSection, summarizeCart } from "@/components/checkout/cart-sections"

function DrawerProductRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: import("@/types/cart").ProductLine
  onUpdate: (key: string, qty: number) => void
  onRemove: (key: string) => void
}) {
  const variantLabel = [item.size, item.color].filter(Boolean).join(" · ")
  const image = safeImageUrl(item.image)
  return (
    <li className="bg-bg-titanium flex items-start gap-3 rounded-lg border border-white/5 p-3">
      <div className="bg-background relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/5">
        {image ? (
          <Image src={image} alt={item.name} fill sizes="56px" className="object-cover" />
        ) : (
          <ShoppingBag className="text-muted-foreground h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        {variantLabel ? (
          <p className="text-muted-foreground text-xs">{variantLabel}</p>
        ) : null}
        <p className="text-muted-foreground text-xs">{formatUYU(item.price)} c/u</p>
        <div className="mt-2 flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdate(item.key, Math.max(1, item.qty - 1))}
            aria-label={`Restar una unidad de ${item.name}`}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={item.stockCap != null && item.qty >= item.stockCap}
            onClick={() => onUpdate(item.key, item.qty + 1)}
            aria-label={`Sumar una unidad de ${item.name}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          {item.stockCap != null && item.qty >= item.stockCap ? (
            <span className="text-amber-400 ml-1 text-[10px]">stock máx.</span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-sm font-semibold">{formatUYU(item.price * item.qty)}</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8 hover:text-red-400"
          onClick={() => onRemove(item.key)}
          aria-label={`Eliminar ${item.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  )
}

function DrawerDesignRow({
  item,
  onRemove,
  onClose,
}: {
  item: import("@/types/cart").DesignLine
  onRemove: (key: string) => void
  onClose: () => void
}) {
  return (
    <li className="bg-bg-titanium flex items-start gap-3 rounded-lg border border-amber-500/20 p-3">
      <DesignBadge size="sm" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.previewLabel}</p>
        <p className="text-muted-foreground text-xs">Diseño a coordinar</p>
        <Link
          href={item.editorUrl}
          onClick={onClose}
          className="text-brand-red mt-1 inline-block text-xs underline-offset-2 hover:underline"
        >
          Volver al editor
        </Link>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-amber-300 text-[10px] font-semibold tracking-wider uppercase">
          A coordinar
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8 hover:text-red-400"
          onClick={() => onRemove(item.key)}
          aria-label={`Eliminar ${item.previewLabel}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  )
}

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const hasHydrated = useCartHasHydrated()
  const [confirmClear, setConfirmClear] = useState(false)

  const summary = summarizeCart(items)
  const empty = items.length === 0

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-white/5 px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4" />
              Tu carrito
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Cerrar"
              className="-mr-1 min-h-[44px] min-w-[44px]"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {!hasHydrated ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : empty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="text-muted-foreground mb-3 h-10 w-10" />
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                Diseñá tu camiseta en 3D o elegí un producto de la tienda.
              </p>
              <ButtonLink href="/productos" onClick={close} className="mt-5">
                Ver productos
              </ButtonLink>
            </div>
          ) : (
            <>
              {summary.products.length > 0 ? (
                <section>
                  <h3 className="text-foreground/90 mb-2 text-[11px] font-semibold tracking-wider uppercase">
                    Productos
                  </h3>
                  <ul className="space-y-2">
                    {summary.products.map((it) => (
                      <DrawerProductRow
                        key={it.key}
                        item={it}
                        onUpdate={updateQty}
                        onRemove={removeItem}
                      />
                    ))}
                  </ul>
                </section>
              ) : null}

              {summary.designs.length > 0 ? (
                <section>
                  <h3 className="text-foreground/90 mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
                    <Sparkles className="h-3 w-3" />
                    Diseños personalizados
                  </h3>
                  <ul className="space-y-2">
                    {summary.designs.map((it) => (
                      <DrawerDesignRow
                        key={it.key}
                        item={it}
                        onRemove={removeItem}
                        onClose={close}
                      />
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>

        {!empty ? (
          <div className="border-t border-white/5 px-5 py-4">
            <dl className="mb-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal productos</dt>
                <dd className="font-semibold">{formatUYU(summary.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className={summary.hasPhysical ? "font-semibold" : "text-white/60"}>
                  {summary.hasPhysical ? formatUYU(FLAT_SHIPPING_UYU) : "Gratis"}
                </dd>
              </div>
              {summary.designs.length > 0 ? (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Diseños a coordinar</dt>
                  <dd className="text-amber-300 font-semibold">Por WhatsApp</dd>
                </div>
              ) : null}
            </dl>
            <Separator className="mb-3" />
            <div className="mb-3 flex items-baseline justify-between text-base">
              <span className="font-semibold">Total estimado</span>
              <span className="text-brand-red font-extrabold">
                {formatUYU(summary.total)}
              </span>
            </div>
            <p className="text-muted-foreground mb-4 text-[11px]">
              {summary.hasPhysical
                ? `Envío estándar a todo Uruguay: ${formatUYU(FLAT_SHIPPING_UYU)}.`
                : "El envío se coordina según el tipo de pedido."}
            </p>
            {confirmClear ? (
              <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs">
                <p className="mb-2">¿Vaciar los {items.length} ítems?</p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmClear(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      clear()
                      setConfirmClear(false)
                    }}
                  >
                    Sí, vaciar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="text-muted-foreground hover:text-red-400 mb-3 text-xs underline-offset-2 hover:underline"
              >
                Vaciar carrito
              </button>
            )}
            <div className="flex flex-col gap-2">
              <ButtonLink href="/checkout" onClick={close} className="w-full">
                Ir al checkout
              </ButtonLink>
              <WhatsAppCTA
                cart={{ items }}
                customerName=""
                variant="outline"
                className="w-full"
                label="Coordinar por WhatsApp"
              />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

// Re-exports para no romper tree-shaking de los componentes anteriores
// (ProductSection / DesignSection / summarizeCart). Aunque el drawer no
// los usa, otros consumidores sí.
export { ProductSection, DesignSection, summarizeCart }
