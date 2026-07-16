import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { TemplateRow } from "@/lib/supabase/types"
import { TemplateRow as TemplateRowComponent } from "./template-row"

export default async function AdminTemplatesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("templates")
    .select("id, name, active, price, model_format, editable_zones")
    .order("created_at", { ascending: false })
  const templates = (data ?? []) as Array<
    Pick<TemplateRow, "id" | "name" | "price" | "active" | "model_format" | "editable_zones">
  >

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <Link href="/admin" className="text-sm text-white/60">← Panel</Link>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Configurador</p>
          <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">Plantillas 3D</h1>
          <p className="mt-1 text-sm text-white/60">
            Subí mockups y modelos GLB/GLTF para que los clientes personalicen.
          </p>
        </div>
        <Link
          href="/admin/templates/nuevo"
          className="rounded-xl bg-[#dc2626] px-4 py-2 text-sm font-bold text-black"
        >
          + Nueva plantilla 3D
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/50">
          Todavía no hay plantillas.{" "}
          <Link href="/admin/templates/nuevo" className="text-[#dc2626] underline">
            Crear la primera
          </Link>
          .
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <TemplateRowComponent
              key={template.id}
              id={template.id}
              name={template.name}
              active={Boolean(template.active)}
              price={Number(template.price)}
              modelFormat={template.model_format ?? null}
              zoneCount={Array.isArray(template.editable_zones) ? template.editable_zones.length : 0}
            />
          ))}
        </div>
      )}
    </main>
  )
}