import "server-only"
import { createClient } from "../server"
import type { TemplateRow } from "../types"

// Selector explícito alineado con TemplateRow.
const TEMPLATE_COLUMNS =
  "id, name, mockup_url_front, mockup_url_back, mockup_url_neck, mockup_url_collar, mockup_url_sleeves, mockup_url_cuffs, mockup_url_short, mockup_url_socks, mockup_url_short_back, mockup_url_socks_back, scene_config, editable_zones, default_config, version, price, active, created_at, updated_at" as const

// Devuelve la plantilla activa más reciente (RLS `templates_public_active`
// ya filtra para `anon`). Si no hay ninguna, devolvemos null y el page.tsx
// muestra el CTA de WhatsApp.
export async function getActiveTemplate(): Promise<TemplateRow | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("templates")
      .select(TEMPLATE_COLUMNS)
      .eq("active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) {
      console.warn("[getActiveTemplate] error:", error.message)
      return null
    }
    return (data ?? null) as unknown as TemplateRow | null
  } catch (err) {
    console.warn("[getActiveTemplate] exception:", err)
    return null
  }
}

// Para admin: lista TODAS (no filtramos active).
export async function listAllTemplates(): Promise<TemplateRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("templates")
      .select(TEMPLATE_COLUMNS)
      .order("updated_at", { ascending: false })
    if (error) {
      console.warn("[listAllTemplates] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as TemplateRow[]
  } catch (err) {
    console.warn("[listAllTemplates] exception:", err)
    return []
  }
}

export async function getTemplateById(id: string): Promise<TemplateRow | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("templates")
      .select(TEMPLATE_COLUMNS)
      .eq("id", id)
      .maybeSingle()
    if (error) {
      console.warn("[getTemplateById] error:", error.message)
      return null
    }
    return (data ?? null) as unknown as TemplateRow | null
  } catch (err) {
    console.warn("[getTemplateById] exception:", err)
    return null
  }
}

export async function countActiveTemplates(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("active", true)
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}
