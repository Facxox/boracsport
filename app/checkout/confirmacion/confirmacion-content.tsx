"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2, Clock, HelpCircle, MessageCircle, ShoppingBag, Store, XCircle } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"
import { useCartStore, useCartHasHydrated } from "@/stores/cart-store"
import { useCustomerStore, useCustomerHasHydrated } from "@/stores/customer-store"
import { formatUYU } from "@/lib/format"
import { WHATSAPP_NUMBER } from "@/lib/constants"

type Status = "success" | "pending" | "failure" | "unknown"

type PublicOrder = {
  id: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  total: number
  createdAt: string
}

type PaymentMethodLabel = "mercadopago" | "transfer" | "whatsapp" | "otro"

function detectPaymentMethod(order: PublicOrder | null): PaymentMethodLabel {
  if (!order) return "otro"
  const method = order.paymentMethod
  if (method === "mercadopago") return "mercadopago"
  if (method === "transfer") return "transfer"
  if (method === "whatsapp") return "whatsapp"
  return "otro"
}

const PAYMENT_METHOD_LABEL: Record<PaymentMethodLabel, string> = {
  mercadopago: "Mercado Pago",
  transfer: "Transferencia BROU",
  whatsapp: "Coordinación por WhatsApp",
  otro: "Método no especificado",
}

const NEXT_STEPS: Record<PaymentMethodLabel, string[]> = {
  mercadopago: [
    "Te enviamos un email con el comprobante del pago.",
    "Vamos a preparar tu pedido y te avisamos cuando esté listo para envío.",
    "Si tenés dudas, podés escribirnos por WhatsApp con el número de pedido.",
  ],
  transfer: [
    "Realizá la transferencia por el monto indicado.",
    "Subí el comprobante desde la sección del pedido para confirmar la seña.",
    "Te avisamos por WhatsApp cuando confirmemos el pago.",
  ],
  whatsapp: [
    "Te enviamos un mensaje con el detalle del carrito.",
    "Coordinamos por chat los diseños personalizados y la entrega.",
    "Cuando confirmemos, generamos el pedido y seguimos por acá.",
  ],
  otro: [
    "Te avisamos por email cuando confirmemos tu pedido.",
    "Si tenés dudas, contactanos por WhatsApp.",
  ],
}

