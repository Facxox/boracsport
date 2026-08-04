// Queries de design_presets.
// Select explícito, no '*'. RLS ya filtra por active=true para anon/authenticated.

import "server-only"
import { createClient } from "../server"
import type { DesignPresetRow, DesignPresetVariantRow } from "../types"

const PRESET_PUBLIC_COLUMNS =
  "id, template_id, name, slug, description, preview_url, payload, price, active, display_order, created_at, updated_at" as const

const VARIANT_PUBLIC_COLUMNS =
  "id, preset_id, size, color, sku, stock, price_override, active, created_at, updated_at" as const

export type DesignPresetWithVariants = DesignPresetRow & {
  variants: DesignPresetVariantRow[]
}

// Lista todos los presets activos (público). RLS ya filtra por active=true.
export async function listActiveDesignPresets(): Promise<DesignPresetRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("design_presets")
      .select(PRESET_PUBLIC_COLUMNS)
      .eq("active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
    if (error) {
      console.warn("[listActiveDesignPresets] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as DesignPresetRow[]
  } catch (err) {
    console.warn("[listActiveDesignPresets] exception:", err)
    return []
  }
}

// Admin: lista todos los presets sin filtrar por active.
export async function listAllDesignPresets(): Promise<DesignPresetRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("design_presets")
      .select(PRESET_PUBLIC_COLUMNS)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
    if (error) {
      console.warn("[listAllDesignPresets] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as DesignPresetRow[]
  } catch (err) {
    console.warn("[listAllDesignPresets] exception:", err)
    return []
  }
}

// Lectura puntual por slug. RLS devuelve null si no existe o no está activo
// para anon/authenticated.
export async function getDesignPresetBySlug(
  slug: string,
): Promise<DesignPresetRow | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("design_presets")
      .select(PRESET_PUBLIC_COLUMNS)
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle()
    if (error) {
      console.warn("[getDesignPresetBySlug] error:", error.message)
      return null
    }
    return (data ?? null) as unknown as DesignPresetRow | null
  } catch (err) {
    console.warn("[getDesignPresetBySlug] exception:", err)
    return null
  }
}

// Admin: variante sin filtrar active (para el editor de presets).
export async function getDesignPresetByIdAdmin(
  id: string,
): Promise<DesignPresetRow | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("design_presets")
      .select(PRESET_PUBLIC_COLUMNS)
      .eq("id", id)
      .maybeSingle()
    if (error) {
      console.warn("[getDesignPresetByIdAdmin] error:", error.message)
      return null
    }
    return (data ?? null) as unknown as DesignPresetRow | null
  } catch (err) {
    console.warn("[getDesignPresetByIdAdmin] exception:", err)
    return null
  }
}

// Devuelve las variantes activas de un preset. RLS ya filtra por active=true
// cuando el preset padre está activo.
export async function getDesignPresetVariants(
  presetId: string,
): Promise<DesignPresetVariantRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("design_preset_variants")
      .select(VARIANT_PUBLIC_COLUMNS)
      .eq("preset_id", presetId)
      .eq("active", true)
      .order("size", { ascending: true })
    if (error) {
      console.warn("[getDesignPresetVariants] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as DesignPresetVariantRow[]
  } catch (err) {
    console.warn("[getDesignPresetVariants] exception:", err)
    return []
  }
}

// Devuelve un mapa { presetId → variants[] } para hidratar grids públicos.
// Tolera fallos: si una query falla, marca `errored` para que el caller
// decida cómo contingenciar (similar a getProductIdsWithVariants).
export async function getDesignPresetVariantsLookup(
  presetIds: string[],
): Promise<{ variantsByPreset: Map<string, DesignPresetVariantRow[]>; errored: boolean }> {
  if (presetIds.length === 0) {
    return { variantsByPreset: new Map(), errored: false }
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("design_preset_variants")
      .select(VARIANT_PUBLIC_COLUMNS)
      .in("preset_id", presetIds)
      .eq("active", true)
    if (error) {
      console.warn("[getDesignPresetVariantsLookup] error:", error.message)
      return { variantsByPreset: new Map(), errored: true }
    }
    const rows = (data ?? []) as unknown as DesignPresetVariantRow[]
    const map = new Map<string, DesignPresetVariantRow[]>()
    for (const row of rows) {
      const arr = map.get(row.preset_id) ?? []
      arr.push(row)
      map.set(row.preset_id, arr)
    }
    return { variantsByPreset: map, errored: false }
  } catch (err) {
    console.warn("[getDesignPresetVariantsLookup] exception:", err)
    return { variantsByPreset: new Map(), errored: true }
  }
}