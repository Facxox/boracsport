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

// Mensaje de error explícito cuando el cliente se construye sin credenciales
// válidas. Lo centralizamos para que sea fácil de identificar en logs/tests.
const STUB_CONFIG_ERROR =
  "Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY (o contienen REPLACE)."

function createStubBrowserClient() {
  // Estructura de respuesta "error-first": nunca devolvemos un signUp o un
  // resend exitoso cuando el cliente es stub. Eso evita que flows de auth
  // crean que la operación pasó cuando en realidad nunca se llamó al backend.
  const fail = () => Promise.resolve({ data: null, error: { message: STUB_CONFIG_ERROR } })
  const emptyAuth = {
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: () => fail(),
    signInWithPassword: () => fail(),
    signInWithOAuth: () => fail(),
    signOut: async () => ({ error: null }),
    resend: () => fail(),
    resetPasswordForEmail: () => fail(),
    exchangeCodeForSession: () => fail(),
    updateUser: () => fail(),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  }
  const emptyQuery = {
    select: () => emptyQuery,
    insert: () => emptyQuery,
    update: () => emptyQuery,
    eq: () => emptyQuery,
    neq: () => emptyQuery,
    not: () => emptyQuery,
    is: () => emptyQuery,
    in: () => emptyQuery,
    order: () => emptyQuery,
    range: () => emptyQuery,
    limit: () => emptyQuery,
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  }
  // Mantenemos `then` para que `await query` siga funcionando, devolviendo
  // un resultado vacío consistente con la API de PostgrestQueryBuilder.
  ;(emptyQuery as unknown as { then: unknown }).then = (resolve: (v: { data: unknown[]; error: null }) => void) =>
    resolve({ data: [], error: null })
  return { auth: emptyAuth, from: () => emptyQuery } as never
}
