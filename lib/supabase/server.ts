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

  // Sin keys reales, devolvemos un cliente "stub" claramente marcado: las
  // operaciones de auth devuelven error explícito de configuración y las
  // queries devuelven vacío. Esto evita que un signup o un resend parezca
  // exitoso sin haber contactado al backend.
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

const STUB_CONFIG_ERROR =
  "Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY (o contienen REPLACE) en el entorno del servidor."

function createStubServerClient() {
  const ok = <T,>(value: T) => ({ data: value, error: null })
  const fail = () => Promise.resolve({ data: null, error: { message: STUB_CONFIG_ERROR } })
  const emptyAuth = {
    getUser: async () => ok({ user: null }),
    signUp: () => fail(),
    signInWithPassword: () => fail(),
    signInWithOAuth: () => fail(),
    signOut: async () => ({ error: null }),
    updateUser: () => fail(),
    resend: () => fail(),
    resetPasswordForEmail: () => fail(),
    exchangeCodeForSession: () => fail(),
  }
  const emptyQuery = {
    select: () => emptyQuery,
    insert: () => emptyQuery,
    update: () => emptyQuery,
    delete: () => emptyQuery,
    eq: () => emptyQuery,
    neq: () => emptyQuery,
    ilike: () => emptyQuery,
    in: () => emptyQuery,
    not: () => emptyQuery,
    is: () => emptyQuery,
    order: () => emptyQuery,
    range: () => emptyQuery,
    limit: () => emptyQuery,
    maybeSingle: async () => ok(null),
    single: async () => ok(null),
  }
  // Make the query builder thenable so `await` works.
  ;(emptyQuery as unknown as { then: unknown }).then = (resolve: (v: { data: unknown[]; error: null }) => void) =>
    resolve(ok([]))
  return {
    auth: emptyAuth,
    from: () => emptyQuery,
  } as never
}
