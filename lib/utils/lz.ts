// Wrapper tipado de lz-string para comprimir el snapshot del diseñador
// en la URL. lz-string YA trae sus propios tipos (la versión
// @types/lz-string es un stub deprecated) — usamos los tipos oficiales.

import LZString from "lz-string"

export function compressToEncodedURIComponent(input: string): string {
  try {
    return LZString.compressToEncodedURIComponent(input)
  } catch {
    return ""
  }
}

export function decompressFromEncodedURIComponent(input: string): string | null {
  try {
    const out = LZString.decompressFromEncodedURIComponent(input)
    if (!out) return null
    return out
  } catch {
    return null
  }
}
