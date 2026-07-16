// Cliente Supabase para Server Components / Route Handlers / Server Actions.
// Schema forzado a 'boracsport'.
// Usa los cookies async de Next 16.

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "./types"

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sin keys reales, devolvemos un cliente "stub" que todas las queries
  // devuelven vacío. Esto evita que la app crashee mientras se configuran.
  if (!url || !key || url.includes("REPLACE") || key.includes("REPLACE")) {
    return createStubServerClient()
  }

  return createServerClient<Database>(url, key, {
    db: { schema: "boracsport" },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Llamado desde un Server Component — ignorar (los cookies solo
          // se pueden setear desde Server Actions o Route Handlers).
        }
      },
    },
  })
}

type StubResponse<T> = { data: T; error: null }

function createStubServerClient() {
  const ok = <T,>(value: T): StubResponse<T> => ({ data: value, error: null })
  const emptyAuth = {
    getUser: async () => ok({ user: null }),
    signUp: async () => ok({ user: null, session: null }),
    signInWithPassword: async () => ok({ user: null, session: null }),
    signOut: async () => ok({}),
    updateUser: async () => ok({ user: null }),
    exchangeCodeForSession: async () => ok({ session: null, user: null }),
  }
  const emptyQuery = {
    select: () => emptyQuery,
    insert: () => emptyQuery,
    update: () => emptyQuery,
    eq: () => emptyQuery,
    neq: () => emptyQuery,
    ilike: () => emptyQuery,
    in: () => emptyQuery,
    order: () => emptyQuery,
    range: () => emptyQuery,
    limit: () => emptyQuery,
    maybeSingle: async () => ok(null),
    then: undefined as never,
  }
  // Make the query builder thenable so `await` works.
  ;(emptyQuery as unknown as { then: unknown }).then = (resolve: (v: StubResponse<unknown[]>) => void) =>
    resolve(ok([]))
  return {
    auth: emptyAuth,
    from: () => emptyQuery,
  } as never
}
