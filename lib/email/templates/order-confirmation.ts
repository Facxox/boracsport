// HTML template (string) para el email de confirmación de pedido.
// Plain HTML — sin React Email — para evitar dependencia extra en Sprint 1.

import type { Json } from "@/lib/supabase/types"

type Item = {
  kind: "product" | "design"
  name?: string
  price?: number
  qty?: number
  size?: string | null
  color?: string | null
  variantId?: string | null
  previewLabel?: string
}

interface TemplateInput {
  orderId: string
  customer: { name: string; email: string; phone: string; address: string }
  items: Json
  subtotal: number
  shipping: number
  total: number
  paymentMethod: "transfer" | "mercadopago"
  recipient: "customer" | "admin"
}

function formatUYU(n: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(n)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function paymentLabel(method: "transfer" | "mercadopago"): string {
  return method === "transfer" ? "Transferencia BROU" : "MercadoPago"
}

function paymentInstructions(method: "transfer" | "mercadopago"): string {
  if (method === "transfer") {
    return `
      <p><strong>Datos para la transferencia (BROU):</strong></p>
      <ul>
        <li>Titular: SPORT GREAT S.A.S</li>
        <li>Cuenta corriente: CA 110403928-00001</li>
        <li>Caja de ahorro: CA 600-5780688</li>
        <li>También podés pagar vía Abitab o Redpagos indicando tu número de pedido.</li>
      </ul>
      <p>Una vez hecho el pago, subí el comprobante respondiendo este mail o desde la sección de tu cuenta.</p>
    `
  }
  return `<p>Tu pago con MercadoPago ya fue iniciado. Si todavía no lo completaste, abrí el link que te llegó al mail de MercadoPago.</p>`
}

export function orderConfirmationHtml(input: TemplateInput): string {
  const items = (Array.isArray(input.items) ? input.items : []) as unknown as Item[]
  const greeting = input.recipient === "customer"
    ? `¡Gracias por tu pedido, ${escapeHtml(input.customer.name)}!`
    : `Nuevo pedido de ${escapeHtml(input.customer.name)}`

  const intro = input.recipient === "customer"
    ? "Recibimos tu pedido. Te avisamos cuando lo confirmemos."
    : "Hay un nuevo pedido esperando confirmación."

  const itemsRows = items
    .map((it) => {
      if (it.kind === "design") {
        return `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(it.previewLabel ?? "Diseño personalizado")}</td>
          <td style="padding:8px 0;text-align:center;">1</td>
          <td style="padding:8px 0;text-align:right;">a coordinar</td>
        </tr>`
      }
      const variantLabel = [it.size, it.color].filter(Boolean).join(" · ")
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">
          ${escapeHtml(it.name ?? "Producto")}
          ${variantLabel ? `<br><small style="color:#666">${escapeHtml(variantLabel)}</small>` : ""}
        </td>
        <td style="padding:8px 0;text-align:center;">${it.qty ?? 1}</td>
        <td style="padding:8px 0;text-align:right;">${formatUYU(Number(it.price ?? 0) * Number(it.qty ?? 1))}</td>
      </tr>`
    })
    .join("")

  return `
<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f1f1f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <tr>
        <td style="padding:24px;background:#0d0d0d;color:#ffffff;">
          <strong style="letter-spacing:0.2em;text-transform:uppercase;font-size:12px;">Borac Sport</strong>
          <h1 style="margin:8px 0 0;font-size:22px;">${greeting}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p>${intro}</p>
          <p style="color:#666;font-size:13px;">Pedido <strong>#${escapeHtml(input.orderId.slice(0, 8))}</strong> — Pago: <strong>${escapeHtml(paymentLabel(input.paymentMethod))}</strong></p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="border-bottom:1px solid #ddd;">
                <th align="left" style="padding:6px 0;">Producto</th>
                <th align="center" style="padding:6px 0;">Cant.</th>
                <th align="right" style="padding:6px 0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsRows || `<tr><td colspan="3" style="padding:8px 0;color:#999;">(sin items)</td></tr>`}</tbody>
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
            <tr><td>Subtotal</td><td align="right">${formatUYU(input.subtotal)}</td></tr>
            <tr><td>Envío</td><td align="right">${formatUYU(input.shipping)}</td></tr>
            <tr style="font-weight:bold;font-size:16px;"><td style="padding-top:8px;">Total</td><td align="right" style="padding-top:8px;">${formatUYU(input.total)}</td></tr>
          </table>

          <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:8px;font-size:14px;">
            ${paymentInstructions(input.paymentMethod)}
          </div>

          <div style="margin-top:24px;font-size:13px;color:#666;">
            <p style="margin:0;"><strong>Datos de contacto</strong></p>
            <p style="margin:4px 0;">${escapeHtml(input.customer.name)} · ${escapeHtml(input.customer.email)} · ${escapeHtml(input.customer.phone)}</p>
            <p style="margin:0;">${escapeHtml(input.customer.address || "Sin dirección")}</p>
          </div>

          <p style="margin-top:32px;font-size:12px;color:#999;">
            Si tenés dudas, respondé este mail o escribinos por WhatsApp.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim()
}