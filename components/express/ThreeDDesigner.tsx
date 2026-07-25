"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Check, Download, Loader2, RotateCcw, Save, ShoppingBag, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ThreeDViewport, type ViewportHandle } from "@/components/express/ThreeDViewport"
import { useCartStore } from "@/stores/cart-store"
import { defaultPatternColorFor } from "@/lib/designer/normalize-config"
import type {
  ConfiguratorQuote,
  DesignerPanel,
  KitView,
  TemplateZone,
  ThreeDDesignPayload,
  ThreeDLayerValue,
  ThreeDTemplateConfig,
} from "@/lib/designer/design-types"
import type { TemplateRow } from "@/lib/supabase/types"

const MAX_TEXT = 80
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const AUTOSAVE_KEY = "borac-3d-configurator-v3"
const IMAGE_EXT = /\.(png|jpe?g|webp|svg)$/i

function initialLayers(config: ThreeDTemplateConfig): ThreeDLayerValue[] {
  return config.zones.map((zone) => {
    const base: ThreeDLayerValue = { zoneId: zone.id, value: zone.defaultValue ?? "", enabled: true }
    if (zone.kind === "color") {
      base.color = zone.allowedColors?.[0] ?? zone.defaultValue ?? "#111111"
    }
    if (zone.kind === "text" || zone.kind === "number") {
      base.color = "#ffffff"
      base.strokeColor = "#000000"
      base.strokeEnabled = true
    }
    return base
  })
}

function readAutosave(templateId: string): ThreeDDesignPayload | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ThreeDDesignPayload
    return parsed.templateId === templateId && parsed.version === 2 ? parsed : null
  } catch {
    return null
  }
}

function ensureLayerFor(layers: ThreeDLayerValue[], zone: TemplateZone): ThreeDLayerValue {
  const existing = layers.find((layer) => layer.zoneId === zone.id)
  if (existing) return existing
  const created: ThreeDLayerValue = { zoneId: zone.id, value: zone.defaultValue ?? "", enabled: true }
  if (zone.kind === "color") created.color = zone.allowedColors?.[0] ?? "#111111"
  if (zone.kind === "text" || zone.kind === "number") {
    created.color = "#ffffff"
    created.strokeColor = "#000000"
    created.strokeEnabled = true
  }
  return created
}

