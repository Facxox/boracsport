import Link from "next/link"
import { ArrowUpRight, Box, ClipboardList, ImageIcon, Palette, Shirt, Tag, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getAnalytics, type AnalyticsPeriod } from "@/lib/supabase/queries/analytics"
import { AdminMetricsSection } from "@/components/admin/admin-metrics"

const PERIOD_BADGE: Record<AnalyticsPeriod, string> = {
  "7": "7d",
  "30": "30d",
  "90": "90d",
  all: "todo",
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams
  const analytics = await getAnalytics(params.period)
  const period = analytics.period as AnalyticsPeriod
  const supabase = await createClient()
  // Catálogo (productos/siluetas/usuarios) son métricas de stock, no de
  // ventas: siempre se muestran como totales. Pedidos sí respeta el
  // período, mostrando los cobrados del rango.
  const [{ count: products }, { count: profiles }, { count: templates }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("templates").select("id", { count: "exact", head: true }),
  ])
  const cards = [
    { label: "Productos", value: products ?? 0, href: "/admin/productos", icon: Box },
    { label: "Siluetas", value: templates ?? 0, href: "/admin/templates", icon: Shirt },
    {
      label: "Pedidos cobrados",
      value: analytics.validOrders,
      href: "/admin/pedidos",
      icon: ClipboardList,
    },
    { label: "Usuarios", value: profiles ?? 0, href: "/admin/usuarios", icon: Users },
  ]
  const periodOptions = [{ value: "7", label: "7 días" }, { value: "30", label: "30 días" }, { value: "90", label: "90 días" }, { value: "all", label: "Todo" }]

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">
            Borac Sport / Control
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">
            Panel operativo
          </h1>
        </div>
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          Volver a tienda
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-white/10 bg-[#101012] p-5 transition hover:border-[#dc2626]/60"
          >
            <Icon className="h-5 w-5 text-[#dc2626]" />
            <p className="mt-8 text-sm text-white/60">{label}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-display text-4xl font-extrabold">{value}</span>
              <ArrowUpRight className="h-5 w-5 text-white/30 transition group-hover:text-[#dc2626]" />
            </div>
          </Link>
        ))}
      </div>

      <nav aria-label="Gestión de contenido" className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/categorias" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101012] px-4 py-2 text-sm hover:border-[#dc2626]/60">
          <Tag className="h-4 w-4 text-[#dc2626]" />Categorías
        </Link>
        <Link href="/admin/hero" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101012] px-4 py-2 text-sm hover:border-[#dc2626]/60">
          <ImageIcon className="h-4 w-4 text-[#dc2626]" />Hero del sitio
        </Link>
        <Link href="/admin/templates" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101012] px-4 py-2 text-sm hover:border-[#dc2626]/60">
          <Shirt className="h-4 w-4 text-[#dc2626]" />Siluetas del diseñador
        </Link>
        <Link href="/admin/disenos-base" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101012] px-4 py-2 text-sm hover:border-[#dc2626]/60">
          <Palette className="h-4 w-4 text-[#dc2626]" />Diseños base
        </Link>
      </nav>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-[#101012] px-4 py-3">
        <p className="text-xs text-white/55 uppercase tracking-[0.2em]">
          Período
        </p>
        <nav aria-label="Período de métricas" className="flex gap-1 rounded-xl border border-white/10 bg-[#0a0a0c] p-1">
          {periodOptions.map((option) => (
            <Link
              key={option.value}
              href={`/admin?period=${option.value}`}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${period === option.value ? "bg-[#dc2626] text-black" : "text-white/55 hover:text-white"}`}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </div>

      <AdminMetricsSection snapshot={analytics} />

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#101012] p-6">
        <h2 className="font-display text-xl font-bold">Operación protegida</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
          Gestioná catálogo, siluetas y pedidos desde un espacio con control de roles. Las métricas se calculan en servidor y respetan las políticas RLS del schema boracsport.
        </p>
      </div>
    </main>
  )
}

