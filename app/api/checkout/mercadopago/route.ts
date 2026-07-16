import { NextResponse } from "next/server"
import { Preference } from "mercadopago"
import { getBaseUrl } from "@/lib/env"

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken || accessToken.includes("REPLACE")) return NextResponse.json({ error: "Mercado Pago no está configurado todavía." }, { status: 503 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }) }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 })
  const data = body as { items?: unknown; customer?: unknown }
  const response = await fetch(new URL("/api/orders", request.url), { method: "POST", headers: { "Content-Type": "application/json", cookie: request.headers.get("cookie") ?? "" }, body: JSON.stringify({ items: data.items, customer: data.customer, paymentMethod: "mercadopago" }) })
  const order = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json(order, { status: response.status })
  if (order.requiresCoordination || Number(order.total) <= 0) return NextResponse.json({ error: "Este pedido requiere coordinación antes de pagar." }, { status: 422 })
  const baseUrl = getBaseUrl()
  const preference = new Preference({ accessToken })
  const created = await preference.create({ body: { external_reference: order.orderId, items: [{ id: order.orderId, title: `Pedido Borac Sport #${String(order.orderId).slice(0, 8)}`, quantity: 1, unit_price: Number(order.total), currency_id: "UYU" }], back_urls: { success: `${baseUrl}/checkout?status=success&order=${order.orderId}`, failure: `${baseUrl}/checkout?status=failure&order=${order.orderId}`, pending: `${baseUrl}/checkout?status=pending&order=${order.orderId}` }, auto_return: "approved", notification_url: `${baseUrl}/api/checkout/mercadopago/webhook` } })
  return NextResponse.json({ orderId: order.orderId, initPoint: created.init_point ?? created.sandbox_init_point ?? null })
}
