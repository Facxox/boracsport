// Pantalla de confirmación tras pagar (volviendo de Mercado Pago, o
// pendientes/fallos). Server Component: lee `searchParams`, resuelve el
// pedido (público si el visitante es anónimo, propio si está logueado) y
// pasa el resultado al componente cliente para la parte interactiva.

import type { Metadata } from "next"
import { ConfirmacionContent } from "./confirmacion-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Estado de tu pago",
  robots: { index: false, follow: false },
}

type RawSearchParams = {
  status?: string
  order?: string
  email?: string
  phone?: string
}

type PublicOrderResponse = {
  id: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  total: number
  createdAt: string
}

function normalizeStatus(value: string | undefined): "success" | "pending" | "failure" | "unknown" {
  if (value === "success" || value === "approved") return "success"
  if (value === "pending" || value === "in_process" || value === "in_mediation") return "pending"
  if (value === "failure" || value === "rejected" || value === "cancelled") return "failure"
  return "unknown"
}

async function loadOrder(
  orderId: string,
  email: string | undefined,
  phone: string | undefined,
): Promise<PublicOrderResponse | null> {
  try {
    const url = new URL(`/api/orders/${orderId}/public`, "http://localhost")
    if (email) url.searchParams.set("email", email)
    if (phone) url.searchParams.set("phone", phone)
    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) return null
    const data = (await res.json()) as PublicOrderResponse
    return data
  } catch {
    return null
  }
}

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const params = await searchParams
  const status = normalizeStatus(params.status)
  const orderId = typeof params.order === "string" ? params.order : ""
  const order = orderId ? await loadOrder(orderId, params.email, params.phone) : null

  return (
    <ConfirmacionContent
      status={status}
      order={order}
      orderIdParam={orderId}
      rawStatus={params.status ?? ""}
    />
  )
}
