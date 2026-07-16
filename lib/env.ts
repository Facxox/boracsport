// Resolución centralizada de la URL base del sitio.
// Orden de precedencia:
//   1. NEXT_PUBLIC_APP_URL — URL canónica explícita (recomendado en Vercel).
//   2. NEXT_PUBLIC_SITE_URL — legacy, alias de la anterior.
//   3. NEXT_PUBLIC_VERCEL_URL — Vercel inyecta esta var automáticamente.
//   4. http://localhost:3000 — fallback para dev local.
//
// Garantiza SIEMPRE un string con protocolo http(s) parseable por `new URL`.

export function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) {
    const withProto = explicit.startsWith("http://") || explicit.startsWith("https://")
      ? explicit
      : `https://${explicit}`
    return withProto.replace(/\/+$/, "")
  }
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.startsWith("http://") || vercel.startsWith("https://")
      ? vercel
      : `https://${vercel}`
    return host.replace(/\/+$/, "")
  }
  return "http://localhost:3000"
}