export function ConfirmacionContent({
  status,
  order,
  orderIdParam,
  rawStatus,
}: {
  status: Status
  order: PublicOrder | null
  orderIdParam: string
  rawStatus: string
}) {
  const clearCart = useCartStore((s) => s.clear)
  const cartHasHydrated = useCartHasHydrated()
  const customerProfile = useCustomerStore((s) => s.profile)
  const customerHasHydrated = useCustomerHasHydrated()
  const cartClearedRef = useRef(false)

  // Si el pago fue aprobado y el cliente está en este dispositivo, vaciamos
  // el carrito. Sólo si hay un orderId asociado (pago aprobado sin order
  // registrado no debería limpiar nada). Usamos ref para no re-renderizar.
  useEffect(() => {
    if (!cartHasHydrated) return
    if (cartClearedRef.current) return
    if (status === "success" && orderIdParam.length > 0) {
      cartClearedRef.current = true
      clearCart()
    }
  }, [status, orderIdParam, clearCart, cartHasHydrated])

  const paymentMethod = detectPaymentMethod(order)
  const shortId = order ? order.id.slice(0, 8).toUpperCase() : orderIdParam.slice(0, 8).toUpperCase()

  const whatsappMessage = order
    ? `Hola! Acabo de pagar el pedido #${shortId}.`
    : customerHasHydrated && customerProfile.name
      ? `Hola! Soy ${customerProfile.name}, necesito ayuda con mi pedido.`
      : "Hola! Necesito ayuda con mi pedido."

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:py-16">
      <StatusHero status={status} order={order} />

      {order ? (
        <section className="bg-card rounded-2xl border border-white/5 p-5">
          <h2 className="font-display text-base font-extrabold">Resumen del pedido</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Número de pedido</dt>
              <dd className="font-mono font-semibold">#{shortId}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Método de pago</dt>
              <dd className="font-semibold">{PAYMENT_METHOD_LABEL[paymentMethod]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Estado del pago</dt>
              <dd className="font-semibold capitalize">{String(order.paymentStatus)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-white/5 pt-2 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="text-brand-red font-extrabold">{formatUYU(order.total)}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <NextStepsSection status={status} paymentMethod={paymentMethod} hasOrder={Boolean(order)} />

      <section className="bg-card rounded-2xl border border-white/5 p-5">
        <h2 className="font-display text-base font-extrabold">¿Qué hago ahora?</h2>
        <div className="mt-4 flex flex-col gap-2">
          {status === "success" ? (
            order ? (
              <ButtonLink href={`/cuenta/pedidos/${order.id}`} className="w-full">
                Ver detalle del pedido
              </ButtonLink>
            ) : (
              <ButtonLink href="/cuenta/pedidos" className="w-full">
                Ir a Mis pedidos
              </ButtonLink>
            )
          ) : null}

          {status === "failure" ? (
            <ButtonLink href="/checkout" className="w-full">
              Intentar el pago de nuevo
            </ButtonLink>
          ) : null}

          {status === "pending" ? (
            <ButtonLink href="/cuenta/pedidos" className="w-full">
              Ir a Mis pedidos
            </ButtonLink>
          ) : null}

          <ButtonLink href="/productos" variant="outline" className="w-full">
            <Store className="mr-2 h-4 w-4" />
            Seguir comprando
          </ButtonLink>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card/60 text-foreground hover:bg-card inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold"
          >
            <MessageCircle className="h-4 w-4" />
            Contactar por WhatsApp
          </a>
        </div>
      </section>

      {rawStatus && rawStatus !== status ? (
        <p className="text-muted-foreground text-center text-[11px]">
          Parámetro recibido de la pasarela: <span className="font-mono">{rawStatus}</span>
        </p>
      ) : null}
    </div>
  )
}

function StatusHero({ status, order }: { status: Status; order: PublicOrder | null }) {
  if (status === "success") {
    return (
      <header className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <p className="text-foreground mt-5 text-xs uppercase tracking-[0.25em]">Pago aprobado</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold md:text-4xl">¡Gracias por tu compra!</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {order
            ? `Recibimos tu pago por ${formatUYU(order.total)}. Te enviamos un email con el detalle.`
            : "Recibimos tu pago. Te enviamos un email con el detalle."}
        </p>
      </header>
    )
  }

  if (status === "pending") {
    return (
      <header className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
          <Clock className="h-8 w-8" aria-hidden />
        </div>
        <p className="text-foreground mt-5 text-xs uppercase tracking-[0.25em]">Pago pendiente</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold md:text-4xl">Estamos confirmando tu pago</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Algunos métodos (efectivo, transferencia) tardan unos minutos en acreditarse. Te avisamos por email cuando se confirme.
        </p>
      </header>
    )
  }

  if (status === "failure") {
    return (
      <header className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-300">
          <XCircle className="h-8 w-8" aria-hidden />
        </div>
        <p className="text-foreground mt-5 text-xs uppercase tracking-[0.25em]">Pago rechazado</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold md:text-4xl">No pudimos procesar el pago</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          El pago fue rechazado por la pasarela. Podés intentar de nuevo con otro método o contactarnos por WhatsApp.
        </p>
      </header>
    )
  }

  return (
    <header className="flex flex-col items-center text-center">
      <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full text-white/70">
        <HelpCircle className="h-8 w-8" aria-hidden />
      </div>
      <p className="text-foreground mt-5 text-xs uppercase tracking-[0.25em]">No pudimos confirmar</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold md:text-4xl">¿Pasó algo con el pago?</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Si pagaste y ves esta pantalla, no te preocupes: tu pedido está registrado. Escribinos por WhatsApp con el número de pedido para confirmarlo.
      </p>
    </header>
  )
}

function NextStepsSection({
  status,
  paymentMethod,
  hasOrder,
}: {
  status: Status
  paymentMethod: PaymentMethodLabel
  hasOrder: boolean
}) {
  if (status === "failure") return null
  const steps = NEXT_STEPS[paymentMethod]
  return (
    <section className="bg-card rounded-2xl border border-white/5 p-5">
      <h2 className="font-display text-base font-extrabold">Próximos pasos</h2>
      <ol className="mt-3 space-y-2 text-sm text-white/80">
        {steps.map((line, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="bg-white/5 text-muted-foreground mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
              {idx + 1}
            </span>
            <span className="leading-relaxed">{line}</span>
          </li>
        ))}
      </ol>
      {status === "success" && !hasOrder ? (
        <p className="text-muted-foreground mt-4 inline-flex items-center gap-2 text-xs">
          <ShoppingBag className="h-3.5 w-3.5" />
          Si no ves el pedido en tu cuenta, escribinos con tu email.
        </p>
      ) : null}
    </section>
  )
}
