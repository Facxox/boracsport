// Endpoint público para leer un pedido. Usado por la página de confirmación
// de Mercado Pago (visitante anónimo que vuelve de la pasarela).
//
// Reglas de acceso:
//  - El dueño autenticado siempre puede ver el pedido.
//  - Un visitante anónimo solo si pasa `?email=&phone=` y coinciden con
//    `shipping_details.email` / `shipping_details.phone` (normalizados).
//  - O si la orden tiene menos de 2 horas de creada (sin auth, ventana
//    razonable para volver de la pasarela).
//
// NO expone datos sensibles: devuelve solo lo necesario para mostrar la
// pantalla de confirmación.

import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

const RECENT_WINDOW_MS = 30 * 60 * 1000 // 30 minutos

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

function normalizeEmail(value: string | null): string {
  return (value ?? "").trim().toLowerCase()
}

function normalizePhone(value: string | null): string {
  return (value ?? "").replace(/\D/g, "")
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, payment_method, payment_status, subtotal, total, created_at, shipping_details, user_id")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: "No se pudo consultar el pedido." }, { status: 503 })
  }
  if (!data) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 })
  }

  const order = data as unknown as {
    id: string
    status: string
    payment_method: string
    payment_status: string
    subtotal: number
    total: number
    created_at: string
    shipping_details: Record<string, unknown> | null
    user_id: string | null
  }

  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id ?? null
  const isOwner = userId != null && userId === order.user_id

  // Visitante anónimo: comprobar match por email+phone o ventana de 2h.
  let canViewAnonymous = false
  if (!isOwner) {
    const params = request.nextUrl.searchParams
    const emailParam = normalizeEmail(params.get("email"))
    const phoneParam = normalizePhone(params.get("phone"))
    const shipping = order.shipping_details ?? {}
    const emailMatch =
      emailParam.length > 0 && normalizeEmail(typeof shipping.email === "string" ? shipping.email : null) === emailParam
    const phoneMatch =
      phoneParam.length >= 6 &&
      normalizePhone(typeof shipping.phone === "string" ? shipping.phone : null) === phoneParam

    if (emailMatch && phoneMatch) {
      canViewAnonymous = true
    } else {
      const ageMs = Date.now() - new Date(order.created_at).getTime()
      if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= RECENT_WINDOW_MS) {
        canViewAnonymous = true
      }
    }
  }

  if (!isOwner && !canViewAnonymous) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 })
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    createdAt: order.created_at,
  })
}
