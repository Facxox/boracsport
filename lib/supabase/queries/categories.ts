import "server-only"
import { createClient } from "../server"
import type { CategoryRow } from "../types"

export async function getActiveCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, label, emoji, description, display_order, active, created_at, updated_at")
      .eq("active", true)
      .order("display_order", { ascending: true })
    if (error) {
      console.warn("[getActiveCategories] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as CategoryRow[]
  } catch (err) {
    console.warn("[getActiveCategories] exception:", err)
    return []
  }
}

export async function listAllCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, label, emoji, description, display_order, active, created_at, updated_at")
      .order("display_order", { ascending: true })
    if (error) {
      console.warn("[listAllCategories] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as CategoryRow[]
  } catch (err) {
    console.warn("[listAllCategories] exception:", err)
    return []
  }
}