import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Json, OrderStatus, PaymentStatus } from "@/lib/supabase/types"

export type AnalyticsPeriod = "7" | "30" | "90" | "all"

export type RankingRow = {
  label: string
  units: number
  revenue: number
}

export type FunnelStage = {
  key: string
  label: string
  count: number
}

/**
 * Snapshot que consume el panel admin. Todo lo que es plata está calculado
 * sobre pedidos con pago APROBADO (no sólo status confirmado) — antes se
 * mezclaba "pendiente de cobrar" con "cobrado" y el revenue mentía.
 */
export type AnalyticsSnapshot = {
  period: AnalyticsPeriod
  from: string | null
  previousFrom: string | null
  /** Total crudo de pedidos en el período (incluye cancelados, pendientes, rechazados). */
  ordersTotal: number
  /** Pedidos con status válido Y pago aprobado. */
  validOrders: number
  revenue: number
  units: number
  /** Mediana del total por pedido (resistente a outliers). */
  medianTicket: number
  designs: number
  averageLogos: number
  /** validOrders / ordersTotal (0..1). Si no hay pedidos, 0. */
  conversionRate: number
  /** ordersTotal - validOrders. */
  lostOrders: number
  /** Snapshot del período anterior (misma duración, inmediatamente antes). */
  previousRevenue: number
  previousValidOrders: number
  /** (revenue - previousRevenue) / previousRevenue (0..N). 0 si no hay base comparable. */
  revenueDelta: number
  topProducts: RankingRow[]
  topCategories: RankingRow[]
  /** Categorías ordenadas por ticket promedio (revenue/units). */
  topCategoriesByTicket: Array<RankingRow & { ticket: number }>
  topDesigns: RankingRow[]
  topColors: Array<{ label: string; count: number }>
  /**
   * Embudo de status: cuántos pedidos están en cada estado del flujo
   * principal. Útil para entender dónde se cae la conversión.
   */
  funnel: FunnelStage[]
  /**
   * Conteo por payment_status (aprobado / pendiente / rechazado / reembolsado).
   * Complementa al funnel para entender el motivo de las pérdidas.
   */
  payments: Array<{ label: PaymentStatus; count: number }>
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

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  aprobado: "Aprobados",
  pendiente: "Pendientes",
  rechazado: "Rechazados",
  reembolsado: "Reembolsados",
}

const FUNNEL_ORDER: Array<{ key: OrderStatus; label: string }> = [
  { key: "pendiente", label: "Pendientes" },
  { key: "confirmado", label: "Confirmados" },
  { key: "en_produccion", label: "En producción" },
  { key: "enviado", label: "Enviados" },
  { key: "entregado", label: "Entregados" },
]

/** Strings que NO son colores reales y no deben contaminar el top. */
const COLOR_PLACEHOLDERS = new Set([
  "color no indicado",
  "sin color",
  "n/a",
  "no indicado",
  "",
])

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

function sortRanking(map: Map<string, RankingRow>, top = 5) {
  return [...map.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, top)
}

function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

type PeriodWindow = {
  /** Inicio del período actual (inclusive). null si "all". */
  from: string | null
  /** Inicio del período previo (exclusivo del actual, inclusivo). null si "all". */
  previousFrom: string | null
}

function periodWindow(period: AnalyticsPeriod): PeriodWindow {
  if (period === "all") return { from: null, previousFrom: null }
  const days = Number(period)
  const now = Date.now()
  return {
    from: new Date(now - days * 86_400_000).toISOString(),
    previousFrom: new Date(now - days * 2 * 86_400_000).toISOString(),
  }
}

