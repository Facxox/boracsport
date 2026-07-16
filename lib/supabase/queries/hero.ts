import "server-only"
import { createClient } from "../server"
import type { HeroSlideRow } from "../types"

export async function getActiveSlides(): Promise<HeroSlideRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("hero_slides")
      .select("id, kind, url, poster_url, heading, subheading, cta_label, cta_href, display_order, active, created_at, updated_at")
      .eq("active", true)
      .order("display_order", { ascending: true })
    if (error) {
      console.warn("[getActiveSlides] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as HeroSlideRow[]
  } catch (err) {
    console.warn("[getActiveSlides] exception:", err)
    return []
  }
}