import Link from "next/link"
import { ArrowUpRight, Box, ClipboardList, ImageIcon, Layers3, Tag, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatStatus, getAnalytics, type AnalyticsPeriod, type RankingRow } from "@/lib/supabase/queries/analytics"
import type { OrderStatus } from "@/lib/supabase/types"

function formatUYU(value: number) {
  return `$U ${Math.round(value).toLocaleString("es-UY")}`
}

function RankingTable({ title, rows, valueLabel }: { title: string; rows: RankingRow[]; valueLabel: string }) {
  const max = rows[0]?.units || 1
  return <section className="rounded-2xl border border-white/10 bg-[#101012] p-5"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">{title}</h2><span className="text-xs text-white/40">{valueLabel}</span></div>{rows.length === 0 ? <p className="mt-6 text-sm text-white/45">Sin datos registrados en este período.</p> : <ol className="mt-5 space-y-4">{rows.map((row) => <li key={row.label}><div className="flex items-center justify-between gap-4 text-sm"><span className="truncate font-medium">{row.label}</span><span className="shrink-0 text-white/55">{row.units} u. · {formatUYU(row.revenue)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ff5a00]" style={{ width: `${Math.max(6, (row.units / max) * 100)}%` }} /></div></li>)}</ol>}</section>
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams
  const analytics = await getAnalytics(params.period)
  const period = analytics.period as AnalyticsPeriod
  const supabase = await createClient()
  const [{ count: products }, { count: orders }, { count: templates }, { count: profiles }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("templates").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ])
  const cards = [
    { label: "Productos", value: products ?? 0, href: "/admin/productos", icon: Box },
    { label: "Pedidos", value: orders ?? 0, href: "/admin/pedidos", icon: ClipboardList },
    { label: "Siluetas", value: templates ?? 0, href: "/admin/templates", icon: Layers3 },
    { label: "Usuarios", value: profiles ?? 0, href: "/admin/usuarios", icon: Users },
  ]
  const periodOptions = [{ value: "7", label: "7 días" }, { value: "30", label: "30 días" }, { value: "90", label: "90 días" }, { value: "all", label: "Todo" }]

  return <main className="mx-auto max-w-7xl px-5 py-10"><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-[#ff5a00]">Borac Sport / Control</p><h1 className="mt-2 font-display text-4xl font-extrabold">Panel operativo</h1></div><Link href="/" className="text-sm text-white/60 hover:text-white">Volver a tienda</Link></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, href, icon: Icon }) => <Link key={label} href={href} className="group rounded-2xl border border-white/10 bg-[#101012] p-5 transition hover:border-[#ff5a00]/60"><Icon className="h-5 w-5 text-[#ff5a00]" /><p className="mt-8 text-sm text-white/60">{label}</p><div className="mt-1 flex items-center justify-between"><span className="font-display text-4xl font-extrabold">{value}</span><ArrowUpRight className="h-5 w-5 text-white/30 transition group-hover:text-[#ff5a00]" /></div></Link>)}</div><nav aria-label="Gestión de contenido" className="mt-6 flex flex-wrap gap-2"><Link href="/admin/categorias" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101012] px-4 py-2 text-sm hover:border-[#ff5a00]/60"><Tag className="h-4 w-4 text-[#ff5a00]" />Categorías</Link><Link href="/admin/hero" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101012] px-4 py-2 text-sm hover:border-[#ff5a00]/60"><ImageIcon className="h-4 w-4 text-[#ff5a00]" />Hero del sitio</Link></nav><section className="mt-10"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-[#ff5a00]">Inteligencia comercial</p><h2 className="mt-2 font-display text-3xl font-extrabold">Qué está funcionando</h2><p className="mt-1 text-sm text-white/50">Ventas registradas entre {period === "all" ? "todo el historial" : `los últimos ${period} días`}. Solo cuentan pedidos confirmados o posteriores.</p></div><nav aria-label="Período de métricas" className="flex gap-1 rounded-xl border border-white/10 bg-[#101012] p-1">{periodOptions.map((option) => <Link key={option.value} href={`/admin?period=${option.value}`} className={`rounded-lg px-3 py-2 text-xs font-semibold ${period === option.value ? "bg-[#ff5a00] text-black" : "text-white/55 hover:text-white"}`}>{option.label}</Link>)}</nav></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Ingresos válidos" value={formatUYU(analytics.revenue)} /><Metric label="Pedidos válidos" value={String(analytics.validOrders)} /><Metric label="Unidades vendidas" value={String(analytics.units)} /><Metric label="Ticket promedio" value={formatUYU(analytics.averageTicket)} /><Metric label="Diseños solicitados" value={String(analytics.designs)} /></div><div className="mt-6 grid gap-4 lg:grid-cols-2"><RankingTable title="Productos más vendidos" rows={analytics.topProducts} valueLabel="unidades · ingresos" /><RankingTable title="Categorías con más salida" rows={analytics.topCategories} valueLabel="unidades · ingresos" /><RankingTable title="Diseños más solicitados" rows={analytics.topDesigns} valueLabel="solicitudes" /><section className="rounded-2xl border border-white/10 bg-[#101012] p-5"><h2 className="font-display text-lg font-bold">Preferencias del diseñador</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wider text-white/40">Colores base</p>{analytics.topColors.length ? <ul className="mt-3 space-y-2">{analytics.topColors.map((color) => <li key={color.label} className="flex justify-between text-sm"><span>{color.label}</span><span className="text-white/50">{color.count}</span></li>)}</ul> : <p className="mt-3 text-sm text-white/45">Sin diseños registrados.</p>}</div><div><p className="text-xs uppercase tracking-wider text-white/40">Promedio de logos</p><p className="mt-3 font-display text-3xl font-extrabold">{analytics.averageLogos.toFixed(1)}</p><p className="text-xs text-white/45">logos por diseño</p></div></div></section></div><div className="mt-6 rounded-2xl border border-white/10 bg-[#101012] p-5"><h2 className="font-display text-lg font-bold">Estado de pedidos</h2><div className="mt-4 flex flex-wrap gap-2">{analytics.statuses.length ? analytics.statuses.map((status) => <span key={status.label} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65">{formatStatus(status.label as OrderStatus)}: {status.count}</span>) : <span className="text-sm text-white/45">Sin pedidos registrados en este período.</span>}</div></div></section><div className="mt-8 rounded-2xl border border-white/10 bg-[#101012] p-6"><h2 className="font-display text-xl font-bold">Operación protegida</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Gestioná catálogo, siluetas y pedidos desde un espacio con control de roles. Las métricas se calculan en servidor y respetan las políticas RLS del schema boracsport.</p></div></main>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-[#101012] p-4"><p className="text-xs text-white/50">{label}</p><p className="mt-3 truncate font-display text-2xl font-extrabold">{value}</p></div>
}
