import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { ProfileRow } from "@/lib/supabase/types"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }).limit(100)
  const profiles = (data ?? []) as Pick<ProfileRow, "id" | "full_name" | "role" | "created_at">[]
  return <main className="mx-auto max-w-7xl px-5 py-10"><Link href="/admin" className="text-sm text-white/60">← Panel</Link><h1 className="mt-4 font-display text-4xl font-extrabold">Usuarios y roles</h1><p className="mt-2 text-sm text-white/60">La promoción de roles debe ejecutarse mediante una acción server-side validada como superadmin.</p><div className="mt-8 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/5 text-white/60"><tr><th className="p-4">Nombre</th><th className="p-4">Rol</th><th className="p-4">Alta</th></tr></thead><tbody>{profiles.map((profile) => <tr key={profile.id} className="border-t border-white/10"><td className="p-4 font-semibold">{profile.full_name || "Sin nombre"}</td><td className="p-4">{profile.role}</td><td className="p-4 text-white/60">{new Date(profile.created_at).toLocaleDateString("es-UY")}</td></tr>)}</tbody></table></div></main>
}
