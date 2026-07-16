import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { CategoryRow } from "@/lib/supabase/types"
import { CategoryNewForm } from "./category-new-form"
import { CategoryList } from "./category-list"

export default async function AdminCategoriasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("id, slug, label, emoji, description, display_order, active")
    .order("display_order", { ascending: true })
  const categories = (data ?? []) as Pick<
    CategoryRow,
    "id" | "slug" | "label" | "emoji" | "description" | "display_order" | "active"
  >[]

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin" className="text-sm text-white/60">← Panel</Link>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#ff5a00]">Taxonomía</p>
          <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">Categorías</h1>
          <p className="mt-1 text-sm text-white/60">
            Estas categorías se muestran en el filtro del catálogo y en el paso de intereses del registro.
            Usá las flechas para reordenarlas.
          </p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-sans text-lg font-bold">Crear nueva</h2>
        <CategoryNewForm />
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-lg font-bold">Existentes</h2>
        <CategoryList initial={categories} />
      </section>
    </main>
  )
}