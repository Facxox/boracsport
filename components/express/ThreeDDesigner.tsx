"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Check, ImagePlus, Loader2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThreeDViewport } from "@/components/express/ThreeDViewport"
import { useCartStore } from "@/stores/cart-store"
import type { ThreeDDesignPayload, ThreeDTemplateConfig, TemplateZone } from "@/lib/designer/design-types"
import type { TemplateRow } from "@/lib/supabase/types"

const MAX_TEXT = 80

function initialLayers(config: ThreeDTemplateConfig) {
  return config.zones.map((zone) => ({ zoneId: zone.id, value: zone.defaultValue ?? "", color: zone.allowedColors?.[0] }))
}

export function ThreeDDesigner({ template, config }: { template: TemplateRow; config: ThreeDTemplateConfig }) {
  const addDesignSnapshot = useCartStore((state) => state.addDesignSnapshot)
  const [baseColor, setBaseColor] = useState(config.zones.find((zone) => zone.kind === "color")?.allowedColors?.[0] ?? "#111111")
  const [layers, setLayers] = useState(initialLayers(config))
  const [saving, setSaving] = useState(false)
  const [uploadingZone, setUploadingZone] = useState<string | null>(null)

  const editableZones = useMemo(() => config.zones.filter((zone) => zone.kind !== "color"), [config.zones])

  function updateLayer(zone: TemplateZone, value: string, extra?: { color?: string; assetUrl?: string }) {
    const nextValue = zone.kind === "text" || zone.kind === "sponsor" || zone.kind === "number" ? value.slice(0, zone.maxChars ?? MAX_TEXT) : value
    setLayers((current) => current.map((layer) => layer.zoneId === zone.id ? { ...layer, value: nextValue, ...extra } : layer))
  }

  async function uploadAsset(zone: TemplateZone, file: File) {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return
    setUploadingZone(zone.id)
    try {
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => { reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })
      updateLayer(zone, file.name, { assetUrl: dataUrl })
    } finally { setUploadingZone(null) }
  }

  function addToCart() {
    setSaving(true)
    const payload: ThreeDDesignPayload = { version: 2, savedAt: Date.now(), templateId: template.id, templateVersion: 1, templateName: template.name, baseColor, previewUrl: "", layers, logos: [] }
    addDesignSnapshot(payload, crypto.randomUUID())
    setSaving(false)
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><section><ThreeDViewport config={config} baseColor={baseColor} /><div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-card px-4 py-3 text-xs text-muted-foreground"><span>Las zonas están fijadas por Borac Sport para mantener el calce y la producción.</span><span className="hidden sm:inline">Rotá · Zoom · Previsualizá</span></div></section><aside className="space-y-5 rounded-3xl border border-white/10 bg-card p-5"><div><p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Configurador 3D</p><h1 className="mt-2 font-display text-2xl font-extrabold">{template.name}</h1><p className="text-muted-foreground mt-2 text-sm">Editá el contenido de cada zona sin mover su posición.</p></div><label className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm font-semibold">Color base<input type="color" value={baseColor} onChange={(event) => setBaseColor(event.target.value)} className="h-8 w-12 cursor-pointer rounded bg-transparent" /></label><div className="space-y-3">{editableZones.map((zone) => { const layer = layers.find((item) => item.zoneId === zone.id); return <div key={zone.id} className="rounded-2xl border border-white/10 p-3"><div className="flex items-center justify-between"><label htmlFor={`zone-${zone.id}`} className="text-sm font-semibold">{zone.label}</label><span className="text-[10px] uppercase tracking-wider text-brand-red">{zone.kind === "number" ? "Dorsal" : zone.kind}</span></div>{zone.kind === "logo" || zone.kind === "sponsor" ? <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-xs hover:border-brand-red">{uploadingZone === zone.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}Subir imagen<input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(zone, file) }} /></label> : <input id={`zone-${zone.id}`} value={layer?.value ?? ""} maxLength={zone.maxChars} onChange={(event) => updateLayer(zone, event.target.value)} placeholder={zone.kind === "number" ? "10" : "Escribí aquí"} className="mt-3 w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-sm" />}{zone.allowedColors && <div className="mt-3 flex flex-wrap gap-2">{zone.allowedColors.map((color) => <button key={color} type="button" aria-label={`Elegir color ${color}`} onClick={() => updateLayer(zone, layer?.value ?? "", { color })} className={`h-6 w-6 rounded-full border-2 ${layer?.color === color ? "border-brand-red" : "border-white/20"}`} style={{ backgroundColor: color }} />)}</div>}<p className="mt-2 flex items-center gap-1 text-[11px] text-white/45"><Check className="h-3 w-3 text-brand-green" />Posición bloqueada</p></div> })}</div><motion.div whileTap={{ scale: 0.98 }}><Button type="button" onClick={addToCart} disabled={saving} className="w-full bg-brand-red text-black hover:bg-[#ff6a1f]"><ShoppingBag className="mr-2 h-4 w-4" />{saving ? "Guardando…" : "Agregar al carrito"}</Button></motion.div><p className="text-muted-foreground text-xs">Precio a coordinar después de revisar tu diseño.</p></aside></div>
}
