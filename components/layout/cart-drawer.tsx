"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button, ButtonLink } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  selectSubtotal,
  useCartHasHydrated,
  useCartStore,
} from "@/stores/cart-store"
import { formatUYU } from "@/lib/format"
import { WhatsAppCTA } from "@/components/checkout/whatsapp-cta"

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const hasHydrated = useCartHasHydrated()

  const subtotal = selectSubtotal(items)
  const empty = items.length === 0

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
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
              className="-mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
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
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.key}
                  className="bg-bg-titanium flex items-start gap-3 rounded-lg border border-white/5 p-3"
                >
                  <div className="bg-background flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-white/5">
                    {it.kind === "product" && it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt={it.name}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : it.kind === "design" ? (
                      <span className="text-brand-red font-display text-lg font-extrabold">
                        3D
                      </span>
                    ) : (
                      <ShoppingBag className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {it.kind === "product" ? (
                      <>
                        <p className="truncate text-sm font-medium">
                          {it.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatUYU(it.price)} c/u
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQty(it.key, Math.max(1, it.qty - 1))
                            }
                            aria-label="Restar"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {it.qty}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(it.key, it.qty + 1)}
                            aria-label="Sumar"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="truncate text-sm font-medium">
                          {it.previewLabel}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Diseño personalizado — precio a coordinar
                        </p>
                        <Link
                          href={it.editorUrl}
                          onClick={close}
                          className="text-brand-red mt-1 inline-block text-xs underline-offset-2 hover:underline"
                        >
                          Volver al editor
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold">
                      {it.kind === "product"
                        ? formatUYU(it.price * it.qty)
                        : "—"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground h-7 w-7 hover:text-red-400"
                      onClick={() => removeItem(it.key)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!empty && (
          <div className="border-t border-white/5 px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatUYU(subtotal)}</span>
            </div>
            <p className="text-muted-foreground mb-4 text-[11px]">
              Los diseños 3D se cotizan por WhatsApp. El envío se calcula en el checkout.
            </p>
            <Separator className="mb-3" />
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
        )}
      </SheetContent>
    </Sheet>
  )
}
