import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/supabase/types"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect("/login?next=/admin")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
  const role = (profile as { role?: UserRole } | null)?.role
  if (role !== "admin" && role !== "superadmin") redirect("/")
  return <div className="min-h-screen bg-[#050505] text-white">{children}</div>
}
