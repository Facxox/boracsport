import type {
  EditableZoneKind,
  GarmentModelConfig,
  KitView,
  TemplateAssetOption,
  TemplateFontOption,
  TemplateZone,
  ThreeDTemplateConfig,
} from "./design-types"
import type { Json, TemplateRow } from "@/lib/supabase/types"

const DEFAULT_BRAND_RED = "#dc2626"

const DEFAULT_PATTERN_SLUGS = [
  "icon_sin_diseno",
  "icon_franja_central",
  "icon_franja_hzt",
  "icon_franja_vtc",
  "icon_banda_diagonal",
  "icon_banda_diagonal2",
  "icon_chevron",
  "icon_bloque_superior",
  "icon_mitad",
  "icon_mitad_diagonal",
  "icon_mitad_diagonal2",
  "icon_2_bastones",
  "icon_3_bastones",
  "icon_4_bastones",
  "icon_4_cuadros",
  "icon_hoops",
  "icon_hoops2",
  "icon_cuadros",
  "icon_pinstripes",
  "icon2_bastones_con_lineas",
  "icon2_2bastones_con_lineas",
  "icon2_3bastones_con_lineas",
  "icon2_4bastones_con_lineas",
  "icon2_franja_hzt",
  "icon2_franja_vtc",
  "icon2_franja_escudo",
  "icon2_franja_escudo2",
  "icon2_banda_diagonal",
  "icon2_banda_diagonal2",
  "icon2_chevron",
  "iconsb2_rayas_diagonales",
  "iconsb2_camuflaje",
  "iconsb2_marmol",
  "iconsb2_mosaico",
  "iconsb2_espinas",
  "iconsb2_abstracto",
  "iconsb2_glitch",
  "iconsb2_halftone_diagonal",
  "iconsb2_puas",
  "iconsb2_formas",
  "iconsb2_rayas_con_puntos",
  "iconsb2_rayas_con_grunge",
]

function defaultPatternThumbnail(slug: string): string {
  return `/disenador/images/${slug}.png`
}

export const DEFAULT_PATTERN_CATALOG: TemplateAssetOption[] = DEFAULT_PATTERN_SLUGS.map((slug) => ({
  id: slug,
  label: slug
    .replace(/^icon2?_/, "")
    .replace(/^icon_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()),
  url: defaultPatternThumbnail(slug),
  thumbnailUrl: defaultPatternThumbnail(slug),
  kind: "pattern",
  secondaryColor: slug.includes("banda") || slug.includes("chevron") || slug.includes("bastones") || slug.includes("cuadros") || slug.includes("mitad") || slug.includes("bloque") || slug.includes("franja") || slug.includes("hoops") || slug.includes("pinstripes") || slug.includes("diagonal") || slug.includes("camuflaje") || slug.includes("marmol") || slug.includes("mosaico") || slug.includes("espinas") || slug.includes("abstracto") || slug.includes("glitch") || slug.includes("halftone") || slug.includes("puas") || slug.includes("formas") || slug.includes("rayas") || slug.includes("puntos") || slug.includes("grunge"),
}))

