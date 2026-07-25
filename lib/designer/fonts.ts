// Catálogo de tipografías disponibles para textos dorsales, sponsor y números.
// Las familias se cargan vía `next/font/google` en el cliente (font-display: swap).
// Mantener esta lista sincronizada con la carga real en `app/layout.tsx` /
// `designer-client.tsx`.

export interface FontDescriptor {
  id: string
  label: string
  family: string
  weight?: number
  italic?: boolean
}

export const DESIGNER_FONTS: FontDescriptor[] = [
  { id: "inter", label: "Inter", family: "Inter, sans-serif" },
  { id: "syne", label: "Syne", family: "Syne, sans-serif" },
  { id: "bebas", label: "Bebas Neue", family: "Bebas Neue, sans-serif" },
  { id: "oswald", label: "Oswald", family: "Oswald, sans-serif" },
  { id: "anton", label: "Anton", family: "Anton, sans-serif" },
  { id: "archivo", label: "Archivo Black", family: "Archivo Black, sans-serif" },
  { id: "roboto_mono", label: "Roboto Mono", family: "Roboto Mono, monospace" },
]

export function getFont(id: string): FontDescriptor {
  return DESIGNER_FONTS.find((f) => f.id === id) ?? DESIGNER_FONTS[0]
}
