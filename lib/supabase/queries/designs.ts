import "server-only"

import type { DesignState } from "@/lib/designer/types"
import { createClient } from "@/lib/supabase/server"
import type { DesignRow, Json } from "@/lib/supabase/types"

const DESIGN_COLUMNS = "id, user_id, payload, created_at, updated_at" as const

export async function saveDesignForUser(
  userId: string,
  payload: DesignState,
): Promise<DesignRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("designs")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert([{ user_id: userId, payload: payload as unknown as Json }] as any)
    .select(DESIGN_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return data as DesignRow
}

export async function listDesignsForUser(userId: string): Promise<DesignRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("designs")
    .select(DESIGN_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as DesignRow[]
}

export async function getDesignForUser(
  designId: string,
  userId: string,
): Promise<DesignRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("designs")
    .select(DESIGN_COLUMNS)
    .eq("id", designId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data ?? null) as DesignRow | null
}

export async function deleteDesignForUser(
  designId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("designs")
    .delete()
    .eq("id", designId)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
}
