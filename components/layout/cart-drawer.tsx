"use client"

import { useState } from "react"
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
  selectTotal,
  useCartHasHydrated,
  useCartStore,
} from "@/stores/cart-store"
import { formatUYU } from "@/lib/format"
import { FLAT_SHIPPING_UYU } from "@/lib/constants"
import { WhatsAppCTA } from "@/components/checkout/whatsapp-cta"

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const hasHydrated = useCartHasHydrated()
  const [confirmClear, setConfirmClear] = useState(false)

  const totals = selectTotal(items)
  const hasPhysicalProduct = items.some((it) => it.kind === "product")
  const hasDesign = items.some((it) => it.kind === "design")
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
            <Button variant="ghost" size="icon" onClick={close} aria-label="Cerrar" className="-mr-2">
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
                <li key={it.key} className="bg-bg-titanium flex items-start gap-3 rounded-lg border border-white/5 p-3">
                  <div className="bg-background flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-white/5">
                    {it.kind === "product" && it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt={it.name} className="h-full w-full rounded-md object-cover" />
                    ) : it.kind === "design" ? (
                      <span className="text-brand-red font-display text-lg font-extrabold">3D</span>
                    ) : (
                      <ShoppingBag className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {it.kind === "product" ? (
                      <>
                        <p className="truncate text-sm font-medium">{it.name}</p>
                        {(it.size || it.color) ? (
                          <p className="text-muted-foreground text-xs">
                            {it.size ? `Talle: ${it.size}` : ""}
                            {it.size && it.color ? " · " : ""}
                            {it.color ? `Color: ${it.color}` : ""}
                          </p>
                        ) : null}
                        <p className="text-muted-foreground text-xs">{formatUYU(it.price)} c/u</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <Button variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => updateQty(it.key, Math.max(1, it.qty - 1))}
                            aria-label={`Restar una unidad de ${it.name}`}>
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{it.qty}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8"
                            disabled={it.stockCap != null && it.qty >= it.stockCap}
                            onClick={() => updateQty(it.key, it.qty + 1)}
                            aria-label={`Sumar una unidad de ${it.name}`}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          {it.stockCap != null && it.qty >= it.stockCap ? (
                            <span className="text-amber-400 ml-1 text-[10px]">stock máx.</span>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="truncate text-sm font-medium">{it.previewLabel}</p>
                        <p className="text-muted-foreground text-xs">Diseño personalizado — precio a coordinar</p>
                        <Link href={it.editorUrl} onClick={close}
                          className="text-brand-red mt-1 inline-block text-xs underline-offset-2 hover:underline">
                          Volver al editor
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold">
                      {it.kind === "product" ? formatUYU(it.price * it.qty) : "—"}
                    </span>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 hover:text-red-400"
                      onClick={() => removeItem(it.key)}
                      aria-label={it.kind === "product" ? `Eliminar ${it.name}` : `Eliminar ${it.previewLabel}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!empty ? (
          <div className="border-t border-white/5 px-5 py-4">
            <dl className="mb-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatUYU(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className={hasPhysicalProduct ? "font-semibold" : "text-white/60"}>
                  {hasPhysicalProduct ? formatUYU(FLAT_SHIPPING_UYU) : "Gratis"}
                </dd>
              </div>
              {hasDesign ? (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Diseños a coordinar</dt>
                  <dd className="text-amber-300 font-semibold">Por WhatsApp</dd>
                </div>
              ) : null}
            </dl>
            <Separator className="mb-3" />
            <div className="mb-3 flex items-baseline justify-between text-base">
              <span className="font-semibold">Total estimado</span>
              <span className="text-brand-red font-extrabold">{formatUYU(totals.total)}</span>
            </div>
            <p className="text-muted-foreground mb-4 text-[11px]">
              {hasPhysicalProduct
                ? `Envío estándar a todo Uruguay: ${formatUYU(FLAT_SHIPPING_UYU)}.`
                : "El envío se coordina según el tipo de pedido."}
            </p>
            {confirmClear ? (
              <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs">
                <p className="mb-2">¿Vaciar los {items.length} ítems?</p>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>Cancelar</Button>
                  <Button variant="destructive" size="sm" onClick={() => { clear(); setConfirmClear(false) }}>Sí, vaciar</Button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)}
                className="text-muted-foreground hover:text-red-400 mb-3 text-xs underline-offset-2 hover:underline">
                Vaciar carrito
              </button>
            )}
            <div className="flex flex-col gap-2">
              <ButtonLink href="/checkout" onClick={close} className="w-full">Ir al checkout</ButtonLink>
              <WhatsAppCTA cart={{ items }} customerName="" variant="outline" className="w-full" label="Coordinar por WhatsApp" />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
