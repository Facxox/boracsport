export type DesignerView = "front" | "back"
export type EditableZoneKind = "text" | "logo" | "number" | "sponsor" | "color" | "pattern"
export type DesignerPanel = "base" | "design" | "logos" | "dorsal"
export type KitView = "shirt" | "shirtShort" | "full"

export type ModelTransform = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}

export type GarmentModelConfig = ModelTransform & {
  url: string
  format: "glb" | "gltf"
}

export type TemplateAssetOption = {
  id: string
  label: string
  url: string
  thumbnailUrl?: string
  kind?: "pattern" | "mold" | "logo"
  secondaryColor?: boolean
}

export type TemplateFontOption = {
  id: string
  label: string
  fontUrl?: string
}

export type TemplateZone = {
  id: string
  label: string
  kind: EditableZoneKind
  view: DesignerView
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  lockedPosition: true
  lockedRotation: true
  lockedScale: true
  maxChars?: number
  allowedColors?: string[]
  required?: boolean
  defaultValue?: string
  materialNames?: string[]
  assetRole?: "shield" | "sponsor" | "backSponsor" | "pattern"
  minWidth?: number
  minHeight?: number
}

export type ThreeDTemplateConfig = {
  modelUrl: string
  modelFormat: "glb" | "gltf"
  scene?: {
    cameraPosition?: [number, number, number]
    cameraTarget?: [number, number, number]
    cameraDistance?: number
    background?: string
  }
  zones: TemplateZone[]
  patterns?: TemplateAssetOption[]
  fonts?: TemplateFontOption[]
  models?: Partial<Record<KitView, GarmentModelConfig>>
  kits?: Array<{ id: KitView; label: string }>
}

export type LogoTransform = {
  id: string
  assetUrl: string
  left: number
  top: number
  scaleX: number
  scaleY: number
  angle: number
  view: DesignerView
}

export type ThreeDLayerValue = {
  zoneId: string
  value: string
  color?: string
  assetUrl?: string
  secondaryColor?: string
  fontId?: string
  enabled?: boolean
  strokeColor?: string
  strokeEnabled?: boolean
}

export type ThreeDDesignPayload = {
  version: 2
  savedAt: number
  templateId: string
  templateVersion: number
  templateName: string
  baseColor: string
  previewUrl: string
  layers: ThreeDLayerValue[]
  logos: LogoTransform[]
  quote?: ConfiguratorQuote
  selectedPatternId?: string
  selectedKit?: KitView
}

export type ExpressDesignPayload = ThreeDDesignPayload

export type QuoteSize = "adulto" | "nino"
export type ConfiguratorQuote = { name: string; team: string; sizes: QuoteSize[] }
export type ConfiguratorAutosave = ExpressDesignPayload & { quote?: ConfiguratorQuote }
export type BoracDesignCompletedMessage = { type: "BORAC_DESIGN_COMPLETED"; payload: ConfiguratorAutosave }