const DEFAULT_FONTS: TemplateFontOption[] = [
  { id: "font-oswald", label: "Oswald", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4QK1C4E.ttf" },
  { id: "font-bebas", label: "Bebas", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC0C4E.ttf" },
  { id: "font-roboto", label: "Roboto", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf" },
  { id: "font-anton", label: "Anton", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4W61C4E.ttf" },
  { id: "font-roboto-condensed", label: "Roboto Condensed", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4ZmyC4E.ttf" },
  { id: "font-archivo", label: "Archivo", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bC1C4E.ttf" },
  { id: "font-archivo-black", label: "Archivo Black", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf" },
  { id: "font-lato", label: "Lato", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyC4E.ttf" },
  { id: "font-lato-black", label: "Lato Black", fontUrl: "/disenador/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4e6yC4E.ttf" },
]

export const DEFAULT_KIT_OPTIONS: Array<{ id: KitView; label: string }> = [
  { id: "shirt", label: "Camiseta" },
  { id: "shirtShort", label: "Camiseta + Short" },
  { id: "full", label: "Kit Completo" },
]

type NormalizeOptions = {
  isPreview?: boolean
}

type LegacyDefaults = Record<string, { id: string; label: string; position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; defaultColor?: string; materialNames?: string[] }>

const DEFAULT_ZONES: LegacyDefaults = {
  dorsal: {
    id: "zone-dorsal",
    label: "Dorsal",
    position: [0, 0.95, 0.18],
    rotation: [0, Math.PI, 0],
    scale: [0.9, 0.9, 0.9],
  },
  name: {
    id: "zone-name",
    label: "Nombre",
    position: [0, 0.55, 0.18],
    rotation: [0, Math.PI, 0],
    scale: [0.7, 0.7, 0.7],
  },
  shield: {
    id: "zone-shield",
    label: "Escudo",
    position: [0, 0.55, 0.18],
    rotation: [0, 0, 0],
    scale: [0.32, 0.32, 0.32],
  },
  sponsorFront: {
    id: "zone-sponsor-front",
    label: "Sponsor delantero",
    position: [0, 0.4, 0.18],
    rotation: [0, 0, 0],
    scale: [0.5, 0.18, 0.18],
  },
  sponsorBack: {
    id: "zone-sponsor-back",
    label: "Sponsor trasero",
    position: [0, 1.2, 0.18],
    rotation: [0, Math.PI, 0],
    scale: [0.5, 0.18, 0.18],
  },
  shirtColor: { id: "color-shirt", label: "Color camiseta", defaultColor: "#111111", position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  shortColor: { id: "color-short", label: "Color short", defaultColor: "#111111", position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  sockColor: { id: "color-sock", label: "Color medias", defaultColor: "#111111", position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  pattern: {
    id: "zone-pattern-shirt",
    label: "Diseño de camiseta",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
}

function makeZone(kind: EditableZoneKind, view: TemplateZone["view"], defaults: LegacyDefaults[string], extras: Partial<TemplateZone> = {}): TemplateZone {
  return {
    id: defaults.id,
    label: defaults.label,
    kind,
    view,
    position: defaults.position,
    rotation: defaults.rotation,
    scale: defaults.scale,
    lockedPosition: true,
    lockedRotation: true,
    lockedScale: true,
    ...extras,
  }
}

function hasZone(zones: TemplateZone[], id: string): boolean {
  return zones.some((zone) => zone.id === id)
}

function asArray<T>(value: unknown): T[] | undefined {
  return Array.isArray(value) ? (value as T[]) : undefined
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>
  return undefined
}

function isFiniteTuple3(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every((entry) => typeof entry === "number" && Number.isFinite(entry))
}

function safeUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  try {
    const candidate = raw.trim()
    if (!candidate) return null
    const url = candidate.startsWith("/") || candidate.startsWith("blob:") || candidate.startsWith("data:") ? null : new URL(candidate)
    if (url && (url.protocol !== "http:" && url.protocol !== "https:")) return null
    return candidate
  } catch {
    return null
  }
}

function parseModelConfig(raw: unknown): GarmentModelConfig | null {
  if (!raw) return null
  const record = asRecord(raw)
  if (!record) return null
  const url = safeUrl(record.url)
  const format = record.format
  if (!url || (format !== "glb" && format !== "gltf")) return null
  const config: GarmentModelConfig = { url, format }
  if (isFiniteTuple3(record.position)) config.position = record.position
  if (isFiniteTuple3(record.rotation)) config.rotation = record.rotation
  if (isFiniteTuple3(record.scale)) config.scale = record.scale
  return config
}

export function normalizeTemplateConfig(template: TemplateRow, options: NormalizeOptions = {}): ThreeDTemplateConfig | null {
  if (!template.model_url || !template.model_format) return null

  const sceneRecord = asRecord(template.scene_config) ?? {}
  const defaultsRecord = asRecord(template.default_config) ?? {}
  const rawZones = asArray<TemplateZone>(template.editable_zones) ?? []
  const zones: TemplateZone[] = rawZones.filter((zone) => zone && typeof zone === "object" && typeof zone.id === "string" && typeof zone.kind === "string")

  const ensureZone = (zone: TemplateZone) => {
    if (!hasZone(zones, zone.id)) zones.push(zone)
  }

  ensureZone(makeZone("number", "back", DEFAULT_ZONES.dorsal, { maxChars: 2, defaultValue: "10", required: true }))
  ensureZone(makeZone("text", "back", DEFAULT_ZONES.name, { maxChars: 20, defaultValue: "" }))
  ensureZone(
    makeZone("logo", "front", DEFAULT_ZONES.shield, {
      assetRole: "shield",
      minWidth: 0.18,
      minHeight: 0.18,
    }),
  )
  ensureZone(
    makeZone("sponsor", "front", DEFAULT_ZONES.sponsorFront, {
      assetRole: "sponsor",
      minWidth: 0.4,
      minHeight: 0.1,
    }),
  )
  ensureZone(
    makeZone("sponsor", "back", DEFAULT_ZONES.sponsorBack, {
      assetRole: "backSponsor",
      minWidth: 0.4,
      minHeight: 0.1,
    }),
  )
  ensureZone(
    makeZone("color", "front", {
      id: DEFAULT_ZONES.shirtColor.id,
      label: DEFAULT_ZONES.shirtColor.label,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      defaultColor: DEFAULT_ZONES.shirtColor.defaultColor,
    }, { allowedColors: ["#111111", "#dc2626", "#1d4ed8", "#16a34a", "#facc15", "#f97316", "#ffffff", "#000000"] }),
  )
  ensureZone(
    makeZone("color", "front", {
      id: DEFAULT_ZONES.shortColor.id,
      label: DEFAULT_ZONES.shortColor.label,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      defaultColor: DEFAULT_ZONES.shortColor.defaultColor,
    }, { allowedColors: ["#111111", "#dc2626", "#1d4ed8", "#16a34a", "#facc15", "#f97316", "#ffffff", "#000000"] }),
  )
  ensureZone(
    makeZone("color", "front", {
      id: DEFAULT_ZONES.sockColor.id,
      label: DEFAULT_ZONES.sockColor.label,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      defaultColor: DEFAULT_ZONES.sockColor.defaultColor,
    }, { allowedColors: ["#111111", "#dc2626", "#1d4ed8", "#16a34a", "#facc15", "#f97316", "#ffffff", "#000000"] }),
  )
  ensureZone(
    makeZone("pattern", "front", DEFAULT_ZONES.pattern, {
      materialNames: extractMaterialNames(rawZones),
    }),
  )

  const patterns = asArray<TemplateAssetOption>(defaultsRecord.patterns) ?? DEFAULT_PATTERN_CATALOG
  const fonts = asArray<TemplateFontOption>(defaultsRecord.fonts) ?? DEFAULT_FONTS
  const kits = asArray<{ id: KitView; label: string }>(defaultsRecord.kits) ?? DEFAULT_KIT_OPTIONS

  const modelsRecord = asRecord(defaultsRecord.models) ?? {}
  const models: Partial<Record<KitView, GarmentModelConfig>> = {}
  const shirt = parseModelConfig(modelsRecord.shirt) ?? parseModelConfig({ url: template.model_url, format: template.model_format })
  if (shirt) models.shirt = shirt
  const shorts = parseModelConfig(modelsRecord.shirtShort)
  if (shorts) models.shirtShort = shorts
  const full = parseModelConfig(modelsRecord.full)
  if (full) models.full = full

  const config: ThreeDTemplateConfig = {
    modelUrl: template.model_url,
    modelFormat: template.model_format,
    scene: sceneRecord as ThreeDTemplateConfig["scene"],
    zones,
    patterns,
    fonts,
    kits,
    models,
  }

  if (!options.isPreview) {
    return config
  }

  return config
}

function extractMaterialNames(zones: TemplateZone[]): string[] | undefined {
  const fromPattern = zones.find((zone) => zone.kind === "pattern")?.materialNames
  if (fromPattern && fromPattern.length > 0) return fromPattern
  const fromColor = zones.find((zone) => zone.kind === "color")?.materialNames
  if (fromColor && fromColor.length > 0) return fromColor
  return undefined
}

export function defaultPatternColorFor(slug: string | undefined): string {
  if (!slug) return DEFAULT_BRAND_RED
  if (slug.includes("camuflaje")) return "#3f3f46"
  if (slug.includes("marmol")) return "#1f2937"
  if (slug.includes("mosaico")) return "#0f172a"
  if (slug.includes("espinas")) return "#0f172a"
  if (slug.includes("abstracto")) return "#0f172a"
  if (slug.includes("glitch")) return "#0f172a"
  if (slug.includes("halftone")) return "#1f2937"
  if (slug.includes("puas")) return "#1f2937"
  if (slug.includes("formas")) return "#0f172a"
  if (slug.includes("rayas")) return "#1e3a8a"
  if (slug.includes("puntos")) return "#1e3a8a"
  if (slug.includes("grunge")) return "#1f2937"
  if (slug.includes("cuadros")) return "#1e3a8a"
  if (slug.includes("bastones")) return "#1e3a8a"
  if (slug.includes("chevron")) return "#7c2d12"
  if (slug.includes("banda")) return "#7c2d12"
  if (slug.includes("mitad")) return "#7c2d12"
  if (slug.includes("bloque")) return "#7c2d12"
  if (slug.includes("franja")) return "#7c2d12"
  if (slug.includes("hoops")) return "#7c2d12"
  if (slug.includes("pinstripes")) return "#1e3a8a"
  return DEFAULT_BRAND_RED
}

export function normalizePayloadFromJson(value: Json | null | undefined): Json | null {
  if (value == null) return null
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Json
    } catch {
      return null
    }
  }
  return value
}
