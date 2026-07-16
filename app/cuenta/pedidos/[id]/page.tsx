import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ButtonLink } from "@/components/ui/button"
import { formatDateUY, formatUYU } from "@/lib/format"
import type { OrderRow } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

type Params = Promise<{ id: string }>

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

const STATUS_LABEL: Record<OrderRow["status"], string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_produccion: "En producción",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

export default async function PedidoDetallePage({ params }: { params: Params }) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect(`/login?next=/cuenta/pedidos/${id}`)

  const { data, error } = await supabase
    .from("orders")
    .select("id, total, subtotal, status, payment_method, payment_status, items, shipping_details, created_at")
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .maybeSingle()

  if (error || !data) notFound()
  const order = data as unknown as Pick<
    OrderRow,
    "id" | "total" | "subtotal" | "status" | "payment_method" | "payment_status" | "items" | "shipping_details" | "created_at"
  >

  const items = Array.isArray(order.items) ? (order.items as unknown as Array<Record<string, unknown>>) : []
  const shipping = (order.shipping_details ?? {}) as Record<string, unknown>

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/cuenta/pedidos" className="text-muted-foreground hover:text-foreground">
          ← Mis pedidos
        </Link>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-white/60">#{order.id.slice(0, 8).toUpperCase()}</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold md:text-4xl">Pedido</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {formatDateUY(order.created_at)} · {STATUS_LABEL[order.status]}
          </p>
        </div>
        <ButtonLink href="/productos" variant="outline">
          Volver a comprar
        </ButtonLink>
      </div>

      <section className="bg-card mt-8 rounded-2xl border border-white/5 p-6">
        <h2 className="font-display text-lg font-extrabold">Productos</h2>
        <ul className="mt-4 space-y-2">
          {items.length === 0 && (
            <li className="text-muted-foreground text-sm">Sin items.</li>
          )}
          {items.map((it, idx) => {
            if (it.kind === "design") {
              return (
                <li
                  key={`design-${idx}`}
                  className="bg-muted/30 flex items-center justify-between rounded-lg border border-white/5 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{String(it.previewLabel ?? "Diseño personalizado")}</p>
                    <p className="text-muted-foreground text-xs">Diseño 3D — precio a coordinar</p>
                  </div>
                  <span className="font-semibold">—</span>
                </li>
              )
            }
            const variant = [it.size, it.color].filter(Boolean).join(" · ")
            const price = Number(it.price ?? 0)
            const qty = Number(it.qty ?? 1)
            return (
              <li
                key={`prod-${idx}`}
                className="bg-muted/30 flex items-center justify-between rounded-lg border border-white/5 p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{String(it.name ?? "Producto")}</p>
                  {variant && <p className="text-muted-foreground text-xs">{variant}</p>}
                  <p className="text-muted-foreground text-xs">
                    {formatUYU(price)} c/u · {qty} u.
                  </p>
                </div>
                <span className="font-semibold">{formatUYU(price * qty)}</span>
              </li>
            )
          })}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-white/5 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-semibold">{formatUYU(Number(order.subtotal))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd className="font-semibold">{formatUYU(Number(order.total) - Number(order.subtotal))}</dd>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-2 text-base">
            <dt className="font-bold">Total</dt>
            <dd className="font-bold">{formatUYU(Number(order.total))}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-card mt-4 rounded-2xl border border-white/5 p-6">
        <h2 className="font-display text-lg font-extrabold">Datos de envío</h2>
        <div className="mt-3 grid gap-1 text-sm">
          <p>{String(shipping.name ?? "")}</p>
          <p className="text-muted-foreground">{String(shipping.email ?? "")} · {String(shipping.phone ?? "")}</p>
          <p className="text-muted-foreground">{String(shipping.address ?? "")}</p>
        </div>
      </section>

      <section className="bg-card mt-4 rounded-2xl border border-white/5 p-6">
        <h2 className="font-display text-lg font-extrabold">Pago</h2>
        <p className="mt-2 text-sm">
          {order.payment_method === "transfer"
            ? "Transferencia BROU"
            : order.payment_method === "mercadopago"
              ? "MercadoPago"
              : "Coordinación por WhatsApp"}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Estado del pago: {String(order.payment_status)}
        </p>
      </section>
    </div>
  )
}