import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { TemplateRow } from "@/lib/supabase/types"
import { TemplateForm } from "../template-form"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

function jsonToString(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, null, 2)
  } catch {
    return "{}"
  }
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
      <Link href="/admin/templates" className="text-sm text-white/60">← Plantillas 3D</Link>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#ff5a00]">Editar</p>
        <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">{template.name}</h1>
        <p className="mt-1 text-sm text-white/50">
          Versión {template.version} · {template.active ? "Publicada" : "Borrador"}
        </p>
      </div>

      <TemplateForm
        id={template.id}
        initial={{
          name: template.name,
          mockup_url_front: template.mockup_url_front,
          mockup_url_back: template.mockup_url_back,
          model_url: template.model_url,
          model_format: template.model_format,
          price: Number(template.price),
          editable_zones: jsonToString(template.editable_zones),
          scene_config: jsonToString(template.scene_config),
          default_config: jsonToString(template.default_config),
          active: Boolean(template.active),
        }}
      />
    </main>
  )
}