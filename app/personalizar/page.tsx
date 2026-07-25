import { Suspense } from "react"
import { PersonalizarTopBar } from "./_topbar"
import { ThreeDDesignerClient } from "@/components/express/ThreeDDesignerClient"
import { createClient } from "@/lib/supabase/server"
import type { TemplateRow } from "@/lib/supabase/types"
import { normalizeTemplateConfig } from "@/lib/designer/normalize-config"

export const metadata = { title: "Diseñá tu equipo 3D | Borac Sport", description: "Configurador 3D interactivo de indumentaria personalizada." }

async function getTemplate(): Promise<TemplateRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("active", true)
    .not("model_url", "is", null)
    .not("model_format", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error("[personalizar] no se pudo cargar la plantilla:", error.message)
    return null
  }
  return data as TemplateRow | null
}

export default async function PersonalizarPage() {
  const template = await getTemplate()
  const config = template ? normalizeTemplateConfig(template) : null
  return (
    <div className="min-h-screen bg-background px-4 pb-8 pt-20 md:px-8">
      <Suspense fallback={null}>
        <PersonalizarTopBar />
      </Suspense>
      <main className="mx-auto max-w-7xl">
        {template && config ? (
          <ThreeDDesignerClient template={template} config={config} />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-card p-12 text-center">
            <h1 className="font-display text-3xl font-extrabold">Configurador 3D próximamente</h1>
            <p className="text-muted-foreground mt-3">
              El equipo está preparando modelos 3D para que diseñes tu indumentaria.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
