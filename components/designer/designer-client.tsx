"use client"

// Orquestador del diseñador 3D.
// - Lee `?d=<lz>` (link serializado) y `?design=<id>` (cuenta) en mount.
// - Bloquea render hasta `useDesignHasHydrated()` para evitar hydration mismatch.
// - Sembra el templateId en el store tras hidratar.
//
// El panel UI (Fase 6) se monta dentro de este componente.

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Sparkles, ArrowLeft, SlidersHorizontal } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"
import { Viewer2D, type Viewer2DHandle } from "@/components/designer/viewer-2d"
import { RecoverDesignModal } from "@/components/designer/modals/RecoverDesignModal"
import { SaveDesignModal } from "@/components/designer/modals/SaveDesignModal"
import { QuoteModal } from "@/components/designer/modals/QuoteModal"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TabColores } from "@/components/designer/panel/TabColores"
import { TabDiseno } from "@/components/designer/panel/TabDiseno"
import { TabEscudos } from "@/components/designer/panel/TabEscudos"
import { useDesignStore, useDesignHasHydrated } from "@/stores/design-store"
import { deserialize } from "@/lib/utils/url-serializer"
import type { DesignState } from "@/lib/designer/types"
import type { TemplateRow } from "@/lib/supabase/types"
import { WHATSAPP_NUMBER } from "@/lib/constants"

interface DesignerClientProps {
  template: TemplateRow | null
}

function DesignerPanel() {
  return (
    <Tabs defaultValue="colores" className="w-full">
      <TabsList variant="line" className="mb-3 w-full">
        <TabsTrigger value="colores">Colores</TabsTrigger>
        <TabsTrigger value="diseno">Diseño</TabsTrigger>
        <TabsTrigger value="escudos">Escudos</TabsTrigger>
      </TabsList>
      <TabsContent value="colores">
        <TabColores />
      </TabsContent>
      <TabsContent value="diseno">
        <TabDiseno />
      </TabsContent>
      <TabsContent value="escudos">
        <TabEscudos />
      </TabsContent>
    </Tabs>
  )
}

export function DesignerClient({ template }: DesignerClientProps) {
  const viewerRef = useRef<Viewer2DHandle>(null)
  const hydrated = useDesignHasHydrated()
  const state = useDesignStore((s) => s.state)
  const load = useDesignStore((s) => s.load)
  const importState = useDesignStore((s) => s.importState)

  // 1) Sembrar el template en el store (sólo una vez al montar).
  useEffect(() => {
    if (!hydrated) return
    if (template) load(template.id)
    else load(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, template?.id])

  // 2) Leer `?d=` (link) o `?design=` (diseño guardado en cuenta).
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    const url = new URL(window.location.href)
    const d = url.searchParams.get("d")
    if (d) {
      const next = deserialize(d)
      if (next) importState(next)
      return
    }

    const designId = url.searchParams.get("design")
    if (!designId) return
    const controller = new AbortController()
    void fetch(`/api/designs/${encodeURIComponent(designId)}`, {
      signal: controller.signal,
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) return null
        return (await response.json()) as { payload?: unknown }
      })
      .then((result) => {
        const payload = result?.payload
        if (payload && typeof payload === "object" && (payload as { version?: unknown }).version === 1) {
          importState(payload as DesignState)
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        console.warn("[design] saved design load failed:", error)
      })
    return () => controller.abort()
  }, [hydrated, importState])
  if (!template) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center md:py-28">
        <span className="border-brand-red/30 bg-brand-red/10 text-brand-red inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="h-3 w-3" />
          Sin plantilla activa
        </span>
        <h1 className="font-display mt-5 text-4xl font-extrabold md:text-5xl">
          No hay un modelo disponible ahora
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-balance text-sm md:text-base">
          Activá una silueta desde el panel de administración o pedinos tu
          diseño por WhatsApp y te armamos una cotización.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola! Quiero coordinar un diseño personalizado.")}`}
            size="lg"
          >
            Coordinar por WhatsApp
          </ButtonLink>
          <Link
            href="/productos"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Ver catálogo
          </Link>
        </div>
      </div>
    )
  }

  // Mientras no hidrate, mostramos un skeleton para evitar SSR mismatch.
  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-screen-2xl items-start gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <div className="bg-muted aspect-square w-full animate-pulse rounded-lg" />
        <div className="bg-muted h-[60vh] w-full animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-screen-2xl items-start gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        <Viewer2D ref={viewerRef} state={state} />
        <div className="flex justify-end gap-2">
          <QuoteModal state={state} />
          <SaveDesignModal
            state={state}
            getCanvas={() => viewerRef.current?.getAtlasCanvas() ?? null}
          />
        </div>
      </div>
      {/* Desktop: panel sticky lateral. */}
      <aside className="bg-muted/30 border-foreground/10 sticky top-20 hidden h-[80vh] overflow-y-auto rounded-lg border p-4 lg:block">
        <DesignerPanel />
      </aside>
      {/* Mobile: FAB + bottom sheet. */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <button
                type="button"
                aria-label="Abrir panel del diseñador"
                className="bg-brand-red text-black fixed right-4 bottom-4 z-30 inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-bold shadow-lg shadow-black/30"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Personalizar
              </button>
            }
          />
          <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Personalizá tu uniforme</SheetTitle>
              <SheetDescription>
                Cambiá colores, patrones, escudos y textos desde aquí.
              </SheetDescription>
            </SheetHeader>
            <div id="designer-panel" className="px-4 pb-6">
              <DesignerPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <RecoverDesignModal />
    </div>
  )
}