export async function getAnalytics(periodInput?: string): Promise<AnalyticsSnapshot> {
  const period = normalizePeriod(periodInput)
  const { from, previousFrom } = periodWindow(period)
  const supabase = await createClient()

  // Traemos todos los pedidos desde el inicio del período previo (si aplica)
  // así podemos calcular el snapshot del período anterior en el mismo viaje.
  const lowerBound = previousFrom ?? from
  let ordersQuery = supabase
    .from("orders")
    .select("id, items, subtotal, total, status, payment_status, created_at")
    .order("created_at", { ascending: false })
  if (lowerBound) ordersQuery = ordersQuery.gte("created_at", lowerBound)

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
  const payments = new Map<PaymentStatus, number>()

  // Totales del período actual.
  let revenue = 0
  let units = 0
  let validOrders = 0
  let designs = 0
  let totalLogos = 0
  const validTickets: number[] = []

  // Totales del período anterior (sólo plata y conteo, no rankings).
  let previousRevenue = 0
  let previousValidOrders = 0

  for (const order of orders) {
    const createdAt = order.created_at
    // previousFrom y from siempre van juntos: o son los dos null ("all") o
    // los dos strings (períodos cerrados). Si previousFrom existe, from
    // también, y podemos comparar fechas.
    const inCurrent = !from || createdAt >= from
    const inPrevious =
      !!previousFrom && !!from && createdAt < from && createdAt >= previousFrom
    if (!inCurrent && !inPrevious) continue

    // Conteos crudos por status y payment (sólo del período actual; el
    // anterior sólo nos interesa para revenue/validOrders).
    if (inCurrent) {
      statuses.set(order.status, (statuses.get(order.status) ?? 0) + 1)
      payments.set(order.payment_status, (payments.get(order.payment_status) ?? 0) + 1)
    }

    // "Venta válida" = status en el flujo principal Y pago aprobado.
    const valid =
      VALID_STATUSES.includes(order.status) && order.payment_status === "aprobado"

    if (inCurrent) {
      if (valid) {
        validOrders += 1
        const total = Number(order.total) || 0
        revenue += total
        validTickets.push(total)
      }
    } else if (inPrevious && valid) {
      previousValidOrders += 1
      previousRevenue += Number(order.total) || 0
    }

    if (!valid || !inCurrent) continue

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
        const template =
          typeof payload.templateName === "string" && payload.templateName.trim()
            ? payload.templateName
            : "Diseño personalizado"
        const rawColor =
          typeof payload.baseColor === "string" && payload.baseColor.trim()
            ? payload.baseColor.trim()
            : ""
        const logos = Array.isArray(payload.logos) ? payload.logos.length : 0
        totalLogos += logos
        addRanking(designRanking, template, 1, 0)
        if (rawColor && !COLOR_PLACEHOLDERS.has(rawColor.toLowerCase())) {
          colors.set(rawColor, (colors.get(rawColor) ?? 0) + 1)
        }
      }
    }
  }

  const ordersTotal = [...statuses.values()].reduce((acc, n) => acc + n, 0)
  const conversionRate = ordersTotal ? validOrders / ordersTotal : 0
  const lostOrders = ordersTotal - validOrders
  const revenueDelta = previousRevenue > 0 ? (revenue - previousRevenue) / previousRevenue : 0

  const funnel: FunnelStage[] = FUNNEL_ORDER.map(({ key, label }) => ({
    key,
    label,
    count: statuses.get(key) ?? 0,
  }))

  const topCategoriesByTicket = [...categoryRanking.values()]
    .map((row) => ({ ...row, ticket: row.units ? row.revenue / row.units : 0 }))
    .sort((a, b) => b.ticket - a.ticket)
    .slice(0, 5)

  const statusRows = [...statuses.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }))

  const paymentRows: Array<{ label: PaymentStatus; count: number }> = (
    ["aprobado", "pendiente", "rechazado", "reembolsado"] as PaymentStatus[]
  ).map((label) => ({ label, count: payments.get(label) ?? 0 }))

  return {
    period,
    from,
    previousFrom,
    ordersTotal,
    validOrders,
    revenue,
    units,
    medianTicket: median(validTickets),
    designs,
    averageLogos: designs ? totalLogos / designs : 0,
    conversionRate,
    lostOrders,
    previousRevenue,
    previousValidOrders,
    revenueDelta,
    topProducts: sortRanking(productRanking),
    topCategories: sortRanking(categoryRanking),
    topCategoriesByTicket,
    topDesigns: sortRanking(designRanking),
    topColors: [...colors.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count })),
    funnel,
    payments: paymentRows,
    statuses: statusRows,
  }
}

export function formatStatus(label: OrderStatus) {
  return STATUS_LABELS[label]
}

export function formatPaymentStatus(label: PaymentStatus) {
  return PAYMENT_LABELS[label]
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return value === "pendiente" || value === "aprobado" || value === "rechazado" || value === "reembolsado"
}
