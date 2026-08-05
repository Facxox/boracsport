"use client"

// Sección de inteligencia comercial del panel admin.
// Componente cliente para poder correr CountUp (framer-motion) y
// AnimatedBar cuando las tarjetas entran al viewport.

import type { OrderStatus } from "@/lib/supabase/types"
import { CountUp } from "@/components/admin/count-up"
import { AnimatedBar } from "@/components/admin/animated-bar"

// Tipos espejo de AnalyticsSnapshot (el original vive en lib/supabase/queries/analytics.ts
// marcado como "server-only", no podemos importarlo desde un client component).
type AnalyticsPeriod = "7" | "30" | "90" | "all"
type RankingRow = { label: string; units: number; revenue: number }
type AnalyticsSnapshotLike = {
  period: AnalyticsPeriod
  revenue: number
  validOrders: number
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

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendientes",
  confirmado: "Confirmadas",
  en_produccion: "En producción",
  enviado: "Enviadas",
  entregado: "Entregadas",
  cancelado: "Canceladas",
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

function MetricCard({
  label,
  value,
  isCurrency,
  accent,
}: {
  label: string
  value: number
  isCurrency?: boolean
  accent?: "revenue" | "orders" | "units" | "ticket" | "designs"
}) {
  const ringClass =
    accent === "orders"
      ? "ring-[#dc2626]/40 from-[#dc2626]/10"
      : accent === "units"
      ? "ring-[#dc2626]/40 from-[#dc2626]/10"
      : accent === "ticket"
      ? "ring-[#dc2626]/40 from-[#dc2626]/10"
      : accent === "designs"
      ? "ring-[#dc2626]/40 from-[#dc2626]/10"
      : "ring-[#dc2626]/40 from-[#dc2626]/10"

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${ringClass} via-transparent to-transparent p-4 ring-1 ring-inset`}
    >
      <p className="text-[11px] font-semibold tracking-display text-white/55 uppercase">
        {label}
      </p>
      <p className="mt-3 truncate font-display text-2xl font-extrabold tabular-nums">
        {isCurrency ? (
          <>
            {CURRENCY_PREFIX}
            <CountUp to={Math.round(value)} duration={1.8} />
          </>
        ) : (
          <CountUp to={value} duration={1.8} />
        )}
      </p>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-8 h-24 w-24 rounded-full bg-white/5 blur-2xl"
      />
    </div>
  )
}

function RankingSection({
  title,
  rows,
  valueLabel,
}: {
  title: string
  rows: RankingRow[]
  valueLabel: string
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
          Sin datos registrados en este período.
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {rows.map((row, idx) => {
            const pct = Math.max(6, (row.units / max) * 100)
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
                    {row.units} u. · {formatUYU(row.revenue)}
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

export function AdminMetricsSection({ snapshot }: { snapshot: AnalyticsSnapshotLike }) {
  const period = snapshot.period
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
            Ventas registradas en {PERIOD_LABELS[period]}. Solo cuentan
            pedidos confirmados o posteriores.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Ingresos válidos" value={snapshot.revenue} isCurrency accent="revenue" />
        <MetricCard label="Pedidos válidos" value={snapshot.validOrders} accent="orders" />
        <MetricCard label="Unidades vendidas" value={snapshot.units} accent="units" />
        <MetricCard label="Ticket promedio" value={snapshot.averageTicket} isCurrency accent="ticket" />
        <MetricCard label="Diseños solicitados" value={snapshot.designs} accent="designs" />
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
          title="Diseños más solicitados"
          rows={snapshot.topDesigns}
          valueLabel="solicitudes"
        />

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
                  Sin diseños registrados.
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-display text-white/40 uppercase">
                Promedio de logos
              </p>
              <p className="mt-3 font-display text-3xl font-extrabold tabular-nums">
                <CountUp
                  to={snapshot.averageLogos}
                  duration={1.6}
                  from={0}
                  separator="."
                  // Decimales forzados a 1 vía formatter custom abajo si hace falta.
                />
              </p>
              <p className="text-xs text-white/45">logos por diseño</p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#101012] p-5">
        <h2 className="font-display text-lg font-bold">Estado de pedidos</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {snapshot.statuses.length ? (
            snapshot.statuses.map((status) => (
              <span
                key={status.label}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65"
              >
                {STATUS_LABELS[status.label]}: {status.count}
              </span>
            ))
          ) : (
            <span className="text-sm text-white/45">
              Sin pedidos registrados en este período.
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
