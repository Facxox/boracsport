import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { listDesignsForUser } from "@/lib/supabase/queries/designs"
import { formatDateUY } from "@/lib/format"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DisenosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const designs = await listDesignsForUser(user.id)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <Link
        href="/cuenta"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a mi cuenta
      </Link>
      <h1 className="font-display mt-4 text-3xl font-extrabold md:text-4xl">
        Mis diseños guardados
      </h1>
      {designs.length === 0 ? (
        <p className="text-muted-foreground mt-3 text-sm">
          Todavía no guardaste ningún diseño. Probá el{" "}
          <Link href="/personalizar" className="text-brand-red font-semibold">
            configurador 3D
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {designs.map((d) => (
            <li
              key={d.id as string}
              className="bg-card rounded-xl border border-white/5 p-4"
            >
              <p className="font-mono text-xs text-muted-foreground">
                #{String(d.id).slice(0, 8)}
              </p>
              <p className="text-sm">
                {formatDateUY(d.created_at as string)}
              </p>
              <Link
                href={`/personalizar?design=${d.id as string}`}
                className="text-brand-red mt-3 inline-block text-sm font-semibold"
              >
                Volver al editor →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
