import Link from "next/link"
import { redirect } from "next/navigation"
import { Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ButtonLink } from "@/components/ui/button"
import { formatDateUY, formatUYU } from "@/lib/format"
import type { OrderRow } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<OrderRow["status"], string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_produccion: "En producción",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

const STATUS_COLOR: Record<OrderRow["status"], string> = {
  pendiente: "bg-amber-500/10 text-amber-300 border-amber-400/30",
  confirmado: "bg-blue-500/10 text-blue-300 border-blue-400/30",
  en_produccion: "bg-purple-500/10 text-purple-300 border-purple-400/30",
  enviado: "bg-cyan-500/10 text-cyan-300 border-cyan-400/30",
  entregado: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
  cancelado: "bg-red-500/10 text-red-300 border-red-400/30",
}

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect("/login?next=/cuenta/pedidos")

  const { data, error } = await supabase
    .from("orders")
    .select("id, total, subtotal, status, payment_method, payment_status, items, created_at")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  const orders = (data ?? []) as unknown as Array<
    Pick<OrderRow, "id" | "total" | "subtotal" | "status" | "payment_method" | "payment_status" | "items" | "created_at">
  >

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/cuenta" className="text-muted-foreground hover:text-foreground">
          ← Mi cuenta
        </Link>
      </div>
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Mis pedidos</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Historial de pedidos realizados con tu cuenta.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error.message}
        </p>
      )}

      {!error && orders.length === 0 && (
        <div className="mt-10 text-center">
          <Package className="text-muted-foreground mx-auto h-12 w-12" />
          <p className="mt-4 text-lg font-semibold">Todavía no tenés pedidos</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Cuando hagas un pedido va a aparecer acá.
          </p>
          <ButtonLink href="/productos" className="mt-6">
            Ver catálogo
          </ButtonLink>
        </div>
      )}

      {orders.length > 0 && (
        <ul className="mt-8 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/cuenta/pedidos/${o.id}`}
                className="bg-card flex flex-col gap-3 rounded-xl border border-white/5 p-4 transition-colors hover:border-white/15 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-white/60">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatDateUY(o.created_at)} · {formatUYU(Number(o.total))}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {o.payment_method === "transfer"
                      ? "Transferencia"
                      : o.payment_method === "mercadopago"
                        ? "MercadoPago"
                        : "Coordinación por WhatsApp"}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[o.status]}`}
                >
                  {STATUS_LABEL[o.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}