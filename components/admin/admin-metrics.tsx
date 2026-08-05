"use client"

// Sección de inteligencia comercial del panel admin.
// Componente cliente para poder correr CountUp (framer-motion) y
// AnimatedBar cuando las tarjetas entran al viewport.

import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import type { OrderStatus, PaymentStatus } from "@/lib/supabase/types"
import { CountUp } from "@/components/admin/count-up"
import { AnimatedBar } from "@/components/admin/animated-bar"

// Tipos espejo de AnalyticsSnapshot (el original vive en lib/supabase/queries/analytics.ts
// marcado como "server-only", no podemos importarlo desde un client component).
type AnalyticsPeriod = "7" | "30" | "90" | "all"
type RankingRow = { label: string; units: number; revenue: number }
type FunnelStage = { key: string; label: string; count: number }
type AnalyticsSnapshotLike = {
  period: AnalyticsPeriod
  from: string | null
  previousFrom: string | null
  ordersTotal: number
  validOrders: number
  revenue: number
  units: number
  medianTicket: number
  designs: number
  averageLogos: number
  conversionRate: number
  lostOrders: number
  previousRevenue: number
  previousValidOrders: number
  revenueDelta: number
  topProducts: RankingRow[]
  topCategories: RankingRow[]
  topCategoriesByTicket: Array<RankingRow & { ticket: number }>
  topDesigns: RankingRow[]
  topColors: Array<{ label: string; count: number }>
  funnel: FunnelStage[]
  payments: Array<{ label: PaymentStatus; count: number }>
  statuses: Array<{ label: OrderStatus; count: number }>
}

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
  pendiente: "Pendientes de pago",
  rechazado: "Rechazados",
  reembolsado: "Reembolsados",
}

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  "7": "los últimos 7 días",
  "30": "los últimos 30 días",
  "90": "los últimos 90 días",
  all: "todo el historial",
}

function formatUYU(value: number) {
  return `$U ${Math.round(value).toLocaleString("es-UY")}`
}

const CURRENCY_PREFIX = "$U "

function formatPercent(value: number, fractionDigits = 1) {
  return `${(value * 100).toFixed(fractionDigits)}%`
}

/**
 * Tarjeta de métrica individual. Acepta el valor como string preformateado
 * (para deltas %, ratios, etc.) o como número (para CountUp). El sufijo
 * `delta` muestra una pill con flecha indicando crecimiento/caída vs período
 * anterior.
 */
function MetricCard({
  label,
  value,
  isCurrency,
  formatted,
  accent,
  delta,
  deltaSuffix = "",
  href,
}: {
  label: string
  value?: number
  isCurrency?: boolean
  formatted?: string
  accent: "revenue" | "lost" | "conversion" | "ticket" | "delta"
  delta?: number
  deltaSuffix?: string
  href?: string
}) {
  const ringClass =
    accent === "revenue"
      ? "ring-emerald-400/40 from-emerald-500/10"
      : accent === "lost"
      ? "ring-rose-400/40 from-rose-500/10"
      : accent === "conversion"
      ? "ring-amber-400/40 from-amber-500/10"
      : accent === "ticket"
      ? "ring-violet-400/40 from-violet-500/10"
      : "ring-sky-400/40 from-sky-500/10"

  const content = (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${ringClass} via-transparent to-transparent p-4 ring-1 ring-inset`}
    >
      <p className="text-[11px] font-semibold tracking-display text-white/55 uppercase">
        {label}
      </p>
      <p className="mt-3 truncate font-display text-2xl font-extrabold tabular-nums">
        {formatted ? (
          formatted
        ) : isCurrency ? (
          <>
            {CURRENCY_PREFIX}
            <CountUp to={Math.round(value ?? 0)} duration={1.8} />
          </>
        ) : (
          <CountUp to={value ?? 0} duration={1.8} />
        )}
      </p>
      {delta !== undefined ? <DeltaPill delta={delta} suffix={deltaSuffix} /> : null}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-8 h-24 w-24 rounded-full bg-white/5 blur-2xl"
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {content}
      </Link>
    )
  }
  return content
}

function DeltaPill({ delta, suffix = "" }: { delta: number; suffix?: string }) {
  // delta es ratio: 0.12 = +12%. 0 = sin base comparable.
  if (!delta) {
    return (
      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/45">
        <Minus className="h-3 w-3" />
        sin base comparable
      </span>
    )
  }
  const positive = delta > 0
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  const tone = positive
    ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
    : "bg-rose-500/10 text-rose-300 ring-rose-500/30"
  return (
    <span
      className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ring-1 ring-inset ${tone}`}
    >
      <Icon className="h-3 w-3" />
      {(delta * 100).toFixed(1)}%{suffix}
    </span>
  )
}

