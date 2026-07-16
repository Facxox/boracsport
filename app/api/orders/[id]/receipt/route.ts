import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { OrderRow, UserRole } from "@/lib/supabase/types"

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const
const MAX_BYTES = 8 * 1024 * 1024
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

interface ShippingDetails {
  name?: string
  email?: string
  phone?: string
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  // Parse form data ONCE up front (body is a stream — only readable one time).
  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }
  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, payment_method, payment_receipt_url, shipping_details")
    .eq("id", id)
    .maybeSingle()

  if (orderError) {
    return NextResponse.json({ error: "No se pudo consultar el pedido." }, { status: 503 })
  }
  if (!orderData) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
  }

  const order = orderData as Pick<OrderRow, "id" | "user_id" | "payment_method" | "payment_receipt_url" | "shipping_details">

  // Authorization: caller must be admin OR the order's user OR the guest who placed it.
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    const role = (profile as { role?: UserRole } | null)?.role
    isAdmin = role === "admin" || role === "superadmin"
  }

  let isOwner = false
  if (!isAdmin) {
    if (order.user_id && user && order.user_id === user.id) {
      isOwner = true
    } else if (!order.user_id && !user) {
      // Guest caller: must provide matching name + email + phone in the form body to prove ownership.
      const guestName = String(formData.get("guest_name") ?? "").trim().toLowerCase()
      const guestEmail = String(formData.get("guest_email") ?? "").trim().toLowerCase()
      const guestPhone = String(formData.get("guest_phone") ?? "").trim()
      const shipping = order.shipping_details as ShippingDetails
      if (
        shipping &&
        guestEmail &&
        guestName &&
        guestPhone &&
        guestEmail === String(shipping.email ?? "").trim().toLowerCase() &&
        guestName === String(shipping.name ?? "").trim().toLowerCase() &&
        guestPhone === String(shipping.phone ?? "").trim()
      ) {
        isOwner = true
      }
    }
  }

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  if (order.payment_method !== "transfer") {
    return NextResponse.json({ error: "Este pedido no es por transferencia" }, { status: 400 })
  }

  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return NextResponse.json({ error: `Tipo no permitido: ${file.type}` }, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Archivo demasiado grande (máx 8MB)" }, { status: 413 })
  }

  const service = createServiceClient()
  if (!service) {
    return NextResponse.json(
      { error: "Servicio de storage no disponible. Falta configurar SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    )
  }

  const ext = EXT_BY_MIME[file.type] ?? "jpg"
  const path = `${id}/${crypto.randomUUID()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await service.storage
    .from("boracsport_orders")
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { error: updateError } = await service
    .from("orders")
    .update({ payment_receipt_url: path } as never)
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const { data: signed, error: signError } = await service.storage
    .from("boracsport_orders")
    .createSignedUrl(path, 60 * 60 * 24 * 7)

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ path })
  }

  return NextResponse.json({ path, url: signed.signedUrl })
}