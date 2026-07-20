"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Banknote, CreditCard, MessageCircle, ArrowRight, ShieldCheck, Truck, Check, Lock, ShoppingBag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button, ButtonLink } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  selectSubtotal,
  selectTotal,
  useCartHasHydrated,
  useCartStore,
} from "@/stores/cart-store"
import { useCustomerStore } from "@/stores/customer-store"
import { formatUYU } from "@/lib/format"
import { FLAT_SHIPPING_UYU } from "@/lib/constants"
import { TransferOptions } from "@/components/checkout/transfer-options"
import { MercadoPagoModal } from "@/components/checkout/mercadopago-modal"
import { WhatsAppCTA } from "@/components/checkout/whatsapp-cta"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MP_STATUS_VALUES = new Set(["success", "failure", "pending", "approved", "rejected", "in_process", "cancelled", "in_mediation"])

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const hasHydrated = useCartHasHydrated()
  const storedProfile = useCustomerStore((s) => s.profile)
  const setStoredProfile = useCustomerStore((s) => s.setProfile)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hydrated, setHydrated] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({})
  const [mpOpen, setMpOpen] = useState(false)
  // Bug 1.3: si el cliente repite el mismo carrito en <5min, el server
  // dedupe por cartHash. Permitimos forzar "es un pedido nuevo" para no
  // pisar la orden anterior. Por defecto false.
  const [forceNew, setForceNew] = useState(false)

  const subtotal = selectSubtotal(items)
  const totals = selectTotal(items)
  const empty = hasHydrated && items.length === 0

  useEffect(() => { setHydrated(true) }, [])

  // Bug 1.1: si llegamos con ?status= o ?order= de un redirect de Mercado
  // Pago, derivamos a /checkout/confirmacion para que el cliente vea el
  // estado del pago en vez de un formulario vacío.
  useEffect(() => {
    const status = searchParams.get("status")
    const order = searchParams.get("order")
    const hasStatus = status && MP_STATUS_VALUES.has(status)
    const hasOrder = order && order.length > 0
    if (!hasStatus && !hasOrder) return
    const next = new URLSearchParams()
    if (status) next.set("status", status)
    if (order) next.set("order", order)
    const email = searchParams.get("email")
    const phone = searchParams.get("phone")
    if (email) next.set("email", email)
    if (phone) next.set("phone", phone)
    router.replace(`/checkout/confirmacion?${next.toString()}`)
  }, [searchParams, router])

  useEffect(() => {
    if (!hydrated) return
    if (!name && storedProfile.name) setName(storedProfile.name)
    if (!email && storedProfile.email) setEmail(storedProfile.email)
    if (!phone && storedProfile.phone) setPhone(storedProfile.phone)
    if (!address && storedProfile.address) setAddress(storedProfile.address)
  }, [hydrated, storedProfile, name, email, phone, address])

  useEffect(() => {
    if (!hydrated) return
    setStoredProfile({ name, email, phone, address })
  }, [hydrated, name, email, phone, address, setStoredProfile])

  const customer = { name, email, phone, address }
  const hasPhysicalProduct = items.some((it) => it.kind === "product")
  const hasDesign = items.some((it) => it.kind === "design")

  const validation = useMemo(
    () => ({
      name: name.trim().length >= 3,
      email: EMAIL_REGEX.test(email.trim()),
      phone: phone.replace(/\D/g, "").length >= 6,
    }),
    [name, email, phone],
  )

  const contactInfoValid = validation.name && validation.email && validation.phone
  const showNameError = touched.name && !validation.name
  const showEmailError = touched.email && !validation.email
  const showPhoneError = touched.phone && !validation.phone

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Checkout</p>
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Finalizar compra</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Dejanos tus datos, elegí un método de pago y confirmamos tu pedido por WhatsApp.
        </p>
      </header>

      <Stepper step={2} />

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#101012] px-4 py-3 text-xs text-white/70">
        <Lock className="h-4 w-4 text-emerald-300" />
        <span>
          Tus datos no se almacenan en el sitio. El pago se procesa en la pasarela oficial de Mercado Pago o por transferencia BROU verificada.
        </span>
      </div>

      {!hasHydrated ? (
        <p className="text-muted-foreground mt-10 text-center text-sm">Cargando…</p>
      ) : empty ? (
        <EmptyCheckout />
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="bg-card rounded-2xl border border-white/5 p-5">
              <header className="mb-4 flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Paso 1</p>
                  <h2 className="font-display text-lg font-extrabold">Tus datos</h2>
                </div>
                <span className="text-[11px] text-white/40">
                  Se guardan automáticamente en este navegador.
                </span>
              </header>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" type="text" autoComplete="name" required
                    aria-invalid={showNameError || undefined}
                    aria-describedby={showNameError ? "name-error" : undefined}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Juan Pérez"
                    className={showNameError ? "border-red-500/60" : undefined} />
                  {showNameError ? (
                    <p id="name-error" className="text-xs text-red-400" role="alert">
                      Ingresá tu nombre (mínimo 3 caracteres).
                    </p>
                  ) : (
                    <p className="text-xs text-white/40">Lo usamos para coordinar el envío.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" required
                    aria-invalid={showEmailError || undefined}
                    aria-describedby={showEmailError ? "email-error" : undefined}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="juan@ejemplo.com"
                    className={showEmailError ? "border-red-500/60" : undefined} />
                  {showEmailError ? (
                    <p id="email-error" className="text-xs text-red-400" role="alert">
                      Email inválido. Revisá el formato.
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" required
                    aria-invalid={showPhoneError || undefined}
                    aria-describedby={showPhoneError ? "phone-error" : undefined}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    placeholder="099 123 456"
                    className={showPhoneError ? "border-red-500/60" : undefined} />
                  {showPhoneError ? (
                    <p id="phone-error" className="text-xs text-red-400" role="alert">
                      Necesitamos un teléfono válido para coordinar la entrega.
                    </p>
                  ) : (
                    <p className="text-xs text-white/40">Sólo lo necesario para coordinar el envío.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-card rounded-2xl border border-white/5 p-5">
              <header className="mb-4 flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Paso 1.1</p>
                  <h2 className="font-display text-lg font-extrabold">Datos de envío</h2>
                </div>
                <span className="text-[11px] text-white/40">Opcional, recomendado para coordinar la entrega.</span>
              </header>
              <div className="space-y-1.5">
                <Label htmlFor="address">Dirección de entrega</Label>
                <textarea id="address" rows={3} value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, ciudad, departamento"
                  className="bg-background w-full rounded-md border border-white/10 px-3 py-2 text-sm" />
                <p className="text-xs text-white/40">
                  La usamos únicamente para coordinar la entrega del pedido.
                </p>
              </div>
            </section>

            <section className="bg-card rounded-2xl border border-white/5 p-5">
              <header className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Paso 2</p>
                    <h2 className="font-display text-lg font-extrabold">Método de pago</h2>
                  </div>
                </div>
                <span className="text-[11px] text-white/40">Elegí cómo querés pagar.</span>
              </header>

              <Tabs defaultValue="transfer" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transfer"><Banknote className="mr-1.5 h-3.5 w-3.5" />Transferencia</TabsTrigger>
                  <TabsTrigger value="mp"><CreditCard className="mr-1.5 h-3.5 w-3.5" />Mercado Pago</TabsTrigger>
                  <TabsTrigger value="wa"><MessageCircle className="mr-1.5 h-3.5 w-3.5" />WhatsApp</TabsTrigger>
                </TabsList>

                <TabsContent value="transfer" className="mt-4 space-y-3">
                  <MethodHint
                    title="Transferencia BROU"
                    description="Pagá por BROU y enviá el comprobante para confirmar la seña."
                    confirmIn="24-48h hábiles" />
                  {!contactInfoValid ? (
                    <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
                      Completá nombre, email y teléfono para registrar el pedido por transferencia.
                    </p>
                  ) : null}
                  <TransferOptions items={items} customer={customer} forceNew={forceNew} />
                </TabsContent>

                <TabsContent value="mp" className="mt-4 space-y-3">
                  <MethodHint
                    title="Mercado Pago oficial"
                    description="Tarjeta de crédito o débito. Te redirigimos a la pasarela oficial para completar el pago."
                    confirmIn="Inmediato" />
                  <div className="bg-card/60 rounded-lg border border-white/5 p-5 text-center">
                    <CreditCard className="text-muted-foreground mx-auto h-8 w-8" />
                    <p className="mt-3 text-sm font-semibold">Pago con tarjeta vía Mercado Pago (UYU)</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {hasDesign
                        ? "Los pedidos con diseños personalizados requieren coordinación previa."
                        : `Total a pagar ahora: ${formatUYU(totals.total)}.`}
                    </p>
                    <Button onClick={() => setMpOpen(true)} disabled={!contactInfoValid}
                      className="bg-brand-red text-foreground hover:bg-[#ef4444] mt-4 inline-flex items-center">
                      Pagar con Mercado Pago
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    {!contactInfoValid ? (
                      <p className="text-muted-foreground mt-2 text-[11px]">
                        Completá tus datos para habilitar el pago.
                      </p>
                    ) : null}
                  </div>
                </TabsContent>

                <TabsContent value="wa" className="mt-4 space-y-3">
                  <MethodHint
                    title="Coordinamos por WhatsApp"
                    description="Te enviamos el detalle del carrito y los diseños incluidos para cerrar por chat."
                    confirmIn="En horario laboral" />
                  <div className="bg-card/60 rounded-lg border border-white/5 p-5 text-center">
                    <MessageCircle className="text-brand-red mx-auto h-8 w-8" />
                    <p className="mt-3 text-sm font-semibold">Coordinamos tu pedido por WhatsApp</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Te enviamos un mensaje pre-armado con el detalle del carrito y los diseños incluidos.
                    </p>
                    <WhatsAppCTA cart={{ items }} customerName={name} customerEmail={email} customerPhone={phone}
                      className="bg-brand-red text-foreground hover:bg-[#ef4444] mt-4 inline-flex items-center" />
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </div>

          <aside className="bg-card sticky top-24 h-fit rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold">Resumen</h2>
              <ButtonLink href="/carrito" variant="ghost" size="sm" className="text-xs">
                Editar carrito
              </ButtonLink>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              {items.map((it) => (
                <li key={it.key} className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground truncate">
                    {it.kind === "product" ? `${it.qty}× ${it.name}` : `1× ${it.previewLabel}`}
                  </span>
                  <span className="shrink-0 font-medium">
                    {it.kind === "product" ? formatUYU(it.price * it.qty) : "A coordinar"}
                  </span>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatUYU(subtotal)}</dd>
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
              <div className="flex justify-between border-t border-white/5 pt-2 text-base">
                <dt className="font-semibold">Total estimado</dt>
                <dd className="text-brand-red font-extrabold">{formatUYU(totals.total)}</dd>
              </div>
            </dl>

            <p className="text-muted-foreground mt-4 text-[11px]">
              {hasPhysicalProduct
                ? `Incluye envío estándar a todo Uruguay: ${formatUYU(FLAT_SHIPPING_UYU)}.`
                : "El envío se coordina según el tipo de pedido."}
            </p>

            {hasDesign ? (
              <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
                Los diseños personalizados se cotizan por WhatsApp de forma independiente al total mostrado ({formatUYU(totals.total)}).
              </p>
            ) : null}

            <label className="mt-3 flex cursor-pointer items-start gap-2 text-[11px] text-white/70 select-none">
              <input
                type="checkbox"
                checked={forceNew}
                onChange={(e) => setForceNew(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-black/40 accent-[#dc2626]"
                aria-describedby="force-new-help"
              />
              <span>
                <span className="text-white/85">Es un nuevo pedido (independiente al anterior)</span>
                <span id="force-new-help" className="text-muted-foreground block">
                  Activá esto si querés registrar este pedido aunque coincida con uno reciente.
                </span>
              </span>
            </label>

            <div className="mt-5 space-y-2 border-t border-white/5 pt-4 text-xs text-white/70">
              <p className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />Pago seguro Mercado Pago o BROU.</p>
              <p className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-emerald-300" />Envíos 24-72h hábiles a todo Uruguay.</p>
            </div>
          </aside>
        </div>
      )}

      <MercadoPagoModal open={mpOpen} onOpenChange={setMpOpen} customer={customer} forceNew={forceNew} />
    </div>
  )
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: "Carrito" },
    { id: 2, label: "Datos y pago" },
    { id: 3, label: "Confirmación" },
  ] as const
  return (
    <ol className="flex items-center gap-3 text-xs" aria-label="Progreso del checkout">
      {steps.map((s, idx) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            className={
              s.id <= step
                ? "bg-brand-red flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-black"
                : "bg-card flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-[11px] text-white/40"
            }
            aria-current={s.id === step ? "step" : undefined}>
            {s.id < step ? <Check className="h-3.5 w-3.5" /> : s.id}
          </span>
          <span className={s.id === step ? "font-semibold text-white" : "text-white/50"}>{s.label}</span>
          {idx < steps.length - 1 ? <span className="bg-white/10 h-px w-6" aria-hidden /> : null}
        </li>
      ))}
    </ol>
  )
}

function MethodHint({
  title,
  description,
  confirmIn,
}: {
  title: string
  description: string
  confirmIn: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70">
      <p className="font-semibold text-white/80">{title}</p>
      <p className="mt-1">{description}</p>
      <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5">
        <Truck className="h-3.5 w-3.5" /> Confirmación estimada: {confirmIn}.
      </p>
    </div>
  )
}

function EmptyCheckout() {
  return (
    <div className="mt-12 flex flex-col items-center gap-5 rounded-2xl border border-dashed border-white/10 bg-black/10 px-6 py-12 text-center">
      <ShoppingBag className="text-muted-foreground h-12 w-12" />
      <div className="space-y-1">
        <p className="text-lg font-semibold">Tu carrito está vacío.</p>
        <p className="text-muted-foreground max-w-md text-sm">
          Diseñá en 3D o elegí un producto antes de avanzar al checkout.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/productos">Ver productos</ButtonLink>
        <Link href="/personalizar" className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm underline-offset-2 hover:underline">
          Ir al personalizador 3D
        </Link>
      </div>
    </div>
  )
}
