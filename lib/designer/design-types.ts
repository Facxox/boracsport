export type DesignerView = "front" | "back"
export type EditableZoneKind = "text" | "logo" | "number" | "sponsor" | "color"

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
}

export type ThreeDTemplateConfig = {
  modelUrl: string
  modelFormat: "glb" | "gltf"
  scene?: { cameraPosition?: [number, number, number]; background?: string }
  zones: TemplateZone[]
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
}

export type ExpressDesignPayload = ThreeDDesignPayload

export type QuoteSize = "adulto" | "nino"
export type ConfiguratorQuote = { name: string; team: string; sizes: QuoteSize[] }
export type ConfiguratorAutosave = ExpressDesignPayload & { quote?: ConfiguratorQuote }
export type BoracDesignCompletedMessage = { type: "BORAC_DESIGN_COMPLETED"; payload: ConfiguratorAutosave }
