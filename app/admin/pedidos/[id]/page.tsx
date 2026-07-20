import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { OrderRow } from "@/lib/supabase/types"
import { safeImageUrl } from "@/lib/safe-image"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

interface ShippingDetails {
  name?: string
  email?: string
  phone?: string
  address?: string
  source?: string
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle()
  const order = data as OrderRow | null
  if (!order) notFound()

  const shipping = (order.shipping_details ?? {}) as ShippingDetails

  let receiptUrl: string | null = null
  if (order.payment_receipt_url) {
    const service = createServiceClient()
    if (service) {
      const { data: signed } = await service.storage
        .from("boracsport_orders")
        .createSignedUrl(order.payment_receipt_url, 60 * 60)
      receiptUrl = signed?.signedUrl ?? null
    }
  }

  const items = Array.isArray(order.items) ? order.items : []

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin/pedidos" className="text-sm text-white/60">← Pedidos</Link>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Pedido</p>
          <h1 className="mt-2 font-mono text-2xl font-extrabold tracking-tight">{order.id}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {new Date(order.created_at).toLocaleString("es-UY")}
          </p>
        </div>
        <Link
          href={`https://wa.me/${shipping.phone ?? ""}?text=${encodeURIComponent(`Pedido #${order.id.slice(0, 8)} — ${order.status}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20"
        >
          Contactar cliente <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
            <h2 className="font-display text-lg font-extrabold">Comprobante de transferencia</h2>
            {receiptUrl && safeImageUrl(receiptUrl) ? (
              <div className="mt-4 space-y-3">
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative max-h-[640px] w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    <Image
                      src={safeImageUrl(receiptUrl) as string}
                      alt="Comprobante de transferencia"
                      width={1280}
                      height={640}
                      sizes="(min-width: 768px) 720px, 100vw"
                      className="h-auto max-h-[640px] w-full object-contain"
                    />
                  </div>
                </a>
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#dc2626] hover:underline"
                >
                  Abrir en nueva pestaña <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-muted-foreground text-[11px]">
                  URL firmada válida por 1 hora. Path:{" "}
                  <code className="font-mono">{order.payment_receipt_url}</code>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm">
                El cliente todavía no subió el comprobante.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
            <h2 className="font-display text-lg font-extrabold">Items</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.length === 0 ? (
                <li className="text-muted-foreground">Sin items registrados.</li>
              ) : (
                items.map((it, idx) => {
                  const item = it as { kind?: string; name?: string; qty?: number; price?: number; previewLabel?: string }
                  return (
                    <li key={idx} className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 last:border-0">
                      <span className="text-muted-foreground truncate">
                        {item.kind === "design"
                          ? `Diseño · ${item.previewLabel ?? "personalizado"}`
                          : `${item.qty ?? 1}× ${item.name ?? "Producto"}`}
                      </span>
                      <span className="shrink-0 font-medium">
                        {item.price != null ? `$U ${Number(item.price).toLocaleString("es-UY")}` : "—"}
                      </span>
                    </li>
                  )
                })
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
            <h2 className="font-display text-base font-bold">Resumen</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>$U {Number(order.subtotal).toLocaleString("es-UY")}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Total</dt><dd className="font-semibold">$U {Number(order.total).toLocaleString("es-UY")}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Estado</dt><dd>{order.status}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Pago</dt><dd>{order.payment_status}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Método</dt><dd>{order.payment_method}</dd></div>
            </dl>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
            <h2 className="font-display text-base font-bold">Cliente</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div><dt className="text-muted-foreground text-xs">Nombre</dt><dd>{shipping.name ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Email</dt><dd>{shipping.email ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Teléfono</dt><dd>{shipping.phone ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Dirección</dt><dd>{shipping.address ?? "—"}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  )
}