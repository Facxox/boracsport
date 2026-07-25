import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { TemplateRow } from "@/lib/supabase/types"
import { TemplateForm } from "./template-form"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from("templates").select("*").eq("id", id).maybeSingle()
  const template = data as TemplateRow | null
  if (!template) notFound()

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/templates" className="text-sm text-white/60">← Siluetas</Link>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Editar silueta</p>
        <h1 className="mt-2 font-sans text-3xl font-extrabold tracking-tight">{template.name}</h1>
        <p className="mt-1 text-sm text-white/50">
          v{template.version} · {template.active ? "Activa" : "Oculta"}
        </p>
      </div>
      <div className="mt-8">
        <TemplateForm template={template} />
      </div>
    </main>
  )
}