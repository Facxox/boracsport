// Constantes globales del proyecto.

export const WHATSAPP_NUMBER = "59891615615"

export const BORAC_DESIGN_STORAGE_KEY = "borac-design-v1"

// Plantilla para mensajes de cotización del diseñador.
// Usa {placeholders} que se sustituyen en runtime (ver QuoteModal).
export const WHATSAPP_QUOTE_TEMPLATE = `Hola Borac Sport! Vengo del diseñador y quiero cotizar este uniforme.

Equipo: {team}
Nombre: {name}
Molde: {mold}
Kit: {kit}
Patrón: {pattern}
Zonas: {zones}

Link del diseño: {link}
`

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
