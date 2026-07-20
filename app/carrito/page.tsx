"use client"

import { useState } from "react"
import { ShieldCheck, ShoppingBag, Trash2, Truck, MessageCircle } from "lucide-react"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  useCartHasHydrated,
  useCartStore,
} from "@/stores/cart-store"
import { useCustomerStore } from "@/stores/customer-store"
import { formatUYU } from "@/lib/format"
import { FLAT_SHIPPING_UYU } from "@/lib/constants"
import { WhatsAppCTA } from "@/components/checkout/whatsapp-cta"
import { ProductSection, DesignSection, summarizeCart } from "@/components/checkout/cart-sections"

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
  const summary = summarizeCart(items)
  const hasDesign = summary.designs.length > 0
  const hasPhysical = summary.hasPhysical

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
          <div className="space-y-6">
            <ProductSection
              items={summary.products}
              onRemove={removeItem}
              onUpdateQty={updateQty}
            />
            <DesignSection items={summary.designs} onRemove={removeItem} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {confirmClear ? (
                <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
                  <p className="text-sm">¿Vaciar los {items.length} ítems del carrito?</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
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
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Vaciar carrito
                </Button>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-card sticky top-24 rounded-2xl border border-white/5 p-5">
              <h2 className="font-display text-lg font-extrabold">Resumen</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal productos</dt>
                  <dd className="font-semibold">{formatUYU(summary.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Envío</dt>
                  <dd className={hasPhysical ? "font-semibold" : "text-white/60"}>
                    {hasPhysical ? formatUYU(FLAT_SHIPPING_UYU) : "Gratis"}
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
                  <dd className="text-brand-red font-extrabold">
                    {formatUYU(summary.total)}
                  </dd>
                </div>
              </dl>
              <p className="text-muted-foreground mt-3 text-[11px]">
                {hasPhysical
                  ? `Envío estándar a todo Uruguay: ${formatUYU(FLAT_SHIPPING_UYU)}.`
                  : "El envío se coordina según el tipo de pedido."}
              </p>
              <div className="mt-5 space-y-2">
                <label className="block text-xs font-medium" htmlFor="customer-name">
                  Tu nombre (opcional)
                </label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName || storedName}
                  onChange={(e) => commitName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="bg-background w-full rounded-md border border-white/10 px-3 py-2 text-sm"
                />
                <ButtonLink href="/checkout" className="w-full">
                  Finalizar compra
                </ButtonLink>
                <WhatsAppCTA
                  cart={{ items }}
                  customerName={customerName || storedName}
                  variant="outline"
                  className="w-full"
                />
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
        <ButtonLink href="/personalizar" variant="outline">
          Diseñá en 3D
        </ButtonLink>
      </div>
    </div>
  )
}

function TrustHints() {
  return (
    <div className="grid gap-2 rounded-2xl border border-white/5 bg-black/20 p-4 text-xs text-white/70">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-300" />
        Pago seguro vía Mercado Pago oficial o transferencia BROU.
      </div>
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-emerald-300" />
        Coordinación directa por WhatsApp en horario laboral.
      </div>
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-emerald-300" />
        Envíos a todo Uruguay en 24-72h hábiles.
      </div>
    </div>
  )
}
