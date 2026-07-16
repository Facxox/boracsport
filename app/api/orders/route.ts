import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Json, OrderRow, ProductRow } from "@/lib/supabase/types"

const MAX_ITEMS = 50
const MAX_QTY = 100
const MAX_BODY_BYTES = 100_000

type OrderItemInput = {
  kind: "product" | "design"
  id?: string
  slug?: string
  name?: string
  price?: number
  qty?: number
  image?: string
  designId?: string
  payload?: Json
  customPrice?: number
  previewLabel?: string
  editorUrl?: string
}

type OrderRequest = {
  items?: unknown
  customer?: { name?: unknown; email?: unknown; phone?: unknown; address?: unknown }
  paymentMethod?: unknown
  paymentReceiptUrl?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max ? value.trim() : null
}

function safeUrl(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > max) return null
  try {
    const u = new URL(trimmed)
    if (u.protocol !== "http:" && u.protocol !== "https:") return null
    return u.toString()
  } catch {
    return null
  }
}

function parseItems(value: unknown): OrderItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ITEMS) return null
  const result: OrderItemInput[] = []
  for (const item of value) {
    if (!isRecord(item) || (item.kind !== "product" && item.kind !== "design")) return null
    const parsed: OrderItemInput = { kind: item.kind }
    if (item.kind === "product") {
      if (!isUuid(item.id) || !Number.isInteger(item.qty) || Number(item.qty) < 1 || Number(item.qty) > MAX_QTY) return null
      parsed.id = item.id
      parsed.qty = Number(item.qty)
    } else {
      if (!isUuid(item.designId) || !isRecord(item.payload)) return null
      parsed.designId = item.designId
      parsed.payload = item.payload as Json
      parsed.qty = 1
    }
    result.push(parsed)
  }
  return result
}

function validPaymentMethod(value: unknown): value is "whatsapp" | "transfer" | "mercadopago" {
  return value === "whatsapp" || value === "transfer" || value === "mercadopago"
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0)
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: "El pedido es demasiado grande." }, { status: 413 })

  let body: OrderRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 })
  }

  const items = parseItems(body.items)
  const customer = isRecord(body.customer) ? body.customer : {}
  const name = text(customer.name, 120)
  const email = text(customer.email, 254)
  const phone = text(customer.phone, 40)
  const address = text(customer.address, 300)
  const paymentMethod = validPaymentMethod(body.paymentMethod) ? body.paymentMethod : "whatsapp"
  const paymentReceiptUrl = safeUrl(body.paymentReceiptUrl, 1000)
  if (!items || !name || !email || !phone) return NextResponse.json({ error: "Completá nombre, email, teléfono y productos." }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "El email no es válido." }, { status: 400 })

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const productIds = items.filter((item) => item.kind === "product").map((item) => item.id as string)
  const { data: products, error: productsError } = await supabase.from("products").select("id, name, slug, price, images, stock, active").in("id", productIds)
  if (productsError) return NextResponse.json({ error: "No se pudo verificar el catálogo." }, { status: 503 })
  const productRows = (products ?? []) as unknown as Array<Pick<ProductRow, "id" | "name" | "slug" | "price" | "images" | "stock" | "active">>
  const productMap = new Map(productRows.map((product) => [product.id, product]))
  const snapshot: Json[] = []
  let subtotal = 0
  let hasPhysical = false
  for (const item of items) {
    if (item.kind === "design") {
      snapshot.push({ kind: "design", designId: item.designId!, payload: item.payload!, customPrice: 0, qty: 1, previewLabel: "Diseño personalizado" })
      continue
    }
    const product = productMap.get(item.id!)
    const quantity = item.qty!
    if (!product || !product.active || product.stock < quantity) return NextResponse.json({ error: "Uno de los productos ya no tiene stock disponible." }, { status: 409 })
    const price = Number(product.price)
    subtotal += price * quantity
    hasPhysical = true
    snapshot.push({ kind: "product", id: product.id, slug: product.slug, name: product.name, price, qty: quantity, image: product.images[0] ?? null })
  }

  const shipping = hasPhysical ? 250 : 0
  const total = subtotal + shipping
  const shippingDetails: Json = { name, email, phone, address: address ?? "", source: "checkout" }
  // Insert base sin payment_receipt_url: esa columna se setea después desde
  // /api/orders/[id]/receipt para que el alta del pedido no rompa si la
  // migración 20260723 todavía no se aplicó.
  const insert: Partial<OrderRow> = {
    user_id: authData.user?.id ?? null,
    items: snapshot,
    subtotal,
    total,
    status: "pendiente",
    payment_method: paymentMethod,
    payment_status: "pendiente",
    shipping_details: shippingDetails,
  }
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([insert] as never)
    .select("id")
    .single()
  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "No se pudo registrar el pedido." }, { status: 503 })
  }
  const orderId = (order as { id: string }).id

  // Best-effort: si el cliente ya tenía un comprobante previo (re-intento), lo guardamos.
  // Si la columna no existe todavía, lo ignoramos silenciosamente.
  if (paymentReceiptUrl) {
    await supabase
      .from("orders")
      .update({ payment_receipt_url: paymentReceiptUrl } as never)
      .eq("id", orderId)
  }

  return NextResponse.json({ orderId, subtotal, shipping, total, requiresCoordination: items.some((item) => item.kind === "design") }, { status: 201 })
}

export async function GET() {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405, headers: { Allow: "POST" } })
}
