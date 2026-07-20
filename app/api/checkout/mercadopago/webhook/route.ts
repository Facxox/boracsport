import { createHmac, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { Payment } from "mercadopago"
import { createClient } from "@/lib/supabase/server"
import type { OrderRow, OrderStatus, PaymentStatus } from "@/lib/supabase/types"

function isValidSignature(request: Request, paymentId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret || secret.includes("REPLACE")) return false
  const signature = request.headers.get("x-signature")
  const requestId = request.headers.get("x-request-id")
  if (!signature || !requestId) return false
  const provided = signature.split(",").map((part) => part.trim().split("=")).find(([key]) => key === "v1")?.[1]
  if (!provided) return false
  const manifest = `id:${paymentId};request-id:${requestId};ts:${signature.split(",").map((part) => part.trim().split("=")).find(([key]) => key === "ts")?.[1] ?? ""};`
  const expected = createHmac("sha256", secret).update(manifest).digest("hex")
  const providedBuffer = Buffer.from(provided, "hex")
  const expectedBuffer = Buffer.from(expected, "hex")
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer)
}

// Orden de "frescura" para evitar que un reintento viejo sobreescriba un
// estado más reciente (ej. approved después de refunded).
const STATUS_RANK: Record<PaymentStatus, number> = {
  pendiente: 0,
  rechazado: 1,
  reembolsado: 2,
  aprobado: 3,
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken || accessToken.includes("REPLACE")) {
      console.error("[mp-webhook] MERCADOPAGO_ACCESS_TOKEN no configurado")
      return NextResponse.json({ error: "Webhook no configurado." }, { status: 503 })
    }
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    if (!secret || secret.includes("REPLACE")) {
      console.error("[mp-webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado")
      return NextResponse.json({ error: "Webhook no configurado." }, { status: 503 })
    }
    const body = await request.json().catch(() => null) as { type?: string; data?: { id?: string }; action?: string } | null
    const paymentId = body?.data?.id
    if (!paymentId || (body.type !== "payment" && body.action !== "payment.created" && body.action !== "payment.updated")) return NextResponse.json({ received: true })
    if (!isValidSignature(request, paymentId)) return NextResponse.json({ error: "Firma inválida." }, { status: 401 })
    const payment = new Payment({ accessToken })
    let detail: Awaited<ReturnType<typeof payment.get>>
    try {
      detail = await payment.get({ id: paymentId })
    } catch (mpErr: unknown) {
      // Si MP devuelve 404 o el payment no existe, dejamos de reintentar con
      // un 200 acknowledged. Cualquier otro error sigue siendo 500.
      const status = (mpErr as { status?: number })?.status
      if (status === 404 || status === 400) {
        console.warn(`[mp-webhook] payment ${paymentId} no existe en MP, ignorando`)
        return NextResponse.json({ received: true, ignored: "payment_not_found" })
      }
      throw mpErr
    }
    const orderId = detail.external_reference
    if (!orderId) return NextResponse.json({ received: true })
    const supabase = await createClient()
    const incomingPayment: PaymentStatus = detail.status === "approved" ? "aprobado" : detail.status === "refunded" ? "reembolsado" : detail.status === "rejected" ? "rechazado" : "pendiente"
    const incomingOrder: OrderStatus = incomingPayment === "aprobado" ? "confirmado" : incomingPayment === "rechazado" ? "cancelado" : "pendiente"

    // Idempotencia: si el estado guardado es "más fresco" que el entrante, no
    // sobreescribimos. Esto cubre reintentos fuera de orden de MP.
    const { data: current, error: fetchErr } = await supabase
      .from("orders")
      .select("payment_status, status")
      .eq("id", orderId)
      .maybeSingle()
    if (fetchErr) {
      console.error("[mp-webhook] fetch order error:", fetchErr.message)
      return NextResponse.json({ error: "No se pudo consultar el pedido." }, { status: 503 })
    }
    if (current) {
      const currentRank = STATUS_RANK[(current as Pick<OrderRow, "payment_status">).payment_status] ?? -1
      if (currentRank > STATUS_RANK[incomingPayment]) {
        return NextResponse.json({ received: true, ignored: "stale" })
      }
    }

    const { error } = await supabase.from("orders").update({ payment_status: incomingPayment, status: incomingOrder } as never).eq("id", orderId)
    if (error) return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 503 })
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[mp-webhook] unhandled error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function GET() { return NextResponse.json({ received: true }) }
