// Helper para validar URLs de imagen antes de pasarlas a next/image.
// Acepta http/https, rechaza javascript:, data:, vbscript:, etc.

export function safeImageUrl(u: unknown): string | null {
  if (typeof u !== "string" || u.length === 0 || u.length > 2048) return null
  try {
    const url = new URL(u, "https://placeholder.local")
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return u
  } catch {
    return null
  }
}
