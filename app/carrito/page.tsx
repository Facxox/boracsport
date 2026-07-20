"use client"

import { useState } from "react"
import Link from "next/link"
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, MessageCircle } from "lucide-react"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  selectTotal,
  useCartHasHydrated,
  useCartStore,
} from "@/stores/cart-store"
import { useCustomerStore } from "@/stores/customer-store"
import { formatUYU } from "@/lib/format"
import { FLAT_SHIPPING_UYU } from "@/lib/constants"
import { WhatsAppCTA } from "@/components/checkout/whatsapp-cta"

export default function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const hasHydrated = useCartHasHydrated()
  const setProfile = useCustomerStore((s) => s.setProfile)
  const storedName = useCustomerStore((s) => s.profile.name)
  const [confirmClear, setConfirmClear] = useState(false)
  const [customerName, setCustomerName] = useState("")

  const empty = hasHydrated && items.length === 0
  const totals = selectTotal(items)
  const hasPhysicalProduct = items.some((it) => it.kind === "product")
  const hasDesign = items.some((it) => it.kind === "design")

  function commitName(value: string) {
    setCustomerName(value)
    setProfile({ name: value, email: "", phone: "", address: "" })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Carrito</p>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">Tu carrito</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            Revisá cantidades, variantes y total estimado antes de continuar al checkout.
          </p>
        </div>
        {!empty ? (
          <span className="hidden text-xs text-white/60 sm:inline">
            {items.length} {items.length === 1 ? "ítem" : "ítems"}
          </span>
        ) : null}
      </header>

      {!hasHydrated ? (
        <p className="text-muted-foreground mt-10 text-center text-sm">Cargando…</p>
      ) : empty ? (
        <EmptyCart />
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.key} className="bg-card flex items-start gap-4 rounded-xl border border-white/5 p-4">
                  <div className="bg-muted/30 flex h-16 w-16 shrink-0 items-center justify-center rounded-md">
                    {it.kind === "product" && it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt={it.name} className="h-full w-full rounded-md object-cover" />
                    ) : (
                      <span className="text-brand-red font-display text-lg font-extrabold">3D</span>
                    )}
                  </div>
                  <div className="flex-1">
                    {it.kind === "product" ? (
                      <>
                        <p className="font-semibold">{it.name}</p>
                        {(it.size || it.color) ? (
                          <p className="text-muted-foreground text-sm">
                            {it.size ? `Talle: ${it.size}` : ""}
                            {it.size && it.color ? " · " : ""}
                            {it.color ? `Color: ${it.color}` : ""}
                          </p>
                        ) : null}
                        <p className="text-muted-foreground text-sm">{formatUYU(it.price)} c/u</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <Button variant="outline" size="icon" className="h-9 w-9"
                            onClick={() => updateQty(it.key, Math.max(1, it.qty - 1))}
                            aria-label={`Restar una unidad de ${it.name}`}>
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{it.qty}</span>
                          <Button variant="outline" size="icon" className="h-9 w-9"
                            disabled={it.stockCap != null && it.qty >= it.stockCap}
                            onClick={() => updateQty(it.key, it.qty + 1)}
                            aria-label={`Sumar una unidad de ${it.name}`}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          {it.stockCap != null ? (
                            <span className="text-muted-foreground ml-1 text-xs">/ {it.stockCap} disp.</span>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">{it.previewLabel}</p>
                        <p className="text-muted-foreground text-sm">Diseño personalizado — precio a coordinar</p>
                        <Link href={it.editorUrl} className="text-brand-red mt-2 inline-block text-sm underline-offset-2 hover:underline">Volver al editor</Link>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-semibold">
                      {it.kind === "product" ? formatUYU(it.price * it.qty) : "A coordinar"}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(it.key)}
                      aria-label={it.kind === "product" ? `Eliminar ${it.name}` : `Eliminar ${it.previewLabel}`}
                      className="hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {confirmClear ? (
                <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
                  <p className="text-sm">¿Vaciar los {items.length} ítems del carrito?</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>Cancelar</Button>
                    <Button variant="destructive" size="sm" onClick={() => { clear(); setConfirmClear(false) }}>Sí, vaciar</Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>Vaciar carrito</Button>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-card sticky top-24 rounded-2xl border border-white/5 p-5">
              <h2 className="font-display text-lg font-extrabold">Resumen</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">{formatUYU(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Envío</dt>
                  <dd className={hasPhysicalProduct ? "font-semibold" : "text-white/60"}>
                    {hasPhysicalProduct ? formatUYU(FLAT_SHIPPING_UYU) : "Gratis"}
                  </dd>
                </div>
                {hasDesign ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Diseños a coordinar</dt>
                    <dd className="text-amber-300 font-semibold">Por WhatsApp</dd>
                  </div>
                ) : null}
                <div className="mt-3 flex justify-between border-t border-white/5 pt-3 text-base">
                  <dt className="font-semibold">Total estimado</dt>
                  <dd className="text-brand-red font-extrabold">{formatUYU(totals.total)}</dd>
                </div>
              </dl>
              <p className="text-muted-foreground mt-3 text-[11px]">
                {hasPhysicalProduct
                  ? `Envío estándar a todo Uruguay: ${formatUYU(FLAT_SHIPPING_UYU)}.`
                  : "El envío se coordina según el tipo de pedido."}
              </p>
              <div className="mt-5 space-y-2">
                <label className="block text-xs font-medium" htmlFor="customer-name">Tu nombre (opcional)</label>
                <input id="customer-name" type="text" value={customerName || storedName}
                  onChange={(e) => commitName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="bg-background w-full rounded-md border border-white/10 px-3 py-2 text-sm" />
                <ButtonLink href="/checkout" className="w-full">Finalizar compra</ButtonLink>
                <WhatsAppCTA cart={{ items }} customerName={customerName || storedName} variant="outline" className="w-full" />
              </div>
            </div>
            <TrustHints />
          </aside>
        </div>
      )}
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="mt-12 flex flex-col items-center gap-5 rounded-2xl border border-dashed border-white/10 bg-black/10 px-6 py-12 text-center">
      <ShoppingBag className="text-muted-foreground h-12 w-12" />
      <div className="space-y-1">
        <p className="text-lg font-semibold">Tu carrito está vacío</p>
        <p className="text-muted-foreground max-w-md text-sm">
          Diseñá tu camiseta en 3D o elegí un producto del catálogo para empezar.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/productos">Ver catálogo</ButtonLink>
        <ButtonLink href="/personalizar" variant="outline">Diseñá en 3D</ButtonLink>
      </div>
    </div>
  )
}

function TrustHints() {
  return (
    <div className="grid gap-2 rounded-2xl border border-white/5 bg-black/20 p-4 text-xs text-white/70">
      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" />Pago seguro vía Mercado Pago oficial o transferencia BROU.</div>
      <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-emerald-300" />Coordinación directa por WhatsApp en horario laboral.</div>
      <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-300" />Envíos a todo Uruguay en 24-72h hábiles.</div>
    </div>
  )
}
