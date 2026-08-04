import Link from "next/link"
import { notFound } from "next/navigation"
import { listAllTemplates } from "@/lib/supabase/queries/templates"
import { getDesignPresetByIdAdmin, getDesignPresetVariants } from "@/lib/supabase/queries/design-presets"
import { PresetForm } from "../preset-form"

export const dynamic = "force-dynamic"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export default async function EditDesignPresetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const [preset, templates] = await Promise.all([
    getDesignPresetByIdAdmin(id),
    listAllTemplates(),
  ])
  if (!preset) notFound()

  // Admin ve TODAS las variantes (activas e inactivas) para poder editarlas.
  const variants = await getDesignPresetVariants(id)

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/disenos-base" className="text-sm text-white/60">
        ← Diseños base
      </Link>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">
            Editar preset
          </p>
          <h1 className="mt-2 font-sans text-3xl font-extrabold tracking-tight">
            {preset.name}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/60">
            {preset.active ? "Publicado en /disenos-base" : "Borrador · no visible al cliente"}
          </p>
        </div>
        <Link
          href={`/personalizar?preset=${preset.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium hover:bg-white/10"
        >
          Previsualizar →
        </Link>
      </div>

      <div className="mt-8">
        <PresetForm
          preset={preset}
          variants={variants}
          templates={templates.map((t) => ({ id: t.id, name: t.name, active: t.active }))}
        />
      </div>
    </main>
  )
}