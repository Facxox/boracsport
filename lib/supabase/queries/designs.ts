import "server-only"
import { createClient } from "../server"
import type { DesignRow, Json } from "../types"

export async function saveDesignForUser(userId: string, designId: string, payload: Json): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("designs").insert({ id: designId, user_id: userId, payload } as never)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" }
  }
}

export async function listDesignsForUser(userId: string): Promise<Array<Pick<DesignRow, "id" | "payload" | "created_at">>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("designs").select("id, payload, created_at").eq("user_id", userId).order("created_at", { ascending: false })
    if (error) return []
    return (data ?? []) as Array<Pick<DesignRow, "id" | "payload" | "created_at">>
  } catch {
    return []
  }
}
