import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { OrderRow } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select("id, user_id, total, status, payment_status, payment_receipt_url, created_at")
    .order("created_at", { ascending: false })
    .limit(100)
  const orders = (data ?? []) as Pick<
    OrderRow,
    "id" | "user_id" | "total" | "status" | "payment_status" | "payment_receipt_url" | "created_at"
  >[]

  // Generamos URLs firmadas (1h) para los comprobantes en paralelo.
  // service_role bypasea RLS y la storage policy nueva permite al service
  // leer boracport_orders.
  const service = createServiceClient()
  const receiptUrls = new Map<string, string>()
  if (service) {
    await Promise.all(
      orders
        .filter((o) => Boolean(o.payment_receipt_url))
        .map(async (o) => {
          const { data: signed } = await service.storage
            .from("boracsport_orders")
            .createSignedUrl(o.payment_receipt_url as string, 60 * 60)
          if (signed?.signedUrl) receiptUrls.set(o.id, signed.signedUrl)
        }),
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <Link href="/admin" className="text-sm text-white/60">← Panel</Link>
      <h1 className="mt-4 font-sans text-4xl font-extrabold tracking-tight">Pedidos</h1>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="p-4">Referencia</th>
              <th className="p-4">Total</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Pago</th>
              <th className="p-4">Comprobante</th>
              <th className="p-4">Fecha</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-white/50">
                  Todavía no hay pedidos.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-white/10">
                  <td className="p-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
                  <td className="p-4">$U {Number(order.total).toLocaleString("es-UY")}</td>
                  <td className="p-4">{order.status}</td>
                  <td className="p-4">{order.payment_status}</td>
                  <td className="p-4">
                    {order.payment_receipt_url ? (
                      receiptUrls.has(order.id) ? (
                        <a
                          href={receiptUrls.get(order.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400 hover:bg-emerald-500/25"
                        >
                          📎 Ver comprobante
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">
                          📎 Con comprobante
                        </span>
                      )
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>
                  <td className="p-4 text-white/60">
                    {new Date(order.created_at).toLocaleDateString("es-UY")}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}