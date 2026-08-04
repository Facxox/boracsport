import Link from "next/link"
import { listAllDesignPresets } from "@/lib/supabase/queries/design-presets"
import { PresetRowActions } from "./preset-row"

export const dynamic = "force-dynamic"

export default async function AdminDesignPresetsPage() {
  const presets = await listAllDesignPresets()

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin" className="text-sm text-white/60">← Panel</Link>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Diseños base</p>
          <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">
            Diseños base
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/60">
            Composiciones pre-armadas que el cliente final puede abrir desde{" "}
            <span className="text-white/85">/disenos-base</span> y customizar encima.
            Cada preset tiene su propio stock por variante.
          </p>
        </div>
        <Link
          href="/admin/disenos-base/nuevo"
          className="inline-flex h-10 items-center rounded-lg bg-[#dc2626] px-4 text-sm font-semibold text-black hover:bg-[#dc2626]/90"
        >
          Nuevo preset
        </Link>
      </div>

      <section className="mt-8">
        {presets.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#101012] p-6 text-sm text-white/50">
            Todavía no hay presets. Empezá creando uno: elegí una silueta,
            subí un preview y armá la composición en el diseñador.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {presets.map((preset) => (
              <PresetRowActions
                key={preset.id}
                preset={preset}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}