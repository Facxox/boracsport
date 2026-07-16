// Cliente Supabase con service role key — SOLO para uso server-side.
// Bypassa RLS. Úsalo únicamente en Route Handlers que validen ownership
// antes de tocar Storage o tablas que no deberían ser accesibles al cliente.

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key || url.includes("REPLACE") || key.includes("REPLACE")) {
    return null
  }

  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "boracsport" },
  })
}