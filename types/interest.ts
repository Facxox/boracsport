// Slugs de intereses. Mantener en sync con Category.

import type { Category } from "@/lib/constants"

export type InterestSlug = Category

export const INTEREST_CARDS: {
  slug: InterestSlug
  emoji: string
  title: string
  description: string
}[] = [
  {
    slug: "deportivo",
    emoji: "⚽",
    title: "Indumentaria Deportiva",
    description: "Equipos y competición. Camisetas, shorts y medias sublimadas.",
  },
  {
    slug: "corporativo",
    emoji: "💼",
    title: "Ropa de Trabajo & Corporativa",
    description: "Uniformes premium para empresas. Chombas, polos y remeras corporativas.",
  },
  {
    slug: "dtf",
    emoji: "🖨️",
    title: "DTF por Metro",
    description: "Impresión textil directa para talleres y marcas. Calidad profesional.",
  },
  {
    slug: "merchandising",
    emoji: "🎁",
    title: "Merchandising Personalizado",
    description: "Artículos de marca a demanda. Tazas, pelotas, bolsos y más.",
  },
]
