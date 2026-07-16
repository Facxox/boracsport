// Helpers de auth de Supabase.
// IMPORTANTE: signUp inyecta `site: 'boracsport'` y `intereses` en user_metadata
// para activar las recomendaciones personalizadas.

import "server-only"
import { createClient } from "../server"
import type { InterestSlug } from "@/types/interest"

export type SignUpParams = {
  email: string
  password: string
  fullName: string
  intereses: InterestSlug[]
}

export async function signUp({
  email,
  password,
  fullName,
  intereses,
}: SignUpParams) {
  const supabase = await createClient()
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        site: "boracsport",
        intereses,
      },
    },
  })
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const supabase = await createClient()
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  const supabase = await createClient()
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export async function updateIntereses(intereses: InterestSlug[]) {
  const supabase = await createClient()
  return supabase.auth.updateUser({ data: { intereses } })
}
