import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { listDesignsForUser } from "@/lib/supabase/queries/designs"
import type { DesignState } from "@/lib/designer/types"
import { DesignsList } from "./designs-list"

export const dynamic = "force-dynamic"

function isDesignState(value: unknown): value is DesignState {
  if (!value || typeof value !== "object") return false
  const state = value as Partial<DesignState>
  return (
    state.version === 1 &&
    typeof state.mold === "string" &&
    typeof state.kit === "string" &&
    !!state.zones &&
    typeof state.zones === "object" &&
    !!state.pattern &&
    typeof state.pattern === "object"
  )
}

export default async function DisenosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const rows = await listDesignsForUser(user.id)
  const designs = rows.flatMap((row) => {
    if (!isDesignState(row.payload)) return []
    return [{ id: row.id, payload: row.payload, createdAt: row.created_at, updatedAt: row.updated_at }]
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/cuenta" className="text-muted-foreground text-sm">
            ← Mi cuenta
          </Link>
          <h1 className="font-display mt-2 text-3xl font-extrabold md:text-4xl">Mis diseños</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Los uniformes que guardaste con tu cuenta. Abrí cualquiera para seguir editándolo.
          </p>
        </div>
        <Link
          href="/personalizar"
          className="bg-brand-red text-black inline-flex h-10 items-center rounded-md px-4 text-sm font-bold hover:bg-[#ef4444]"
        >
          Nuevo diseño
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="bg-card rounded-2xl border border-white/5 p-10 text-center">
          <p className="font-display text-xl font-extrabold">Todavía no guardaste diseños</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Diseñá tu uniforme y elegí “Guardar en mi cuenta” desde el modal de exportación.
          </p>
          <Link
            href="/personalizar"
            className="bg-brand-red text-black mt-5 inline-flex h-10 items-center rounded-md px-5 text-sm font-bold hover:bg-[#ef4444]"
          >
            Ir al diseñador
          </Link>
        </div>
      ) : (
        <DesignsList designs={designs} />
      )}
    </div>
  )
}