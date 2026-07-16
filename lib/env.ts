// Resolución centralizada de la URL base del sitio.
// Orden de precedencia:
//   1. NEXT_PUBLIC_APP_URL — URL canónica explícita (recomendado en Vercel).
//   2. NEXT_PUBLIC_SITE_URL — legacy, alias de la anterior.
//   3. NEXT_PUBLIC_VERCEL_URL — Vercel inyecta esta var automáticamente.
//   4. http://localhost:3000 — fallback para dev local.

export function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, "")
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`
  return "http://localhost:3000"
}