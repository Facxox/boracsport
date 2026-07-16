"use server"

import { redirect } from "next/navigation"
import { signOut } from "@/lib/supabase/queries/auth"

export async function signOutAction() {
  await signOut()
  redirect("/")
}