function RankingSection({
  title,
  rows,
  valueLabel,
  ticketMode = false,
  emptyHint,
}: {
  title: string
  rows: RankingRow[] | Array<RankingRow & { ticket?: number }>
  valueLabel: string
  ticketMode?: boolean
  emptyHint?: string
}) {
  const max = rows[0]?.units || 1
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <span className="text-xs text-white/40">{valueLabel}</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">
          {emptyHint ?? "Sin datos registrados en este período."}
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {rows.map((row, idx) => {
            const pct = Math.max(6, (row.units / max) * 100)
            const hasRevenue = row.revenue > 0
            return (
              <li key={row.label}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2 truncate font-medium">
                    <span className="bg-bg-graphite text-muted-foreground inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="truncate">{row.label}</span>
                  </span>
                  <span className="shrink-0 text-white/55 tabular-nums">
                    {row.units} u.
                    {ticketMode && "ticket" in row && row.ticket ? (
                      <> · {formatUYU(row.ticket)}</>
                    ) : hasRevenue ? (
                      <> · {formatUYU(row.revenue)}</>
                    ) : null}
                  </span>
                </div>
                <div className="mt-2">
                  <AnimatedBar
                    to={pct}
                    duration={1.2 + idx * 0.08}
                    color={
                      idx === 0
                        ? "bg-gradient-to-r from-[#dc2626] to-rose-400"
                        : "bg-[#dc2626]/70"
                    }
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function FunnelSection({ funnel }: { funnel: FunnelStage[] }) {
  const max = funnel.reduce((acc, s) => Math.max(acc, s.count), 0)
  const top = funnel[0]?.count ?? 0
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Embudo de conversión</h2>
        <span className="text-xs text-white/40">status del pedido</span>
      </div>
      {top === 0 ? (
        <p className="mt-6 text-sm text-white/45">
          Sin pedidos registrados en este período.
        </p>
      ) : (
        <ol className="mt-5 space-y-3">
          {funnel.map((stage, idx) => {
            const pct = max ? (stage.count / max) * 100 : 0
            const dropFromTop = top ? 1 - stage.count / top : 0
            return (
              <li key={stage.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-white/40 tabular-nums">
                      {idx + 1}.
                    </span>
                    <span className="font-medium">{stage.label}</span>
                  </span>
                  <span className="text-white/55 tabular-nums">
                    {stage.count}
                    {idx > 0 && dropFromTop > 0 ? (
                      <span className="ml-2 text-rose-300/70">
                        ↓ {(dropFromTop * 100).toFixed(0)}%
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="mt-2">
                  <AnimatedBar
                    to={pct}
                    duration={1 + idx * 0.06}
                    color={
                      idx === 0
                        ? "bg-white/30"
                        : idx === funnel.length - 1
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                        : "bg-[#dc2626]/70"
                    }
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function PaymentsSection({
  payments,
}: {
  payments: Array<{ label: PaymentStatus; count: number }>
}) {
  const total = payments.reduce((acc, p) => acc + p.count, 0)
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Estado de pagos</h2>
        <span className="text-xs text-white/40">payment_status</span>
      </div>
      {total === 0 ? (
        <p className="mt-6 text-sm text-white/45">
          Sin pedidos registrados en este período.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {payments.map((p) => {
            const pct = total ? p.count / total : 0
            const tone =
              p.label === "aprobado"
                ? "text-emerald-300"
                : p.label === "rechazado" || p.label === "reembolsado"
                ? "text-rose-300"
                : "text-amber-300"
            return (
              <li
                key={p.label}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-[11px] font-semibold tracking-display text-white/55 uppercase">
                  {PAYMENT_LABELS[p.label]}
                </p>
                <p className={`mt-2 font-display text-2xl font-extrabold tabular-nums ${tone}`}>
                  <CountUp to={p.count} duration={1.4} />
                </p>
                <p className="mt-1 text-xs text-white/45 tabular-nums">
                  {formatPercent(pct, 1)} del total
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function StatusPillsSection({
  statuses,
}: {
  statuses: Array<{ label: OrderStatus; count: number }>
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
      <h2 className="font-display text-lg font-bold">Estado de pedidos</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {statuses.length ? (
          statuses.map((status) => (
            <Link
              key={status.label}
              href="/admin/pedidos"
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65 transition hover:border-[#dc2626]/60 hover:text-white"
            >
              {STATUS_LABELS[status.label]}: {status.count}
            </Link>
          ))
        ) : (
          <span className="text-sm text-white/45">
            Sin pedidos registrados en este período.
          </span>
        )}
      </div>
    </section>
  )
}

export function AdminMetricsSection({ snapshot }: { snapshot: AnalyticsSnapshotLike }) {
  const period = snapshot.period
  const hasComparison = snapshot.previousRevenue > 0
  const lostBreakdown =
    snapshot.lostOrders > 0
      ? ` · ${snapshot.ordersTotal - snapshot.validOrders} no cobradas`
      : ""
  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-display text-[#dc2626] uppercase">
            Inteligencia comercial
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold">
            Qué está funcionando
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-white/50">
            Pedidos con pago aprobado en {PERIOD_LABELS[period]}
            {hasComparison ? " (vs. el período anterior)" : ""}.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Ingresos cobrados"
          value={snapshot.revenue}
          isCurrency
          accent="revenue"
          delta={snapshot.revenueDelta}
          deltaSuffix=" vs período anterior"
          href="/admin/pedidos"
        />
        <MetricCard
          label="Carrito perdido"
          value={snapshot.lostOrders}
          accent="lost"
          formatted={snapshot.lostOrders > 0 ? `${snapshot.lostOrders}${lostBreakdown}` : "0"}
          href="/admin/pedidos"
        />
        <MetricCard
          label="Conversión"
          formatted={formatPercent(snapshot.conversionRate, 1)}
          accent="conversion"
          href="/admin/pedidos"
        />
        <MetricCard
          label="Ticket mediana"
          value={snapshot.medianTicket}
          isCurrency
          accent="ticket"
          href="/admin/pedidos"
        />
        <MetricCard
          label="vs período anterior"
          formatted={
            hasComparison
              ? formatPercent(snapshot.revenueDelta, 1)
              : "—"
          }
          accent="delta"
          delta={snapshot.revenueDelta}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <FunnelSection funnel={snapshot.funnel} />
        <PaymentsSection payments={snapshot.payments} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <RankingSection
          title="Productos más vendidos"
          rows={snapshot.topProducts}
          valueLabel="unidades · ingresos"
        />
        <RankingSection
          title="Categorías con más salida"
          rows={snapshot.topCategories}
          valueLabel="unidades · ingresos"
        />
        <RankingSection
          title="Categorías con mejor ticket"
          rows={snapshot.topCategoriesByTicket}
          valueLabel="ticket promedio"
          ticketMode
          emptyHint="Sin ventas por categoría en este período."
        />
        <RankingSection
          title="Diseños más solicitados"
          rows={snapshot.topDesigns}
          valueLabel="solicitudes"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
          <h2 className="font-display text-lg font-bold">
            Preferencias del diseñador
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold tracking-display text-white/40 uppercase">
                Colores base
              </p>
              {snapshot.topColors.length ? (
                <ul className="mt-3 space-y-2">
                  {snapshot.topColors.map((color) => (
                    <li
                      key={color.label}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="truncate">{color.label}</span>
                      <span className="text-white/50 tabular-nums">
                        {color.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-white/45">
                  Sin colores registrados en este período.
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-display text-white/40 uppercase">
                Promedio de logos
              </p>
              <p className="mt-3 font-display text-3xl font-extrabold tabular-nums">
                <CountUp
                  to={Math.round(snapshot.averageLogos * 10) / 10}
                  duration={1.6}
                  from={0}
                />
              </p>
              <p className="text-xs text-white/45">logos por diseño</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
          <h2 className="font-display text-lg font-bold">Volumen</h2>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[11px] font-semibold tracking-display text-white/55 uppercase">
                Pedidos totales
              </dt>
              <dd className="mt-2 font-display text-2xl font-extrabold tabular-nums">
                <CountUp to={snapshot.ordersTotal} duration={1.4} />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-display text-white/55 uppercase">
                Pedidos cobrados
              </dt>
              <dd className="mt-2 font-display text-2xl font-extrabold tabular-nums text-emerald-300">
                <CountUp to={snapshot.validOrders} duration={1.4} />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-display text-white/55 uppercase">
                Unidades vendidas
              </dt>
              <dd className="mt-2 font-display text-2xl font-extrabold tabular-nums">
                <CountUp to={snapshot.units} duration={1.4} />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-display text-white/55 uppercase">
                Diseños personalizados
              </dt>
              <dd className="mt-2 font-display text-2xl font-extrabold tabular-nums">
                <CountUp to={snapshot.designs} duration={1.4} />
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="mt-6">
        <StatusPillsSection statuses={snapshot.statuses} />
      </div>
    </section>
  )
}
