import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { listDesignsForUser } from "@/lib/supabase/queries/designs"
import { getActiveCategories } from "@/lib/supabase/queries/categories"
import { createClient } from "@/lib/supabase/server"
import { signOutAction } from "./actions"
import { formatDateUY } from "@/lib/format"
import { Button, ButtonLink } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function CuentaPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const meta = user.user_metadata ?? {}
  const raw = meta.intereses
  const intereses: string[] = Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : []
  const designs = await listDesignsForUser(user.id)
  const categories = await getActiveCategories()
  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const role = (profile as { role?: string } | null)?.role
  const canAccessAdmin = role === "admin" || role === "superadmin"

  const labelsBySlug = new Map(categories.map((c) => [c.slug, c]))
  const labelsById = new Map(categories.map((c) => [c.id, c]))

  return <div className="mx-auto max-w-5xl px-4 py-10 md:py-14"><div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-3xl font-extrabold md:text-4xl">Hola, {meta.full_name ?? user.email}</h1><p className="text-muted-foreground mt-1 text-sm">{user.email}</p></div><div className="flex items-center gap-2">{canAccessAdmin && <ButtonLink href="/admin" variant="outline" className="border-brand-red/40 text-brand-red hover:bg-brand-red/10">Panel de administración</ButtonLink>}<form action={signOutAction}><Button type="submit" variant="outline">Cerrar sesión</Button></form></div></div><section className="bg-card rounded-2xl border border-white/5 p-6"><h2 className="font-display text-lg font-extrabold">Tus intereses</h2>{intereses.length === 0 ? <p className="text-muted-foreground mt-2 text-sm">Todavía no elegiste intereses. Podés hacerlo al registrarte.</p> : <div className="mt-3 flex flex-wrap gap-2">{intereses.map((slugOrId) => { const card = labelsBySlug.get(slugOrId) ?? labelsById.get(slugOrId); const emoji = card?.emoji ?? "✨"; const title = card?.label ?? slugOrId; return <span key={slugOrId} className="border-brand-red/30 bg-brand-red/10 text-brand-red rounded-full border px-3 py-1 text-xs font-semibold">{emoji} {title}</span> })}</div>}</section><section className="bg-card mt-6 rounded-2xl border border-white/5 p-6"><div className="flex items-end justify-between"><h2 className="font-display text-lg font-extrabold">Diseños guardados</h2><Link href="/cuenta/disenos" className="text-brand-red text-sm font-semibold">Ver todos</Link></div>{designs.length === 0 ? <p className="text-muted-foreground mt-3 text-sm">Todavía no guardaste ningún diseño desde el configurador 3D.</p> : <ul className="mt-4 space-y-2">{designs.slice(0, 5).map((d) => <li key={d.id} className="bg-muted/30 flex items-center justify-between rounded-lg border border-white/5 p-3"><div><p className="font-mono text-xs">#{String(d.id).slice(0, 8)}</p><p className="text-muted-foreground text-xs">{formatDateUY(d.created_at)}</p></div><Link href={`/personalizar?design=${d.id}`} className="text-brand-red text-sm font-semibold">Volver al editor</Link></li>)}</ul>}</section></div>
}
