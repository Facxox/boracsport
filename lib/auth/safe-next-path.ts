const DEFAULT_AUTH_NEXT_PATH = "/cuenta"

export function safeAuthNextPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_NEXT_PATH,
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback
  }

  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return fallback
  }

  try {
    const decoded = decodeURIComponent(value)
    if (
      decoded !== value &&
      (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\"))
    ) {
      return fallback
    }
  } catch {
    return fallback
  }

  return value
}
