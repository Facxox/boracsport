"use client"

import { useState } from "react"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import {
  selectSubtotal,
  useCartHasHydrated,
  useCartStore,
} from "@/stores/cart-store"
import { Button, ButtonLink } from "@/components/ui/button"
import { formatUYU } from "@/lib/format"
import { WhatsAppCTA } from "@/components/checkout/whatsapp-cta"

export default function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const hasHydrated = useCartHasHydrated()
  const [customerName, setCustomerName] = useState("")

  const empty = hasHydrated && items.length === 0
  const subtotal = selectSubtotal(items)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">
        Tu carrito
      </h1>

      {!hasHydrated ? (
        <p className="text-muted-foreground mt-6">Cargando…</p>
      ) : empty ? (
        <div className="mt-10 text-center">
          <ShoppingBag className="text-muted-foreground mx-auto h-12 w-12" />
          <p className="mt-4 text-lg font-semibold">Tu carrito está vacío</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Diseñá tu camiseta en 3D o elegí un producto.
          </p>
          <ButtonLink href="/productos" className="mt-6">
            Ver catálogo
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.key}
                className="bg-card flex items-start gap-4 rounded-xl border border-white/5 p-4"
              >
                <div className="bg-muted/30 flex h-16 w-16 shrink-0 items-center justify-center rounded-md">
                  {it.kind === "product" && it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-full w-full rounded-md object-cover"
                    />
                  ) : (
                    <span className="text-brand-red font-display text-lg font-extrabold">
                      3D
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  {it.kind === "product" ? (
                    <>
                      <p className="font-semibold">{it.name}</p>
                      {(it.size || it.color) && (
                        <p className="text-muted-foreground text-sm">
                          {it.size ? `Talle: ${it.size}` : ""}
                          {it.size && it.color ? " · " : ""}
                          {it.color ? `Color: ${it.color}` : ""}
                        </p>
                      )}
                      <p className="text-muted-foreground text-sm">
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
                        <span className="w-8 text-center text-sm font-medium">
                          {it.qty}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          disabled={it.stockCap != null && it.qty >= it.stockCap}
                          onClick={() => updateQty(it.key, it.qty + 1)}
                          aria-label="Sumar"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        {it.stockCap != null && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            / {it.stockCap} disp.
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">{it.previewLabel}</p>
                      <p className="text-muted-foreground text-sm">
                        Diseño personalizado — precio a coordinar
                      </p>
                      <Link
                        href={it.editorUrl}
                        className="text-brand-red mt-2 inline-block text-sm underline-offset-2 hover:underline"
                      >
                        Volver al editor
                      </Link>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-semibold">
                    {it.kind === "product"
                      ? formatUYU(it.price * it.qty)
                      : "—"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(it.key)}
                    aria-label="Eliminar"
                    className="hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
            <li className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clear}>
                Vaciar carrito
              </Button>
            </li>
          </ul>

          <aside className="bg-card sticky top-32 h-fit rounded-2xl border border-white/5 p-5">
            <h2 className="font-display text-lg font-extrabold">Resumen</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatUYU(subtotal)}</dd>
              </div>
            </dl>
            <div className="mt-5 space-y-2">
              <label className="block text-xs font-medium">
                Tu nombre (opcional)
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="bg-background mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-sm"
                />
              </label>
              <ButtonLink href="/checkout" className="w-full">
                Finalizar compra
              </ButtonLink>
              <WhatsAppCTA
                cart={{ items }}
                customerName={customerName}
                variant="outline"
                className="w-full"
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
