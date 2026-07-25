"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { DesignState } from "@/lib/designer/types"
import {
  deleteDesignForUser,
  saveDesignForUser,
} from "@/lib/supabase/queries/designs"
import { signOut } from "@/lib/supabase/queries/auth"
import { createClient } from "@/lib/supabase/server"

function isDesignState(value: unknown): value is DesignState {
  if (!value || typeof value !== "object") return false
  const state = value as Partial<DesignState>
  return (
    state.version === 1 &&
    typeof state.mold === "string" &&
    typeof state.kit === "string" &&
    !!state.zones &&
    typeof state.zones === "object" &&
    !!state.pattern &&
    typeof state.pattern === "object"
  )
}

async function authenticatedUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function saveDesignAction(payload: unknown) {
  const userId = await authenticatedUserId()
  if (!userId) return { ok: false as const, reason: "unauthenticated" as const }
  if (!isDesignState(payload)) return { ok: false as const, reason: "invalid" as const }

  await saveDesignForUser(userId, payload)
  revalidatePath("/cuenta/disenos")
  return { ok: true as const }
}

export async function deleteDesignAction(designId: string) {
  const userId = await authenticatedUserId()
  if (!userId) return { ok: false as const, reason: "unauthenticated" as const }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(designId)) {
    return { ok: false as const, reason: "invalid" as const }
  }

  await deleteDesignForUser(designId, userId)
  revalidatePath("/cuenta/disenos")
  return { ok: true as const }
}

export async function signOutAction() {
  await signOut()
  redirect("/")
}
