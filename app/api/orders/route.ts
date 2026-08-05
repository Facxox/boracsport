import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendOrderConfirmation } from "@/lib/email/send"
import type { Json, ProductRow, ProductVariantRow } from "@/lib/supabase/types"

const MAX_ITEMS = 50
const MAX_QTY = 100
const MAX_BODY_BYTES = 100_000
// Ventana de "carrito reciente": si llega un POST con el mismo cartHash
// dentro de esta ventana, devolvemos la orden existente en vez de crear
// una nueva. 5 minutos es suficiente para que el cliente cambie de método
// de pago sin terminar con dos pedidos idénticos.

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
  customer?: { name?: unknown; email?: unknown; phone?: unknown; address?: unknown; deliveryMethod?: unknown }
  paymentMethod?: unknown
  paymentReceiptUrl?: unknown
  cartHash?: unknown
  /**
   * Bug 1.3: cuando el cliente repite un carrito idéntico al anterior
   * (mismo cartHash) y quiere registrar un pedido NUEVO en vez de ser
   * redirigido al viejo. Por defecto false.
   */
  forceNew?: unknown
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
  // Método de entrega elegido por el cliente en /checkout. Default "shipping"
  // para compatibilidad con llamadas viejas (PDP / drawer) que no lo envían.
  const deliveryMethod: "shipping" | "pickup" =
    customer.deliveryMethod === "pickup" ? "pickup" : "shipping"
  if (!items || !name || !email || !phone) return NextResponse.json({ error: "Completá nombre, email, teléfono y productos." }, { status: 400 })
  // Validamos el formato del teléfono en server (defensa en profundidad — el
  // cliente ya lo valida, pero si alguien bypasea la UI puede mandar basura).
  if (phone.replace(/\D/g, "").length < 6) return NextResponse.json({ error: "Teléfono inválido." }, { status: 400 })
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
  const forceNew = body.forceNew === true
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

  // Defensa contra overflow si el admin inventó un precio absurdo.
  if (!Number.isFinite(subtotal) || subtotal > Number.MAX_SAFE_INTEGER / 4) {
    return NextResponse.json({ error: "Totales fuera de rango." }, { status: 400 })
  }

  // El envío ya no se cobra en línea: el cliente eligió "Envío" o "Pickup" en
  // el checkout y la gente de Borac coordina el precio del envío por WhatsApp
  // cuando corresponde. El `total` que ve la pasarela y la BD es el subtotal.
  const shipping = 0
  const total = subtotal + shipping
  // Si eligió pickup, ignoramos la dirección por las dudas (la UI ya la oculta,
  // pero defendemos en server contra payloads viejos).
  const persistedAddress = deliveryMethod === "pickup" ? "" : address
  const shippingDetails: Json = {
    name,
    email,
    phone,
    address: persistedAddress,
    delivery_method: deliveryMethod,
    source: "checkout",
    ...(cartHash ? { cartHash } : {}),
  }

  // El insert lo realiza la RPC dentro de una transacción que también descuenta
  // stock y aplica dedupe por cartHash. No se hace insert previo desde la API.
  const service = createServiceClient()
  if (!service) {
    return NextResponse.json(
      { error: "Servicio no disponible. Contactanos por WhatsApp para finalizar tu pedido." },
      { status: 503 },
    )
  }

  const rpcPayload = {
    user_id: authData.user?.id ?? null,
    items: snapshot,
    subtotal,
    total,
    payment_method: paymentMethod,
    payment_receipt_url: paymentReceiptUrl,
    shipping_details: shippingDetails,
    cart_hash: cartHash,
    force_new: forceNew,
  } as unknown as Json
  const rpcConsumptions = variantConsumption.map((cons) =>
    cons.id.startsWith("legacy:")
      ? { kind: "product", id: cons.id.slice("legacy:".length), qty: cons.qty }
      : { kind: "variant", id: cons.id, qty: cons.qty },
  ) as unknown as Json

  const { data: rpcResult, error: rpcError } = await service.rpc(
    "create_order_with_stock" as never,
    {
      p_order: rpcPayload,
      p_consumptions: rpcConsumptions,
    } as never,
  )

  if (rpcError) {
    const message = rpcError.message ?? "No se pudo registrar el pedido."
    // PostgREST expone el errcode de Postgres en rpcError.code (o en details
    // como fallback). Preferimos eso sobre parsear el message.
    const code = String(
      (rpcError as { code?: string }).code ?? (rpcError as { details?: string }).details ?? "",
    )
    if (code.includes("P0001") || /insufficient stock/i.test(message)) {
      return NextResponse.json(
        { error: "Sin stock suficiente para uno de los productos. Volvé a intentar." },
        { status: 409 },
      )
    }
    if (code.includes("P0002") || /consumption target not available/i.test(message)) {
      return NextResponse.json(
        { error: "Uno de los productos ya no está disponible." },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: message }, { status: 503 })
  }

  const rpcRow = rpcResult as {
    reused: boolean
    order_id: string
    subtotal: number
    shipping: number
    total: number
  }
  const orderId = rpcRow.order_id

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

  return NextResponse.json(
    {
      orderId: rpcRow.order_id,
      subtotal: Number(rpcRow.subtotal),
      shipping: Number(rpcRow.shipping),
      total: Number(rpcRow.total),
      requiresCoordination: items.some((item) => item.kind === "design"),
      reused: rpcRow.reused,
    },
    { status: rpcRow.reused ? 200 : 201 },
  )
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