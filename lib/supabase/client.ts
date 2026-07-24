// Cliente Supabase para el browser.
// Schema forzado a 'boracsport' para que TODAS las queries usen ese namespace.

"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes("REPLACE") || key.includes("REPLACE")) {
    return createStubBrowserClient() as never
  }

  return createBrowserClient<Database>(url, key, {
    db: { schema: "boracsport" },
  })
}

function createStubBrowserClient() {
  const ok = <T,>(value: T) => ({ data: value, error: null })
  const emptyAuth = {
    getUser: async () => ok({ user: null }),
    signUp: async () => ok({ user: null, session: null }),
    signInWithPassword: async () => ok({ user: null, session: null }),
    signOut: async () => ok({}),
    updateUser: async () => ok({ user: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  }
  const emptyQuery = {
    select: () => emptyQuery,
    insert: () => emptyQuery,
    update: () => emptyQuery,
    eq: () => emptyQuery,
    not: () => emptyQuery,
    is: () => emptyQuery,
    order: () => emptyQuery,
    range: () => emptyQuery,
    limit: () => emptyQuery,
    maybeSingle: async () => ok(null),
  }
  ;(emptyQuery as unknown as { then: unknown }).then = (resolve: (v: unknown) => void) =>
    resolve(ok([]))
  return { auth: emptyAuth, from: () => emptyQuery } as never
}
