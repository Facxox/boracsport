import Link from "next/link"
import { listAllTemplates } from "@/lib/supabase/queries/templates"
import { PresetForm } from "../preset-form"

export const dynamic = "force-dynamic"

export default async function NewDesignPresetPage() {
  const templates = await listAllTemplates()

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/disenos-base" className="text-sm text-white/60">
        ← Diseños base
      </Link>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">
          Nuevo preset
        </p>
        <h1 className="mt-2 font-sans text-3xl font-extrabold tracking-tight">
          Crear diseño base
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-white/60">
          Definí los datos comerciales y las variantes con stock. La
          composición visual (colores, logos, textos) la armás abriendo el
          preset en el diseñador después de crearlo.
        </p>
      </div>

      <div className="mt-8">
        <PresetForm
          templates={templates.map((t) => ({ id: t.id, name: t.name, active: t.active }))}
        />
      </div>
    </main>
  )
}