function isUuid(value: string | undefined): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function ThreeDDesigner({ template, config }: { template: TemplateRow; config: ThreeDTemplateConfig }) {
  const addDesignSnapshot = useCartStore((state) => state.addDesignSnapshot)
  const viewportRef = useRef<ViewportHandle | null>(null)
  const defaultColor = config.zones.find((zone) => zone.kind === "color")?.allowedColors?.[0] ?? "#111111"
  const [baseColor, setBaseColor] = useState(defaultColor)
  const [layers, setLayers] = useState(() => initialLayers(config))
  const [activePanel, setActivePanel] = useState<DesignerPanel>("base")
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(config.patterns?.[0]?.id)
  const [patternColor, setPatternColor] = useState<string>(() => defaultPatternColorFor(config.patterns?.[0]?.id))
  const [patternSecondaryColor, setPatternSecondaryColor] = useState(() => {
    const primary = defaultPatternColorFor(config.patterns?.[0]?.id)
    return primary === "#dc2626" ? "#7c2d12" : "#dc2626"
  })
  const [selectedKit, setSelectedKit] = useState<KitView>("shirt")
  const [quote, setQuote] = useState<ConfiguratorQuote>({ name: "", team: "", sizes: ["adulto"] })
  const [saving, setSaving] = useState(false)
  const [uploadingZone, setUploadingZone] = useState<string | null>(null)
  const [recoveryAvailable, setRecoveryAvailable] = useState(() => typeof window !== "undefined" && Boolean(readAutosave(template.id)))

  const editableZones = useMemo(() => config.zones.filter((zone) => zone.kind !== "color" && zone.kind !== "pattern"), [config.zones])
  const colorZones = useMemo(() => config.zones.filter((zone) => zone.kind === "color"), [config.zones])
  const patternZone = useMemo(() => config.zones.find((zone) => zone.kind === "pattern"), [config.zones])
  const dorsalZone = editableZones.find((zone) => zone.kind === "number")
  const nameZone = editableZones.find((zone) => zone.kind === "text")
  const escudoZone = editableZones.find((zone) => zone.kind === "logo" && (zone.assetRole === "shield" || zone.view === "front"))
  const sponsorFrontZone = editableZones.find((zone) => zone.kind === "sponsor" && zone.view === "front")
  const sponsorBackZone = editableZones.find((zone) => zone.kind === "sponsor" && zone.view === "back")
  const otherLogoZones = editableZones.filter((zone) => zone.kind === "logo" && zone.id !== escudoZone?.id)
  const dorsalLayer = dorsalZone ? ensureLayerFor(layers, dorsalZone) : undefined
  const nameLayer = nameZone ? ensureLayerFor(layers, nameZone) : undefined
  const selectedFont = config.fonts?.find((font) => font.id === dorsalLayer?.fontId)

  const patternOptions = useMemo(() => config.patterns ?? [], [config.patterns])
  const patternSupportsSecondary = useMemo(() => {
    const current = patternOptions.find((pattern) => pattern.id === selectedPatternId)
    return Boolean(current?.secondaryColor)
  }, [patternOptions, selectedPatternId])

  const availableKits = useMemo(() => {
    const kits = config.kits ?? []
    return kits.filter((kit) => {
      if (kit.id === "shirt") return Boolean(config.models?.shirt)
      if (kit.id === "shirtShort") return Boolean(config.models?.shirtShort || config.models?.shirt)
      if (kit.id === "full") return Boolean(config.models?.full || config.models?.shirtShort || config.models?.shirt)
      return true
    })
  }, [config.kits, config.models])

  const resolvedKit: KitView = useMemo(() => {
    if (availableKits.some((kit) => kit.id === selectedKit)) return selectedKit
    return availableKits[0]?.id ?? "shirt"
  }, [availableKits, selectedKit])

  const payload = useMemo<ThreeDDesignPayload>(
    () => ({
      version: 2,
      savedAt: 0,
      templateId: template.id,
      templateVersion: template.version,
      templateName: template.name,
      baseColor,
      previewUrl: "",
      layers,
      logos: [],
      quote,
      selectedPatternId,
      selectedKit: resolvedKit,
    }),
    [baseColor, layers, quote, resolvedKit, selectedPatternId, template.id, template.name, template.version],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }))
      } catch {
        /* quota handled when explicitly saving */
      }
    }, 500)
    return () => window.clearTimeout(timer)
  }, [payload])

  const updateLayer = useCallback((zone: TemplateZone, value: string, extra?: Partial<ThreeDLayerValue>) => {
    const nextValue = zone.kind === "text" || zone.kind === "sponsor" || zone.kind === "number" ? value.slice(0, zone.maxChars ?? MAX_TEXT) : value
    setLayers((current) => {
      const exists = current.some((layer) => layer.zoneId === zone.id)
      if (!exists) {
        const created: ThreeDLayerValue = { zoneId: zone.id, value: nextValue, enabled: true, ...extra }
        return [...current, created]
      }
      return current.map((layer) => (layer.zoneId === zone.id ? { ...layer, value: nextValue, ...extra } : layer))
    })
  }, [])

  async function uploadAsset(zone: TemplateZone, file: File) {
    if (!file.type.startsWith("image/") && !IMAGE_EXT.test(file.name)) {
      toast.error("Formato no soportado. Usá PNG, JPG, WebP o SVG.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("La imagen supera 5 MB.")
      return
    }
    setUploadingZone(zone.id)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
        reader.readAsDataURL(file)
      })
      updateLayer(zone, file.name, { assetUrl: dataUrl })
      toast.success("Imagen cargada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo leer el archivo")
    } finally {
      setUploadingZone(null)
    }
  }

  function recover() {
    const saved = readAutosave(template.id)
    if (!saved) return
    setBaseColor(saved.baseColor)
    setLayers(saved.layers)
    setQuote(saved.quote ?? { name: "", team: "", sizes: ["adulto"] })
    setSelectedPatternId(saved.selectedPatternId)
    setSelectedKit(saved.selectedKit ?? "shirt")
    setRecoveryAvailable(false)
    toast.success("Diseño recuperado")
  }

  function reset() {
    setBaseColor(defaultColor)
    setLayers(initialLayers(config))
    setSelectedPatternId(config.patterns?.[0]?.id)
    setPatternColor(defaultPatternColorFor(config.patterns?.[0]?.id))
    setQuote({ name: "", team: "", sizes: ["adulto"] })
    toast.success("Configuración restablecida")
  }

  async function addToCart() {
    setSaving(true)
    try {
      const canvas = viewportRef.current?.getCanvas() ?? null
      const previewUrl = canvas ? canvas.toDataURL("image/png", 0.7) : ""
      const finalPayload = { ...payload, savedAt: Date.now(), previewUrl }
      const id = isUuid(template.id) ? template.id : "designer-snapshot"
      addDesignSnapshot(finalPayload, id)
      toast.success("Diseño agregado al carrito")
    } finally {
      setSaving(false)
    }
  }

  function downloadPreview() {
    const canvas = viewportRef.current?.getCanvas() ?? null
    if (!canvas) {
      toast.error("La vista todavía no está lista")
      return
    }
    const link = document.createElement("a")
    link.download = `${template.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "diseno"}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  function setDorsalFont(fontId: string) {
    if (!dorsalZone) return
    const current = ensureLayerFor(layers, dorsalZone)
    updateLayer(dorsalZone, current.value, { fontId })
  }

  function toggleSize(size: "adulto" | "nino") {
    setQuote((current) => ({
      ...current,
      sizes: current.sizes.includes(size) ? current.sizes.filter((item) => item !== size) : [...current.sizes, size],
    }))
  }

  function toggleZoneEnabled(zone: TemplateZone) {
    const current = ensureLayerFor(layers, zone)
    updateLayer(zone, current.value, { enabled: !(current.enabled !== false) })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="min-w-0">
        <ThreeDViewport
          ref={viewportRef}
          config={config}
          baseColor={baseColor}
          layers={layers}
          selectedPatternId={selectedPatternId}
          patternColor={patternColor}
          patternSecondaryColor={patternSecondaryColor}
          selectedFontUrl={selectedFont?.fontUrl}
          selectedKit={resolvedKit}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card px-4 py-3 text-xs text-muted-foreground">
          <span>Rotá · Zoom · Previsualizá</span>
          <button
            type="button"
            onClick={downloadPreview}
            className="inline-flex items-center gap-2 text-white hover:text-brand-red"
          >
            <Download className="h-4 w-4" />
            Descargar diseño
          </button>
        </div>
      </section>
      <aside className="space-y-4 rounded-3xl border border-white/10 bg-card p-5">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Configurador 3D</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold">{template.name}</h1>
          <p className="text-muted-foreground mt-2 text-sm">Diseñá tu equipo como en un estudio profesional.</p>
        </div>
        {recoveryAvailable ? (
          <div className="flex items-center justify-between rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-xs">
            <span>Hay un diseño guardado.</span>
            <button type="button" onClick={recover} className="font-bold text-brand-red">
              Recuperar
            </button>
          </div>
        ) : null}
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
          {(["base", "design", "logos", "dorsal"] as const).map((panel) => (
            <button
              key={panel}
              type="button"
              onClick={() => setActivePanel(panel)}
              className={`rounded-lg px-2 py-2 text-xs font-bold ${activePanel === panel ? "bg-brand-red text-black" : "text-muted-foreground"}`}
            >
              {panel === "base" ? "Base" : panel === "design" ? "Diseño" : panel === "logos" ? "Logos" : "Dorsal"}
            </button>
          ))}
        </div>

        {activePanel === "base" ? (
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm font-semibold">
              <span>Color base</span>
              <input
                type="color"
                value={baseColor}
                onChange={(event) => setBaseColor(event.target.value)}
                className="h-8 w-12 cursor-pointer bg-transparent"
                aria-label="Color base"
              />
            </label>
            {colorZones.map((zone) => {
              const layer = layers.find((entry) => entry.zoneId === zone.id)
              const value = layer?.color ?? zone.allowedColors?.[0] ?? baseColor
              return (
                <label key={zone.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm">
                  <span className="flex flex-col">
                    <span>{zone.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {zone.materialNames?.length ? `Material: ${zone.materialNames.join(", ")}` : "Sin material asignado — se usará el color base"}
                    </span>
                  </span>
                  <input
                    type="color"
                    value={value}
                    onChange={(event) => updateLayer(zone, "", { color: event.target.value })}
                    className="h-7 w-10 cursor-pointer bg-transparent"
                    aria-label={zone.label}
                  />
                </label>
              )
            })}
            <div className="grid gap-2 rounded-xl border border-white/10 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kit</p>
              <div className="grid grid-cols-3 gap-2">
                {(config.kits ?? [
                  { id: "shirt" as const, label: "Camiseta" },
                  { id: "shirtShort" as const, label: "Camiseta + Short" },
                  { id: "full" as const, label: "Kit completo" },
                ]).map((kit) => {
                  const enabled = availableKits.some((option) => option.id === kit.id)
                  return (
                    <button
                      key={kit.id}
                      type="button"
                      onClick={() => enabled && setSelectedKit(kit.id)}
                      disabled={!enabled}
                      className={`rounded-lg border p-2 text-[11px] ${resolvedKit === kit.id ? "border-brand-red text-brand-red" : "border-white/10"} ${enabled ? "" : "cursor-not-allowed opacity-40"}`}
                    >
                      {kit.label}
                    </button>
                  )
                })}
              </div>
              {availableKits.length === 1 ? (
                <p className="text-[10px] text-muted-foreground">Solo la camiseta está configurada. Subí short y medias en el admin para más opciones.</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {activePanel === "design" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Elegí un preset y dos colores. Si no hay un material configurado como &ldquo;diseño&rdquo;, el preset solo cambia el tinte de la prenda.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {patternOptions.map((pattern) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatternId(pattern.id)
                    setPatternColor(defaultPatternColorFor(pattern.id))
                  }}
                  className={`group rounded-xl border p-2 text-left text-[11px] ${selectedPatternId === pattern.id ? "border-brand-red" : "border-white/10"}`}
                >
                  <span className="mb-1 block aspect-square w-full overflow-hidden rounded bg-[#1a1a1a]">
                    {pattern.thumbnailUrl || pattern.url ? (
                      <img
                        src={pattern.thumbnailUrl ?? pattern.url}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ filter: selectedPatternId === pattern.id ? "none" : "grayscale(40%)" }}
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">Sin imagen</span>
                    )}
                  </span>
                  <span className="line-clamp-2">{pattern.label}</span>
                </button>
              ))}
            </div>
            {patternZone?.materialNames?.length ? (
              <p className="text-[10px] text-muted-foreground">Materiales que reciben el diseño: {patternZone.materialNames.join(", ")}</p>
            ) : (
              <p className="text-[10px] text-amber-300">No hay materiales marcados como &ldquo;diseño&rdquo; en esta plantilla. Definilos en el JSON advanced para que el patrón se aplique.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-xs">
                Color 1
                <span className="text-[10px] text-muted-foreground">Tinte del patrón cuando el preset no se aplica como textura.</span>
                <input
                  type="color"
                  value={patternColor}
                  onChange={(event) => setPatternColor(event.target.value)}
                  className="h-9 w-full bg-transparent"
                />
              </label>
              <label className="grid gap-1 text-xs">
                Color 2
                <span className="text-[10px] text-muted-foreground">Solo aplica a presets de dos colores.</span>
                <input
                  type="color"
                  value={patternSecondaryColor}
                  onChange={(event) => setPatternSecondaryColor(event.target.value)}
                  className="h-9 w-full bg-transparent"
                  disabled={!patternSupportsSecondary}
                />
              </label>
            </div>
          </div>
        ) : null}

        {activePanel === "logos" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Arrastrá o hacé click para subir tu escudo y sponsors. PNG, JPG, WebP o SVG, máximo 5 MB.</p>
            {[escudoZone, sponsorFrontZone, sponsorBackZone, ...otherLogoZones].filter(Boolean).map((zone) => (
              <LogoUploader
                key={(zone as TemplateZone).id}
                zone={zone as TemplateZone}
                layer={layers.find((entry) => entry.zoneId === (zone as TemplateZone).id)}
                uploading={uploadingZone === (zone as TemplateZone).id}
                onUpload={(file) => uploadAsset(zone as TemplateZone, file)}
                onRemove={() => updateLayer(zone as TemplateZone, "", { assetUrl: undefined })}
              />
            ))}
          </div>
        ) : null}

        {activePanel === "dorsal" ? (
          <div className="space-y-3">
            {dorsalZone ? (
              <div className="grid gap-2 rounded-xl border border-white/10 p-3 text-sm">
                <label className="grid gap-1">
                  <span className="flex items-center justify-between">
                    <span>Dorsal</span>
                    <button type="button" onClick={() => toggleZoneEnabled(dorsalZone)} className="text-[10px] uppercase text-muted-foreground">
                      {dorsalLayer?.enabled === false ? "Mostrar" : "Ocultar"}
                    </button>
                  </span>
                  <input
                    value={dorsalLayer?.value ?? ""}
                    maxLength={dorsalZone.maxChars}
                    onChange={(event) => updateLayer(dorsalZone, event.target.value)}
                    placeholder="10"
                    className="rounded-xl border border-white/10 bg-background px-3 py-2"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="grid gap-1 text-xs">
                    Color de relleno
                    <input
                      type="color"
                      value={dorsalLayer?.color ?? "#ffffff"}
                      onChange={(event) => updateLayer(dorsalZone, dorsalLayer?.value ?? "", { color: event.target.value })}
                      className="h-9 w-full bg-transparent"
                    />
                  </label>
                  <label className="grid gap-1 text-xs">
                    <span className="flex items-center justify-between">
                      <span>Contorno</span>
                      <input
                        type="checkbox"
                        checked={Boolean(dorsalLayer?.strokeEnabled)}
                        onChange={(event) => updateLayer(dorsalZone, dorsalLayer?.value ?? "", { strokeEnabled: event.target.checked })}
                      />
                    </span>
                    <input
                      type="color"
                      value={dorsalLayer?.strokeColor ?? "#000000"}
                      onChange={(event) => updateLayer(dorsalZone, dorsalLayer?.value ?? "", { strokeColor: event.target.value })}
                      className="h-9 w-full bg-transparent"
                      disabled={!dorsalLayer?.strokeEnabled}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Esta plantilla no tiene una zona dorsal configurada.</p>
            )}
            {nameZone ? (
              <div className="grid gap-2 rounded-xl border border-white/10 p-3 text-sm">
                <label className="grid gap-1">
                  <span className="flex items-center justify-between">
                    <span>Nombre</span>
                    <button type="button" onClick={() => toggleZoneEnabled(nameZone)} className="text-[10px] uppercase text-muted-foreground">
                      {nameLayer?.enabled === false ? "Mostrar" : "Ocultar"}
                    </button>
                  </span>
                  <input
                    value={nameLayer?.value ?? ""}
                    maxLength={nameZone.maxChars}
                    onChange={(event) => updateLayer(nameZone, event.target.value)}
                    placeholder="TU EQUIPO"
                    className="rounded-xl border border-white/10 bg-background px-3 py-2"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="grid gap-1 text-xs">
                    Color de relleno
                    <input
                      type="color"
                      value={nameLayer?.color ?? "#ffffff"}
                      onChange={(event) => updateLayer(nameZone, nameLayer?.value ?? "", { color: event.target.value })}
                      className="h-9 w-full bg-transparent"
                    />
                  </label>
                  <label className="grid gap-1 text-xs">
                    <span className="flex items-center justify-between">
                      <span>Contorno</span>
                      <input
                        type="checkbox"
                        checked={Boolean(nameLayer?.strokeEnabled)}
                        onChange={(event) => updateLayer(nameZone, nameLayer?.value ?? "", { strokeEnabled: event.target.checked })}
                      />
                    </span>
                    <input
                      type="color"
                      value={nameLayer?.strokeColor ?? "#000000"}
                      onChange={(event) => updateLayer(nameZone, nameLayer?.value ?? "", { strokeColor: event.target.value })}
                      className="h-9 w-full bg-transparent"
                      disabled={!nameLayer?.strokeEnabled}
                    />
                  </label>
                </div>
              </div>
            ) : null}
            {config.fonts?.length ? (
              <div className="grid gap-2 rounded-xl border border-white/10 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipografía</p>
                <div className="grid grid-cols-2 gap-2">
                  {config.fonts.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setDorsalFont(font.id)}
                      className={`rounded-xl border p-2 text-xs ${selectedFont?.id === font.id ? "border-brand-red text-brand-red" : "border-white/10"}`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2 rounded-xl border border-white/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Datos del equipo</p>
          <input
            value={quote.name}
            onChange={(event) => setQuote((current) => ({ ...current, name: event.target.value.slice(0, 80) }))}
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm"
          />
          <input
            value={quote.team}
            onChange={(event) => setQuote((current) => ({ ...current, team: event.target.value.slice(0, 80) }))}
            placeholder="Nombre del equipo"
            className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            {(["adulto", "nino"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-lg border px-3 py-2 text-xs ${quote.sizes.includes(size) ? "border-brand-red text-brand-red" : "border-white/10"}`}
              >
                {size === "nino" ? "Niño" : "Adulto"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restablecer
          </Button>
          <Button type="button" variant="outline" onClick={() => toast.success("Diseño guardado automáticamente")}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button type="button" onClick={() => void addToCart()} disabled={saving} className="w-full bg-brand-red text-black hover:bg-[#ef4444]">
            <ShoppingBag className="mr-2 h-4 w-4" />
            {saving ? "Guardando…" : "Agregar al carrito"}
          </Button>
        </motion.div>
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <Check className="h-4 w-4 text-brand-green" />
          La posición de las zonas está bloqueada para asegurar la producción.
        </p>
      </aside>
    </div>
  )
}

