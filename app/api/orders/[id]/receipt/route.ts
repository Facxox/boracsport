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

// Magic bytes para verificar que el contenido coincide con el MIME declarado.
// Sin esta verificación, el cliente puede declarar image/jpeg y subir un
// ejecutable o un script PHP. Esto NO es defensa completa (los atacantes
// sofisticados pueden polimorfar payloads en imágenes válidas), pero
// filtra los casos triviales.
const MAGIC_BYTES: Record<string, { offset: number; bytes: number[] }[]> = {
  "image/jpeg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  "image/png": [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  "image/webp": [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  ],
}

function verifyMagicBytes(buffer: Buffer, mime: string): boolean {
  const checks = MAGIC_BYTES[mime]
  if (!checks) return false
  for (const c of checks) {
    if (buffer.length < c.offset + c.bytes.length) return false
    for (let i = 0; i < c.bytes.length; i++) {
      if (buffer[c.offset + i] !== c.bytes[i]) return false
    }
  }
  return true
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

interface ShippingDetails {
  name?: string
  email?: string
  phone?: string
}

// Rate limit in-memory por orderId+ip. Limpieza lazy: cada hit borra entradas
// más viejas que la ventana. Suficiente para una sola instancia de Next.js;
// en multi-instancia habría que mover esto a Redis/Upstash.
const RATE_WINDOW_MS = 60_000 // 1 minuto
const RATE_MAX = 5 // 5 uploads por minuto por orderId+ip
const rateBucket = new Map<string, number[]>()
function rateLimit(key: string): boolean {
  const now = Date.now()
  const arr = (rateBucket.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (arr.length >= RATE_MAX) {
    rateBucket.set(key, arr)
    return false
  }
  arr.push(now)
  rateBucket.set(key, arr)
  // Limpieza oportunista para evitar crecimiento del Map.
  if (rateBucket.size > 5000) {
    for (const [k, ts] of rateBucket) {
      if (ts.every((t) => now - t >= RATE_WINDOW_MS)) rateBucket.delete(k)
    }
  }
  return true
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  // Cap temprano del body para evitar cargar archivos enormes en memoria
  // antes de la autenticación.
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > MAX_BYTES * 1.2) {
    return NextResponse.json({ error: "Petición demasiado grande." }, { status: 413 })
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
  // Rate limit antes de cualquier consulta pesada.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  if (!rateLimit(`${id}:${ip}`)) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá un momento." }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, payment_method, payment_receipt_url, shipping_details, created_at")
    .eq("id", id)
    .maybeSingle()

  if (orderError) {
    return NextResponse.json({ error: "No se pudo consultar el pedido." }, { status: 503 })
  }
  if (!orderData) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
  }

  const order = orderData as Pick<OrderRow, "id" | "user_id" | "payment_method" | "payment_receipt_url" | "shipping_details"> & { created_at: string }

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
      // Guest caller: debe probar ownership con datos consistentes. Exigimos:
      //  1. Coincidencia exacta (case-insensitive) de email + phone + name.
      //  2. Pedido creado en los últimos 7 días (anti-replay).
      //  3. El match se hashea en logs, no se loguean valores en claro.
      const guestName = String(formData.get("guest_name") ?? "").trim().toLowerCase()
      const guestEmail = String(formData.get("guest_email") ?? "").trim().toLowerCase()
      const guestPhone = String(formData.get("guest_phone") ?? "").trim()
      const shipping = order.shipping_details as ShippingDetails
      const orderEmail = String(shipping?.email ?? "").trim().toLowerCase()
      const orderName = String(shipping?.name ?? "").trim().toLowerCase()
      const orderPhone = String(shipping?.phone ?? "").trim()
      const ageMs = Date.now() - new Date(order.created_at).getTime()
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
      const fresh = Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= SEVEN_DAYS
      if (
        shipping &&
        guestEmail &&
        guestName &&
        guestPhone &&
        fresh &&
        guestEmail === orderEmail &&
        guestName === orderName &&
        guestPhone === orderPhone
      ) {
        isOwner = true
      } else if (!fresh) {
        // No logueamos el hash para no leak; solo decimos "vencido".
        console.warn(`[receipt] guest auth: order ${id} outside 7d window`)
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
  if (!verifyMagicBytes(buffer, file.type)) {
    return NextResponse.json({ error: "Contenido del archivo no coincide con el tipo declarado." }, { status: 415 })
  }
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