import { createHmac, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { Payment } from "mercadopago"
import { createClient } from "@/lib/supabase/server"
import type { OrderStatus, PaymentStatus } from "@/lib/supabase/types"

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

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken || accessToken.includes("REPLACE")) return NextResponse.json({ error: "Webhook no configurado." }, { status: 503 })
  const body = await request.json().catch(() => null) as { type?: string; data?: { id?: string }; action?: string } | null
  const paymentId = body?.data?.id
  if (!paymentId || (body.type !== "payment" && body.action !== "payment.created" && body.action !== "payment.updated")) return NextResponse.json({ received: true })
  if (!isValidSignature(request, paymentId)) return NextResponse.json({ error: "Firma inválida." }, { status: 401 })
  const payment = new Payment({ accessToken })
  const detail = await payment.get({ id: paymentId })
  const orderId = detail.external_reference
  if (!orderId) return NextResponse.json({ received: true })
  const supabase = await createClient()
  const paymentStatus: PaymentStatus = detail.status === "approved" ? "aprobado" : detail.status === "refunded" ? "reembolsado" : detail.status === "rejected" ? "rechazado" : "pendiente"
  const orderStatus: OrderStatus = paymentStatus === "aprobado" ? "confirmado" : paymentStatus === "rechazado" ? "cancelado" : "pendiente"
  const { error } = await supabase.from("orders").update({ payment_status: paymentStatus, status: orderStatus } as never).eq("id", orderId)
  if (error) return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 503 })
  return NextResponse.json({ received: true })
}

export async function GET() { return NextResponse.json({ received: true }) }
