import { getActiveTemplate } from "@/lib/supabase/queries/templates"
import { DesignerClient } from "@/components/designer/designer-client"

export const metadata = {
  title: "Personalizar",
}

// El componente es client-only por dentro (Canvas + Zustand) pero la página
// sigue siendo server para poder leer la plantilla activa con `anon`.
export default async function PersonalizarPage() {
  const template = await getActiveTemplate()
  return <DesignerClient template={template} />
}
