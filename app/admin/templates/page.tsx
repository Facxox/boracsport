import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { TemplateRow } from "@/lib/supabase/types"
import { TemplateRowActions } from "./template-row"

export default async function AdminTemplatesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("templates")
    .select(
      "id, name, mockup_url_front, mockup_url_back, mockup_url_neck, mockup_url_collar, mockup_url_sleeves, mockup_url_cuffs, mockup_url_short, mockup_url_short_back, mockup_url_socks, mockup_url_socks_back, price, version, active, updated_at",
    )
    .order("updated_at", { ascending: false })
  const templates = (data ?? []) as Array<
    Pick<
      TemplateRow,
      | "id"
      | "name"
      | "mockup_url_front"
      | "mockup_url_back"
      | "mockup_url_neck"
      | "mockup_url_collar"
      | "mockup_url_sleeves"
      | "mockup_url_cuffs"
      | "mockup_url_short"
      | "mockup_url_short_back"
      | "mockup_url_socks"
      | "mockup_url_socks_back"
      | "price"
      | "version"
      | "active"
      | "updated_at"
    >
  >

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin" className="text-sm text-white/60">← Panel</Link>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Diseñador 2D</p>
          <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">Siluetas</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/60">
            Plantillas del configurador. Activá al menos una para que el diseñador funcione en
            <span className="text-white/85"> /personalizar</span>.
          </p>
        </div>
        <Link
          href="/admin/templates/nuevo"
          className="inline-flex h-10 items-center rounded-lg bg-[#dc2626] px-4 text-sm font-semibold text-black hover:bg-[#dc2626]/90"
        >
          Nueva silueta
        </Link>
      </div>

      <section className="mt-8">
        {templates.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#101012] p-6 text-sm text-white/50">
            No hay plantillas todavía. Empezá creando una silueta nueva.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <TemplateRowActions key={template.id} template={template} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}