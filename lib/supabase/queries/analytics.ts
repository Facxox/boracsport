import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Json, OrderStatus, PaymentStatus } from "@/lib/supabase/types"

export type AnalyticsPeriod = "7" | "30" | "90" | "all"

export type RankingRow = {
  label: string
  units: number
  revenue: number
}

export type AnalyticsSnapshot = {
  period: AnalyticsPeriod
  from: string | null
  orders: number
  validOrders: number
  revenue: number
  units: number
  averageTicket: number
  designs: number
  averageLogos: number
  topProducts: RankingRow[]
  topCategories: RankingRow[]
  topDesigns: RankingRow[]
  topColors: Array<{ label: string; count: number }>
  statuses: Array<{ label: OrderStatus; count: number }>
}

type RawOrder = Pick<
  import("@/lib/supabase/types").OrderRow,
  "id" | "items" | "subtotal" | "total" | "status" | "payment_status" | "created_at"
>

type ProductLookup = { id: string; name: string; category: string }

const VALID_STATUSES: OrderStatus[] = ["confirmado", "en_produccion", "enviado", "entregado"]
const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendientes",
  confirmado: "Confirmadas",
  en_produccion: "En producción",
  enviado: "Enviadas",
  entregado: "Entregadas",
  cancelado: "Canceladas",
}

function normalizePeriod(value: string | undefined): AnalyticsPeriod {
  return value === "7" || value === "90" || value === "all" ? value : "30"
}

function isRecord(value: Json | unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asItems(value: Json): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return []
  return value.reduce<Array<Record<string, unknown>>>((items, item) => {
    if (isRecord(item)) items.push(item)
    return items
  }, [])
}

function addRanking(map: Map<string, RankingRow>, label: string, units: number, revenue: number) {
  const current = map.get(label) ?? { label, units: 0, revenue: 0 }
  current.units += units
  current.revenue += revenue
  map.set(label, current)
}

function sortRanking(map: Map<string, RankingRow>) {
  return [...map.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, 5)
}

export async function getAnalytics(periodInput?: string): Promise<AnalyticsSnapshot> {
  const period = normalizePeriod(periodInput)
  const fromDate = period === "all" ? null : new Date(Date.now() - Number(period) * 86_400_000)
  const supabase = await createClient()

  let ordersQuery = supabase
    .from("orders")
    .select("id, items, subtotal, total, status, payment_status, created_at")
    .order("created_at", { ascending: false })
  if (fromDate) ordersQuery = ordersQuery.gte("created_at", fromDate.toISOString())

  const [{ data: rawOrders }, { data: rawProducts }] = await Promise.all([
    ordersQuery,
    supabase.from("products").select("id, name, category"),
  ])

  const orders = (rawOrders ?? []) as unknown as RawOrder[]
  const products = (rawProducts ?? []) as unknown as ProductLookup[]
  const productById = new Map(products.map((product) => [product.id, product]))
  const productRanking = new Map<string, RankingRow>()
  const categoryRanking = new Map<string, RankingRow>()
  const designRanking = new Map<string, RankingRow>()
  const colors = new Map<string, number>()
  const statuses = new Map<OrderStatus, number>()

  let revenue = 0
  let units = 0
  let validOrders = 0
  let designs = 0
  let totalLogos = 0

  for (const order of orders) {
    statuses.set(order.status, (statuses.get(order.status) ?? 0) + 1)
    const valid = VALID_STATUSES.includes(order.status) && order.payment_status !== "rechazado" && order.payment_status !== "reembolsado"
    if (!valid) continue
    validOrders += 1
    revenue += Number(order.total) || 0

    for (const item of asItems(order.items)) {
      if (item.kind === "product") {
        const quantity = Math.max(0, Number(item.qty) || 0)
        const price = Math.max(0, Number(item.price) || 0)
        const product = typeof item.id === "string" ? productById.get(item.id) : undefined
        const name = product?.name || (typeof item.name === "string" ? item.name : "Producto sin nombre")
        const category = product?.category || "Sin categoría"
        units += quantity
        addRanking(productRanking, name, quantity, price * quantity)
        addRanking(categoryRanking, category, quantity, price * quantity)
      }
      if (item.kind === "design") {
        designs += 1
        const payload = isRecord(item.payload) ? item.payload : {}
        const template = typeof payload.templateName === "string" && payload.templateName.trim() ? payload.templateName : "Diseño personalizado"
        const color = typeof payload.baseColor === "string" && payload.baseColor.trim() ? payload.baseColor : "Color no indicado"
        const logos = Array.isArray(payload.logos) ? payload.logos.length : 0
        totalLogos += logos
        addRanking(designRanking, template, 1, 0)
        colors.set(color, (colors.get(color) ?? 0) + 1)
      }
    }
  }

  const statusRows = [...statuses.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }))
  return {
    period,
    from: fromDate?.toISOString() ?? null,
    orders: orders.length,
    validOrders,
    revenue,
    units,
    averageTicket: validOrders ? revenue / validOrders : 0,
    designs,
    averageLogos: designs ? totalLogos / designs : 0,
    topProducts: sortRanking(productRanking),
    topCategories: sortRanking(categoryRanking),
    topDesigns: sortRanking(designRanking),
    topColors: [...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, count]) => ({ label, count })),
    statuses: statusRows,
  }
}

export function formatStatus(label: OrderStatus) {
  return STATUS_LABELS[label]
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return value === "pendiente" || value === "aprobado" || value === "rechazado" || value === "reembolsado"
}
