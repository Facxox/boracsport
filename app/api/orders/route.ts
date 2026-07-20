import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendOrderConfirmation } from "@/lib/email/send"
import type { Json, OrderRow, ProductRow, ProductVariantRow } from "@/lib/supabase/types"

const MAX_ITEMS = 50
const MAX_QTY = 100
const MAX_BODY_BYTES = 100_000
// Ventana de "carrito reciente": si llega un POST con el mismo cartHash
// dentro de esta ventana, devolvemos la orden existente en vez de crear
// una nueva. 5 minutos es suficiente para que el cliente cambie de método
// de pago sin terminar con dos pedidos idénticos.
const DEDUPE_WINDOW_MS = 5 * 60 * 1000

type ProductItemInput = {
  kind: "product"
  id: string
  qty: number
  variantId?: string | null
  size?: string
  color?: string
}

type DesignItemInput = {
  kind: "design"
  designId: string
  payload: Json
}

type OrderItemInput = ProductItemInput | DesignItemInput

type OrderRequest = {
  items?: unknown
  customer?: { name?: unknown; email?: unknown; phone?: unknown; address?: unknown }
  paymentMethod?: unknown
  paymentReceiptUrl?: unknown
  cartHash?: unknown
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
    if (item.kind === "product") {
      if (!isUuid(item.id) || !Number.isInteger(item.qty) || Number(item.qty) < 1 || Number(item.qty) > MAX_QTY) return null
      const p: ProductItemInput = { kind: "product", id: String(item.id), qty: Number(item.qty) }
      if (item.variantId != null) {
        if (!isUuid(item.variantId)) return null
        p.variantId = String(item.variantId)
      }
      if (typeof item.size === "string") p.size = item.size.slice(0, 60)
      if (typeof item.color === "string") p.color = item.color.slice(0, 60)
      result.push(p)
    } else {
      if (!isUuid(item.designId) || !isRecord(item.payload)) return null
      // Limitar tamaño serializado para evitar payloads de diseño arbitrariamente
      // profundos o grandes en el snapshot del pedido.
      try {
        const serialized = JSON.stringify(item.payload)
        if (serialized.length > 200_000) return null
      } catch {
        return null
      }
      const d: DesignItemInput = { kind: "design", designId: String(item.designId), payload: item.payload as Json }
      result.push(d)
    }
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
  if (!items || !name || !email || !phone) return NextResponse.json({ error: "Completá nombre, email, teléfono y productos." }, { status: 400 })
  // paymentMethod: requerido y debe ser uno de los válidos. Si no, rechazamos
  // explícitamente en vez de caer a un default silencioso.
  if (!validPaymentMethod(body.paymentMethod)) {
    return NextResponse.json({ error: "Método de pago inválido." }, { status: 400 })
  }
  const paymentMethod = body.paymentMethod
  const paymentReceiptUrl = safeUrl(body.paymentReceiptUrl, 1000)
  const cartHash =
    typeof body.cartHash === "string" && body.cartHash.length > 0 && body.cartHash.length <= 200
      ? body.cartHash
      : null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "El email no es válido." }, { status: 400 })

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const productItems: ProductItemInput[] = []
  for (const it of items) if (it.kind === "product") productItems.push(it)
  const productIds = productItems.map((item) => item.id)
  const variantIds = productItems
    .map((item) => item.variantId)
    .filter((v): v is string => typeof v === "string")
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, price, images, stock, active")
    .in("id", productIds)
  if (productsError) return NextResponse.json({ error: "No se pudo verificar el catálogo." }, { status: 503 })
  const productRows = (products ?? []) as unknown as Array<Pick<ProductRow, "id" | "name" | "slug" | "price" | "images" | "stock" | "active">>
  const productMap = new Map(productRows.map((product) => [product.id, product]))

  // Si hay variantIds, cargar variantes en una sola query.
  const variantMap = new Map<string, ProductVariantRow>()
  if (variantIds.length > 0) {
    const { data: variantRows, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, product_id, size, color, sku, stock, price_override, active")
      .in("id", variantIds)
    if (variantsError) return NextResponse.json({ error: "No se pudo verificar el stock." }, { status: 503 })
    for (const v of (variantRows ?? []) as unknown as ProductVariantRow[]) {
      variantMap.set(v.id, v)
    }
  }

  const snapshot: Json[] = []
  let subtotal = 0
  let hasPhysical = false
  const variantConsumption: { id: string; qty: number; stockBefore: number }[] = []
  for (const item of items) {
    if (item.kind === "design") {
      snapshot.push({ kind: "design", designId: item.designId!, payload: item.payload!, customPrice: 0, qty: 1, previewLabel: "Diseño personalizado" })
      continue
    }
    const product = productMap.get(item.id!)
    if (!product || !product.active) {
      return NextResponse.json({ error: "Uno de los productos ya no está disponible." }, { status: 409 })
    }
    const quantity = item.qty!

    let unitPrice = Number(product.price)
    let stockAvailable = Number(product.stock ?? 0)

    if (item.variantId) {
      const variant = variantMap.get(item.variantId)
      if (!variant || variant.product_id !== product.id || !variant.active) {
        return NextResponse.json({ error: "Una de las variantes ya no está disponible." }, { status: 409 })
      }
      stockAvailable = Number(variant.stock)
      if (variant.price_override != null) unitPrice = Number(variant.price_override)
    }

    if (stockAvailable < quantity) {
      return NextResponse.json({ error: `Sin stock suficiente para "${product.name}". Quedan ${stockAvailable}.` }, { status: 409 })
    }

    subtotal += unitPrice * quantity
    hasPhysical = true
    snapshot.push({
      kind: "product",
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: unitPrice,
      qty: quantity,
      image: product.images[0] ?? null,
      variantId: item.variantId ?? null,
      size: item.size ?? null,
      color: item.color ?? null,
    })
    if (item.variantId) {
      variantConsumption.push({ id: item.variantId, qty: quantity, stockBefore: stockAvailable })
    } else {
      // Legacy: registrar consumo contra el producto top-level
      variantConsumption.push({ id: `legacy:${product.id}`, qty: quantity, stockBefore: stockAvailable })
    }
  }

  const shipping = hasPhysical ? 250 : 0
  const total = subtotal + shipping
  const shippingDetails: Json = {
    name,
    email,
    phone,
    address: address ?? "",
    source: "checkout",
    ...(cartHash ? { cartHash } : {}),
  }
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

  // Dedupe: si llegó un cartHash y ya hay una orden reciente con el mismo
  // hash y mismo email/phone, devolvemos esa en vez de crear la nueva.
  // Se hace DESPUÉS de crear la orden nueva porque queremos que el insert
  // confirme que el carrito es válido (stock, variantes, etc). Si la
  // orden nueva calza con una previa, borramos la nueva y devolvemos la
  // vieja. Esto evita crear pedidos fantasma por una doble-click.
  if (cartHash) {
    const sinceIso = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString()
    const { data: existing } = await supabase
      .from("orders")
      .select("id, payment_method, total, subtotal, status, payment_status, created_at, shipping_details")
      .eq("shipping_details->>cartHash", cartHash)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existing && (existing as { id: string }).id !== orderId) {
      const ex = existing as {
        id: string
        payment_method: string
        total: number
        subtotal: number
        status: string
        payment_status: string
        created_at: string
        shipping_details: Record<string, unknown> | null
      }
      const exShipping = ex.shipping_details ?? {}
      const sameCustomer =
        (typeof exShipping.email === "string" ? exShipping.email.toLowerCase() : "") === email.toLowerCase() &&
        (typeof exShipping.phone === "string" ? exShipping.phone.replace(/\D/g, "") : "") === phone.replace(/\D/g, "")
      if (sameCustomer) {
        // Rollback: borramos la orden recién creada y devolvemos la previa.
        await supabase.from("orders").delete().eq("id", orderId)
        return NextResponse.json(
          {
            orderId: ex.id,
            subtotal: Number(ex.subtotal),
            shipping: Math.max(0, Number(ex.total) - Number(ex.subtotal)),
            total: Number(ex.total),
            requiresCoordination: items.some((item) => item.kind === "design"),
            reused: true,
          },
          { status: 200 },
        )
      }
    }
  }

  // Best-effort: comprobante.
  if (paymentReceiptUrl) {
    await supabase
      .from("orders")
      .update({ payment_receipt_url: paymentReceiptUrl } as never)
      .eq("id", orderId)
  }

  // Decrementar stock. Usamos service role para bypassear RLS y aplicamos
  // gte('stock', qty) para evitar vender sobre stock negativo (concurrencia).
  const service = createServiceClient()
  if (!service) {
    // Sin service role no podemos decrementar de forma confiable → deshacemos
    // la orden para no cobrar algo que no podemos garantizar.
    await supabase.from("orders").delete().eq("id", orderId)
    return NextResponse.json(
      { error: "Servicio no disponible. Contactanos por WhatsApp para finalizar tu pedido." },
      { status: 503 },
    )
  }
  for (const cons of variantConsumption) {
    const table = cons.id.startsWith("legacy:") ? "products" : "product_variants"
    const eq = cons.id.startsWith("legacy:") ? cons.id.slice("legacy:".length) : cons.id
    const { error: decErr, count } = await service
      .from(table)
      .update({ stock: cons.stockBefore - cons.qty } as never, { count: "exact" })
      .eq("id", eq)
      .gte("stock", cons.qty)
    if (decErr || count === 0) {
      // Otro request se llevó la última unidad. Rollback de la orden.
      await service.from("orders").delete().eq("id", orderId)
      return NextResponse.json(
        { error: "Sin stock suficiente para uno de los productos. Volvé a intentar." },
        { status: 409 },
      )
    }
  }

  // Email: fire-and-forget (no bloquea la respuesta).
  if (paymentMethod === "transfer" || paymentMethod === "mercadopago") {
    sendOrderConfirmation({
      orderId,
      customer: { name, email, phone, address: address ?? "" },
      items: snapshot as unknown as Json,
      subtotal,
      shipping,
      total,
      paymentMethod,
    }).catch((err) => console.warn("[orders:email] failed", err))
  }

  return NextResponse.json({ orderId, subtotal, shipping, total, requiresCoordination: items.some((item) => item.kind === "design") }, { status: 201 })
}

// GET: devuelve los pedidos del usuario logueado (no anónimos).
export async function GET() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const { data, error } = await supabase
    .from("orders")
    .select("id, total, subtotal, status, payment_method, payment_status, items, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 503 })
  return NextResponse.json({ orders: data ?? [] })
}