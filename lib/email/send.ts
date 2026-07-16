// Wrapper server-side para enviar emails via Resend (API REST directa).
// Si RESEND_API_KEY no está configurada, loguea y no rompe el flujo.

import type { Json } from "@/lib/supabase/types"
import { orderConfirmationHtml } from "./templates/order-confirmation"

const RESEND_API = "https://api.resend.com/emails"

interface SendOrderConfirmationInput {
  orderId: string
  customer: { name: string; email: string; phone: string; address: string }
  items: Json
  subtotal: number
  shipping: number
  total: number
  paymentMethod: "transfer" | "mercadopago"
}

interface ResendPayload {
  from: string
  to: string[]
  subject: string
  html: string
  reply_to?: string
}

async function postResend(payload: ResendPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Resend ${res.status}: ${text.slice(0, 200)}`)
  }
}

export async function sendOrderConfirmation(input: SendOrderConfirmationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? "Borac Sport <no-reply@boracsport.com.uy>"
  const adminEmail = process.env.RESEND_ADMIN_EMAIL ?? "ventas@boracsport.com.uy"

  const subjectCustomer = `Recibimos tu pedido #${input.orderId.slice(0, 8)}`
  const subjectAdmin = `Nuevo pedido #${input.orderId.slice(0, 8)} — ${input.customer.name}`

  const htmlCustomer = orderConfirmationHtml({ ...input, recipient: "customer" })
  const htmlAdmin = orderConfirmationHtml({ ...input, recipient: "admin" })

  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY no configurada — pedido ${input.orderId} NO se envió por mail.`,
    )
    return
  }

  // Al cliente.
  await postResend({
    from,
    to: [input.customer.email],
    subject: subjectCustomer,
    html: htmlCustomer,
    reply_to: adminEmail,
  })

  // Al admin (best-effort, no rompe si falla).
  try {
    await postResend({
      from,
      to: [adminEmail],
      subject: subjectAdmin,
      html: htmlAdmin,
    })
  } catch (err) {
    console.warn(`[email] admin copy falló para pedido ${input.orderId}:`, err)
  }
}