import { Suspense } from "react"
import { PersonalizarTopBar } from "./_topbar"
import { ThreeDDesignerClient } from "@/components/express/ThreeDDesignerClient"
import { createClient } from "@/lib/supabase/server"
import type { TemplateRow } from "@/lib/supabase/types"
import type { ThreeDTemplateConfig } from "@/lib/designer/design-types"

export const metadata = { title: "Diseñá tu equipo 3D | Borac Sport", description: "Configurador 3D interactivo de indumentaria personalizada." }

async function getTemplate(): Promise<TemplateRow | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("templates").select("*").eq("active", true).not("model_url", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle()
  return data as TemplateRow | null
}

function templateConfig(template: TemplateRow): ThreeDTemplateConfig | null {
  if (!template.model_url || !template.model_format) return null
  const scene = template.scene_config && typeof template.scene_config === "object" && !Array.isArray(template.scene_config) ? template.scene_config as Record<string, unknown> : {}
  const zones = Array.isArray(template.editable_zones) ? template.editable_zones : []
  return { modelUrl: template.model_url, modelFormat: template.model_format, scene: scene as ThreeDTemplateConfig["scene"], zones: zones as ThreeDTemplateConfig["zones"] }
}

export default async function PersonalizarPage() {
  const template = await getTemplate()
  const config = template ? templateConfig(template) : null
  return <div className="min-h-screen bg-background px-4 pb-8 pt-20 md:px-8"><Suspense fallback={null}><PersonalizarTopBar /></Suspense><main className="mx-auto max-w-7xl">{template && config ? <ThreeDDesignerClient template={template} config={config} /> : <div className="rounded-3xl border border-white/10 bg-card p-12 text-center"><h1 className="font-display text-3xl font-extrabold">Configurador 3D próximamente</h1><p className="text-muted-foreground mt-3">El equipo está preparando modelos 3D para que diseñes tu indumentaria.</p></div>}</main></div>
}