function LogoUploader({
  zone,
  layer,
  uploading,
  onUpload,
  onRemove,
}: {
  zone: TemplateZone
  layer?: ThreeDLayerValue
  uploading: boolean
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const [dragging, setDragging] = useState(false)
  function onDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) onUpload(file)
  }
  const role = zone.assetRole
  const helperByRole: Record<string, string> = {
    shield: "PNG con fondo transparente recomendado. Se imprime en el pecho.",
    sponsor: "Logo rectangular en PNG o SVG. Se imprime centrado en el pecho.",
    backSponsor: "Logo para imprimir en la espalda, debajo del dorsal.",
  }
  const helper = role && helperByRole[role] ? helperByRole[role] : "PNG, JPG, WebP o SVG · máximo 5 MB"
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>{zone.label}</span>
        {layer?.assetUrl ? (
          <button type="button" onClick={onRemove} aria-label="Quitar imagen" className="text-red-400">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <label
        onDrop={onDrop}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center text-xs transition-colors ${dragging ? "border-brand-red bg-brand-red/5" : "border-white/15 bg-black/20 hover:border-white/30"}`}
      >
        {uploading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Subiendo…
          </span>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span className="font-semibold text-brand-red">Arrastrá</span>
            <span>o hacé click para subir</span>
            <span className="text-[10px] text-muted-foreground">{helper}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onUpload(file)
                event.target.value = ""
              }}
            />
          </>
        )}
      </label>
      {layer?.assetUrl ? (
        <img src={layer.assetUrl} alt={zone.label} className="mt-2 h-20 w-full rounded object-contain" />
      ) : null}
    </div>
  )
}
