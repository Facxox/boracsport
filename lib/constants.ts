// Constantes globales del proyecto.

export const WHATSAPP_NUMBER = "59891615615"

export const MAX_DESIGN_BYTES = 200_000 // 200 KB cap para el payload del editor.

export const DESIGN_AUTOSAVE_VERSION = 1

export const FLAT_SHIPPING_UYU = 250 // TODO: configurable

export const SITE_NAME = "Borac Sport"
export const SITE_TAGLINE = "Indumentaria deportiva, uniformes corporativos, DTF y merchandising personalizado en Uruguay."

export const CATEGORIES = [
  "deportivo",
  "corporativo",
  "dtf",
  "merchandising",
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  deportivo: "Indumentaria Deportiva",
  corporativo: "Ropa de Trabajo & Corporativa",
  dtf: "DTF por Metro",
  merchandising: "Merchandising Personalizado",
}
