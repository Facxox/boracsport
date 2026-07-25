"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Check, Download, Loader2, RotateCcw, Save, ShoppingBag, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ThreeDViewport } from "@/components/express/ThreeDViewport"
import { useCartStore } from "@/stores/cart-store"
import type { ConfiguratorQuote, DesignerPanel, KitView, ThreeDDesignPayload, ThreeDLayerValue, ThreeDTemplateConfig, TemplateZone } from "@/lib/designer/design-types"
import type { TemplateRow } from "@/lib/supabase/types"

const MAX_TEXT = 80
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const AUTOSAVE_KEY = "borac-3d-configurator-v3"
const IMAGE_EXT = /\.(png|jpe?g|webp|svg)$/i

function initialLayers(config: ThreeDTemplateConfig): ThreeDLayerValue[] {
  return config.zones.map((zone) => ({ zoneId: zone.id, value: zone.defaultValue ?? "", color: zone.allowedColors?.[0], enabled: true }))
}

function readAutosave(templateId: string): ThreeDDesignPayload | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ThreeDDesignPayload
    return parsed.templateId === templateId && parsed.version === 2 ? parsed : null
  } catch { return null }
}

export function ThreeDDesigner({ template, config }: { template: TemplateRow; config: ThreeDTemplateConfig }) {
  const addDesignSnapshot = useCartStore((state) => state.addDesignSnapshot)
  const defaultColor = config.zones.find((zone) => zone.kind === "color")?.allowedColors?.[0] ?? "#111111"
  const [baseColor, setBaseColor] = useState(defaultColor)
  const [layers, setLayers] = useState(() => initialLayers(config))
  const [activePanel, setActivePanel] = useState<DesignerPanel>("base")
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(config.patterns?.[0]?.id)
  const [patternColor, setPatternColor] = useState("#5b0000")
  const [patternSecondaryColor, setPatternSecondaryColor] = useState("#7a3200")
  const [selectedKit, setSelectedKit] = useState<KitView>("shirt")
  const [quote, setQuote] = useState<ConfiguratorQuote>({ name: "", team: "", sizes: ["adulto"] })
  const [saving, setSaving] = useState(false)
  const [uploadingZone, setUploadingZone] = useState<string | null>(null)
  const [recoveryAvailable, setRecoveryAvailable] = useState(() => typeof window !== "undefined" && Boolean(readAutosave(template.id)))

  const editableZones = useMemo(() => config.zones.filter((zone) => zone.kind !== "color"), [config.zones])
  const dorsalZone = editableZones.find((zone) => zone.kind === "number")
  const nameZone = editableZones.find((zone) => zone.kind === "text")
  const selectedFont = config.fonts?.find((font) => font.id === layers.find((layer) => layer.zoneId === dorsalZone?.id)?.fontId)

  const payload = useMemo<ThreeDDesignPayload>(() => ({ version: 2, savedAt: 0, templateId: template.id, templateVersion: template.version, templateName: template.name, baseColor, previewUrl: "", layers, logos: [], quote, selectedPatternId, selectedKit }), [baseColor, layers, quote, selectedKit, selectedPatternId, template.id, template.name, template.version])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ ...payload, savedAt: Date.now() })) } catch { /* quota handled when explicitly saving */ }
    }, 500)
    return () => window.clearTimeout(timer)
  }, [payload])

  const updateLayer = useCallback((zone: TemplateZone, value: string, extra?: Partial<ThreeDLayerValue>) => {
    const nextValue = ["text", "sponsor", "number"].includes(zone.kind) ? value.slice(0, zone.maxChars ?? MAX_TEXT) : value
    setLayers((current) => current.map((layer) => layer.zoneId === zone.id ? { ...layer, value: nextValue, ...extra } : layer))
  }, [])

  async function uploadAsset(zone: TemplateZone, file: File) {
    if (!file.type.startsWith("image/") && !IMAGE_EXT.test(file.name)) { toast.error("Formato no soportado. Usá PNG, JPG, WebP o SVG."); return }
    if (file.size > MAX_IMAGE_BYTES) { toast.error("La imagen supera 5 MB."); return }
    setUploadingZone(zone.id)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("No se pudo leer el archivo")); reader.readAsDataURL(file) })
      updateLayer(zone, file.name, { assetUrl: dataUrl })
      toast.success("Imagen cargada")
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo leer el archivo") } finally { setUploadingZone(null) }
  }

  function recover() {
    const saved = readAutosave(template.id)
    if (!saved) return
    setBaseColor(saved.baseColor); setLayers(saved.layers); setQuote(saved.quote ?? { name: "", team: "", sizes: ["adulto"] }); setSelectedPatternId(saved.selectedPatternId); setSelectedKit(saved.selectedKit ?? "shirt"); setRecoveryAvailable(false); toast.success("Diseño recuperado")
  }

  function reset() {
    setBaseColor(defaultColor); setLayers(initialLayers(config)); setSelectedPatternId(config.patterns?.[0]?.id); setQuote({ name: "", team: "", sizes: ["adulto"] }); toast.success("Configuración restablecida")
  }

  async function addToCart() {
    setSaving(true)
    try {
      const canvas = document.querySelector("canvas")
      const previewUrl = canvas instanceof HTMLCanvasElement ? canvas.toDataURL("image/png", 0.7) : ""
      const finalPayload = { ...payload, savedAt: Date.now(), previewUrl }
      addDesignSnapshot(finalPayload, crypto.randomUUID())
      toast.success("Diseño agregado al carrito")
    } finally { setSaving(false) }
  }

  function downloadPreview() {
    const canvas = document.querySelector("canvas")
    if (!(canvas instanceof HTMLCanvasElement)) { toast.error("La vista todavía no está lista"); return }
    const link = document.createElement("a"); link.download = `${template.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "diseno"}.png`; link.href = canvas.toDataURL("image/png"); link.click()
  }

  function setDorsalFont(fontId: string) { if (dorsalZone) updateLayer(dorsalZone, layers.find((layer) => layer.zoneId === dorsalZone.id)?.value ?? "", { fontId }) }
  function toggleSize(size: "adulto" | "nino") { setQuote((current) => ({ ...current, sizes: current.sizes.includes(size) ? current.sizes.filter((item) => item !== size) : [...current.sizes, size] })) }

  const colorZones = config.zones.filter((zone) => zone.kind === "color")
  const patternOptions = config.patterns ?? []
  const logoZones = editableZones.filter((zone) => zone.kind === "logo" || zone.kind === "sponsor")

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
    <section className="min-w-0">
      <ThreeDViewport config={config} baseColor={baseColor} layers={layers} selectedPatternId={selectedPatternId} patternColor={patternColor} patternSecondaryColor={patternSecondaryColor} selectedFontUrl={selectedFont?.fontUrl} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card px-4 py-3 text-xs text-muted-foreground"><span>Rotá · Zoom · Previsualizá</span><button type="button" onClick={downloadPreview} className="inline-flex items-center gap-2 text-white hover:text-brand-red"><Download className="h-4 w-4" />Descargar diseño</button></div>
    </section>
    <aside className="space-y-4 rounded-3xl border border-white/10 bg-card p-5">
      <div><p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Configurador 3D</p><h1 className="mt-2 font-display text-2xl font-extrabold">{template.name}</h1><p className="text-muted-foreground mt-2 text-sm">Diseñá tu equipo como en un estudio profesional.</p></div>
      {recoveryAvailable ? <div className="flex items-center justify-between rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-xs"><span>Hay un diseño guardado.</span><button type="button" onClick={recover} className="font-bold text-brand-red">Recuperar</button></div> : null}
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">{(["base", "design", "logos", "dorsal"] as const).map((panel) => <button key={panel} type="button" onClick={() => setActivePanel(panel)} className={`rounded-lg px-2 py-2 text-xs font-bold ${activePanel === panel ? "bg-brand-red text-black" : "text-muted-foreground"}`}>{panel === "base" ? "Base" : panel === "design" ? "Diseño" : panel === "logos" ? "Logos" : "Dorsal"}</button>)}</div>
      {activePanel === "base" ? <div className="space-y-3"><label className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm font-semibold">Color base<input type="color" value={baseColor} onChange={(event) => setBaseColor(event.target.value)} className="h-8 w-12 cursor-pointer bg-transparent" /></label>{colorZones.map((zone) => <label key={zone.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm"><span>{zone.label}</span><input type="color" value={layers.find((layer) => layer.zoneId === zone.id)?.color ?? zone.allowedColors?.[0] ?? baseColor} onChange={(event) => updateLayer(zone, "", { color: event.target.value })} className="h-7 w-10 cursor-pointer bg-transparent" /></label>)}<div className="grid grid-cols-3 gap-2">{(config.kits ?? [{ id: "shirt", label: "Camiseta" }, { id: "shirtShort", label: "Camiseta + short" }, { id: "full", label: "Kit completo" }]).map((kit) => <button key={kit.id} type="button" onClick={() => setSelectedKit(kit.id)} className={`rounded-lg border p-2 text-[11px] ${selectedKit === kit.id ? "border-brand-red text-brand-red" : "border-white/10"}`}>{kit.label}</button>)}</div></div> : null}
      {activePanel === "design" ? <div className="space-y-3"><div className="grid grid-cols-3 gap-2">{patternOptions.map((pattern) => <button key={pattern.id} type="button" onClick={() => setSelectedPatternId(pattern.id)} className={`rounded-xl border p-2 text-left text-[11px] ${selectedPatternId === pattern.id ? "border-brand-red" : "border-white/10"}`}><img src={pattern.thumbnailUrl ?? pattern.url} alt="" className="mb-1 aspect-square w-full rounded object-cover" />{pattern.label}</button>)}</div><div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs">Color 1<input type="color" value={patternColor} onChange={(event) => setPatternColor(event.target.value)} className="h-9 w-full bg-transparent" /></label><label className="grid gap-1 text-xs">Color 2<input type="color" value={patternSecondaryColor} onChange={(event) => setPatternSecondaryColor(event.target.value)} className="h-9 w-full bg-transparent" /></label></div></div> : null}
      {activePanel === "logos" ? <div className="space-y-3">{logoZones.map((zone) => { const layer = layers.find((item) => item.zoneId === zone.id); return <div key={zone.id} className="rounded-xl border border-white/10 p-3"><div className="flex items-center justify-between text-sm font-semibold"><span>{zone.label}</span>{layer?.assetUrl ? <button type="button" onClick={() => updateLayer(zone, "", { assetUrl: undefined })} aria-label="Quitar imagen"><X className="h-4 w-4 text-red-400" /></button> : null}</div><label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-xs">{uploadingZone === zone.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{layer?.assetUrl ? "Reemplazar imagen" : "Subir imagen"}<input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(zone, file); event.target.value = "" }} /></label>{layer?.assetUrl ? <img src={layer.assetUrl} alt={zone.label} className="mt-2 h-20 w-full rounded object-contain" /> : <p className="mt-2 text-[11px] text-muted-foreground">PNG, JPG, WebP o SVG · máximo 5 MB</p>}</div> })}</div> : null}
      {activePanel === "dorsal" ? <div className="space-y-3">{dorsalZone ? <label className="grid gap-2 text-sm">Número<input value={layers.find((layer) => layer.zoneId === dorsalZone.id)?.value ?? ""} maxLength={dorsalZone.maxChars} onChange={(event) => updateLayer(dorsalZone, event.target.value)} placeholder="10" className="rounded-xl border border-white/10 bg-background px-3 py-2" /></label> : null}{nameZone ? <label className="grid gap-2 text-sm">Nombre<input value={layers.find((layer) => layer.zoneId === nameZone.id)?.value ?? ""} maxLength={nameZone.maxChars} onChange={(event) => updateLayer(nameZone, event.target.value)} placeholder="TU EQUIPO" className="rounded-xl border border-white/10 bg-background px-3 py-2" /></label> : null}{config.fonts?.length ? <div className="grid grid-cols-2 gap-2">{config.fonts.map((font) => <button key={font.id} type="button" onClick={() => setDorsalFont(font.id)} className={`rounded-xl border p-2 text-xs ${selectedFont?.id === font.id ? "border-brand-red text-brand-red" : "border-white/10"}`}>{font.label}</button>)}</div> : null}</div> : null}
      <div className="space-y-2 rounded-xl border border-white/10 p-3"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Datos del equipo</p><input value={quote.name} onChange={(event) => setQuote((current) => ({ ...current, name: event.target.value.slice(0, 80) }))} placeholder="Tu nombre" className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm" /><input value={quote.team} onChange={(event) => setQuote((current) => ({ ...current, team: event.target.value.slice(0, 80) }))} placeholder="Nombre del equipo" className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm" /><div className="flex gap-2">{(["adulto", "nino"] as const).map((size) => <button key={size} type="button" onClick={() => toggleSize(size)} className={`rounded-lg border px-3 py-2 text-xs ${quote.sizes.includes(size) ? "border-brand-red text-brand-red" : "border-white/10"}`}>{size === "nino" ? "Niño" : "Adulto"}</button>)}</div></div>
      <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Restablecer</Button><Button type="button" variant="outline" onClick={() => toast.success("Diseño guardado automáticamente")}><Save className="mr-2 h-4 w-4" />Guardar</Button></div>
      <motion.div whileTap={{ scale: 0.98 }}><Button type="button" onClick={() => void addToCart()} disabled={saving} className="w-full bg-brand-red text-black hover:bg-[#ef4444]"><ShoppingBag className="mr-2 h-4 w-4" />{saving ? "Guardando…" : "Agregar al carrito"}</Button></motion.div>
      <p className="text-muted-foreground flex items-center gap-2 text-xs"><Check className="h-4 w-4 text-brand-green" />La posición de las zonas está bloqueada para asegurar la producción.</p>
    </aside>
  </div>
}
