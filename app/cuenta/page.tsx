import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { getActiveCategories } from "@/lib/supabase/queries/categories"
import { createClient } from "@/lib/supabase/server"
import { signOutAction } from "./actions"
import { Button, ButtonLink } from "@/components/ui/button"
import { InterestsEditor } from "./interests-editor"

export const dynamic = "force-dynamic"

export default async function CuentaPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const categories = await getActiveCategories()
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, intereses")
    .eq("id", user.id)
    .maybeSingle()
  const profileData = profile as {
    role?: string
    full_name?: string
    intereses?: unknown
  } | null
  const intereses: string[] = Array.isArray(profileData?.intereses)
    ? profileData.intereses.filter((slug): slug is string => typeof slug === "string")
    : []
  const role = profileData?.role
  const canAccessAdmin = role === "admin" || role === "superadmin"

  const labelsBySlug = new Map(categories.map((c) => [c.slug, c]))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">
            Hola, {profileData?.full_name || user.email}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {canAccessAdmin && (
            <ButtonLink
              href="/admin"
              variant="outline"
              className="border-brand-red/40 text-brand-red hover:bg-brand-red/10"
            >
              Panel de administración
            </ButtonLink>
          )}
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>

      <section className="bg-card rounded-2xl border border-white/5 p-6">
        <h2 className="font-display text-lg font-extrabold">Tus intereses</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Elegí las categorías que te interesan para personalizar tu experiencia.
        </p>
        <InterestsEditor
          categories={categories.map((c) => ({
            id: c.id,
            slug: c.slug,
            label: c.label,
            emoji: c.emoji,
            description: c.description,
          }))}
          initialSelected={intereses.filter((s) => labelsBySlug.has(s))}
        />
      </section>

      <section className="bg-card mt-6 rounded-2xl border border-white/5 p-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-lg font-extrabold">Mis pedidos</h2>
          <Link href="/cuenta/pedidos" className="text-brand-red text-sm font-semibold">
            Ver historial
          </Link>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Revisá el estado y los detalles de los pedidos que hiciste con tu cuenta.
        </p>
        <ButtonLink href="/cuenta/pedidos" variant="outline" className="mt-4">
          Ir a mis pedidos
        </ButtonLink>
      </section>

      <section className="bg-card mt-6 rounded-2xl border border-white/5 p-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-lg font-extrabold">Mis diseños</h2>
          <Link href="/cuenta/disenos" className="text-brand-red text-sm font-semibold">
            Ver todos
          </Link>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Uniformes que guardaste con tu cuenta. Abrí cualquiera para seguir editándolo en el
          diseñador.
        </p>
        <ButtonLink href="/cuenta/disenos" variant="outline" className="mt-4">
          Ir a mis diseños
        </ButtonLink>
      </section>
    </div>
  )
}