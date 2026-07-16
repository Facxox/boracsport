import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { CategoryRow } from "@/lib/supabase/types"
import { CategoryForm } from "../category-form"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from("categories").select("*").eq("id", id).maybeSingle()
  const category = data as CategoryRow | null
  if (!category) notFound()

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/categorias" className="text-sm text-white/60">← Categorías</Link>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Editar</p>
        <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">
          {category.emoji} {category.label}
        </h1>
        <p className="mt-1 text-sm text-white/50">/{category.slug}</p>
      </div>

      <CategoryForm
        id={category.id}
        initial={{
          slug: category.slug,
          label: category.label,
          emoji: category.emoji,
          description: category.description,
          display_order: Number(category.display_order),
          active: Boolean(category.active),
          kind: category.kind,
        }}
      />
    </main>
  )
}