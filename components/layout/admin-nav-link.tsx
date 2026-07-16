"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/supabase/types"

export function AdminNavLink() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true
    async function loadRole() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
      if (error) {
        console.error("No se pudo consultar el rol de administrador:", error.message)
        return
      }
      const role = (profile as { role?: UserRole } | null)?.role
      if (active) setIsAdmin(role === "admin" || role === "superadmin")
    }
    void loadRole()
    return () => { active = false }
  }, [])

  if (!isAdmin) return null
  return <a href="/admin" className="text-brand-red inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-brand-red/10">Panel admin</a>
}
