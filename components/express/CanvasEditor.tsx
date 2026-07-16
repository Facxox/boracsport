"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Canvas, FabricImage, FabricObject, filters } from "fabric"
import { motion } from "framer-motion"
import { Check, ImagePlus, Loader2, RotateCcw, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cart-store"
import type { DesignerView, ExpressDesignPayload, LogoTransform } from "@/lib/designer/design-types"
import type { TemplateRow } from "@/lib/supabase/types"

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 760

export type CanvasEditorProps = {
  template: TemplateRow
  onAdded?: () => void
}

type DesignObject = FabricObject & {
  data?: { logoId: string; assetUrl: string; view: DesignerView }
}

function getBackgroundUrl(template: TemplateRow, view: DesignerView) {
  return view === "front" ? template.mockup_url_front : template.mockup_url_back
}

export function CanvasEditor({ template, onAdded }: CanvasEditorProps) {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const snapshotsRef = useRef<Record<DesignerView, string>>({ front: "", back: "" })
  const [view, setView] = useState<DesignerView>("front")
  const [baseColor, setBaseColor] = useState("#111111")
  const [loadingLogo, setLoadingLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const addDesignSnapshot = useCartStore((state) => state.addDesignSnapshot)

  const saveCurrentView = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    snapshotsRef.current[view] = JSON.stringify(
      canvas.getObjects().filter((object) => object !== canvas.backgroundImage).map((object) => object.toObject(["data"])),
    )
  }, [view])

  const renderBackground = useCallback(async (nextView: DesignerView) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const background = await FabricImage.fromURL(getBackgroundUrl(template, nextView), { crossOrigin: "anonymous" })
    background.set({ left: 0, top: 0, selectable: false, evented: false, excludeFromExport: false })
    const scale = Math.min(CANVAS_WIDTH / (background.width || CANVAS_WIDTH), CANVAS_HEIGHT / (background.height || CANVAS_HEIGHT))
    background.scale(scale)
    background.set({ left: (CANVAS_WIDTH - background.getScaledWidth()) / 2, top: (CANVAS_HEIGHT - background.getScaledHeight()) / 2 })
    const tint = new filters.BlendColor({ color: baseColor, mode: "tint", alpha: 0.7 })
    background.filters = [tint]
    background.applyFilters()
    canvas.backgroundImage = background
    canvas.requestRenderAll()
    const saved = snapshotsRef.current[nextView]
    if (saved) {
      const objects = await canvas.loadFromJSON({ objects: JSON.parse(saved) })
      objects.renderAll()
    }
  }, [baseColor, template])

  useEffect(() => {
    if (!canvasElementRef.current) return
    const canvas = new Canvas(canvasElementRef.current, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, preserveObjectStacking: true })
    canvasRef.current = canvas
    void renderBackground("front")
    return () => {
      canvas.dispose()
      canvasRef.current = null
    }
  }, [renderBackground])

  useEffect(() => {
    void renderBackground(view)
  }, [renderBackground, view])

  const switchView = (nextView: DesignerView) => {
    if (nextView === view) return
    saveCurrentView()
    setView(nextView)
  }

  const uploadLogo = async (file: File) => {
    if (!file.type.includes("png") && !file.type.includes("svg")) return
    if (file.size > MAX_UPLOAD_BYTES) return
    const canvas = canvasRef.current
    if (!canvas) return
    setLoadingLogo(true)
    try {
      const supabase = createClient()
      const path = `${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error("Iniciá sesión para subir un logo")
      const { error } = await supabase.storage.from("boracsport_customizations").upload(`${userId}/${path}`, file, { contentType: file.type, upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from("boracsport_customizations").getPublicUrl(`${userId}/${path}`)
      const image = await FabricImage.fromURL(data.publicUrl, { crossOrigin: "anonymous" })
      const maxWidth = 220
      if ((image.width || 0) > maxWidth) image.scaleToWidth(maxWidth)
      image.set({ left: CANVAS_WIDTH / 2 - image.getScaledWidth() / 2, top: CANVAS_HEIGHT / 2 - image.getScaledHeight() / 2, selectable: true, hasControls: true, data: { logoId: crypto.randomUUID(), assetUrl: data.publicUrl, view } })
      canvas.add(image)
      canvas.setActiveObject(image)
      canvas.requestRenderAll()
    } finally {
      setLoadingLogo(false)
    }
  }

  const addToCart = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    saveCurrentView()
    setSaving(true)
    const logos: LogoTransform[] = canvas.getObjects().filter((object): object is DesignObject => Boolean((object as DesignObject).data)).map((object) => ({ id: object.data!.logoId, assetUrl: object.data!.assetUrl, left: object.left || 0, top: object.top || 0, scaleX: object.scaleX || 1, scaleY: object.scaleY || 1, angle: object.angle || 0, view: object.data!.view }))
    const payload: ExpressDesignPayload = { version: 2, savedAt: Date.now(), templateId: template.id, templateVersion: template.version, templateName: template.name, baseColor, previewUrl: canvas.toDataURL({ format: "png", multiplier: 0.5 }), layers: [], logos }
    addDesignSnapshot(payload, crypto.randomUUID())
    setSaving(false)
    onAdded?.()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="overflow-auto rounded-3xl border border-white/10 bg-[#0b0b0d] p-3 shadow-2xl">
        <canvas ref={canvasElementRef} className="mx-auto max-w-full rounded-2xl" />
      </div>
      <aside className="space-y-5 rounded-3xl border border-white/10 bg-card p-5">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Configurador Express</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold">{template.name}</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          {(["front", "back"] as const).map((item) => (
            <button key={item} type="button" onClick={() => switchView(item)} className="relative rounded-lg px-3 py-2 text-sm font-semibold">
              {view === item && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-lg bg-brand-red" />}
              <span className="relative z-10">{item === "front" ? "Frente" : "Espalda"}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm font-semibold">
          Color base
          <input type="color" value={baseColor} onChange={(event) => setBaseColor(event.target.value)} className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent" />
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 p-4 text-sm font-semibold hover:border-brand-red">
          {loadingLogo ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span>Subir logo PNG o SVG</span>
          <input type="file" accept="image/png,image/svg+xml" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLogo(file) }} />
        </label>
        <Button type="button" onClick={() => { canvasRef.current?.discardActiveObject(); canvasRef.current?.requestRenderAll() }} variant="outline" className="w-full"><RotateCcw className="mr-2 h-4 w-4" />Deseleccionar</Button>
        <Button type="button" onClick={addToCart} disabled={saving} className="w-full bg-brand-red text-foreground hover:bg-[#ef4444]"><ShoppingBag className="mr-2 h-4 w-4" />{saving ? "Guardando…" : "Agregar al carrito"}</Button>
        <p className="text-muted-foreground flex items-center gap-2 text-xs"><Check className="h-4 w-4 text-brand-green" />Precio a coordinar después de revisar tu diseño.</p>
      </aside>
    </div>
  )
}
