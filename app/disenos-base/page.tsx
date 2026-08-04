import Link from "next/link"
import Image from "next/image"
import {
  listActiveDesignPresets,
  getDesignPresetVariantsLookup,
} from "@/lib/supabase/queries/design-presets"
import { safeImageUrl } from "@/lib/safe-image"

export const dynamic = "force-dynamic"

function formatUYU(value: number) {
  return `$U ${Math.round(value).toLocaleString("es-UY")}`
}

export default async function DisenosBasePage() {
  const presets = await listActiveDesignPresets()
  const lookup = await getDesignPresetVariantsLookup(presets.map((p) => p.id))
  const variantsByPreset = lookup.variantsByPreset

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">
          Diseños base
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Empezá con una composición pre-armada por Borac Sport y personalizala
          a tu medida. Podés cambiar colores, agregar logos, editar textos y
          elegir talle antes de pedir tu cotización o guardar tu diseño.
        </p>
      </header>

      {presets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-12 text-center">
          <p className="text-muted-foreground">
            Todavía no hay diseños base publicados. Coordiná tu diseño por
            WhatsApp mientras tanto.
          </p>
          <Link
            href="/productos"
            className="bg-brand-red text-foreground hover:bg-[#ef4444] mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => {
            const variants = variantsByPreset.get(preset.id) ?? []
            const totalStock = variants.reduce((acc, v) => acc + v.stock, 0)
            const sizes = Array.from(new Set(variants.map((v) => v.size))).sort()
            return (
              <article
                key={preset.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#101012]"
              >
                <Link href={`/personalizar?preset=${preset.slug}`} className="group block">
                  <div className="relative aspect-square w-full overflow-hidden bg-white/5">
                    {preset.preview_url ? (
                      <Image
                        src={safeImageUrl(preset.preview_url) ?? preset.preview_url}
                        alt={preset.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                        sin preview
                      </div>
                    )}
                  </div>
                </Link>
                <div className="space-y-2 p-4">
                  <header>
                    <Link
                      href={`/personalizar?preset=${preset.slug}`}
                      className="font-display text-lg font-extrabold leading-tight hover:text-[#dc2626]"
                    >
                      {preset.name}
                    </Link>
                  </header>
                  {preset.description ? (
                    <p className="text-muted-foreground line-clamp-3 text-xs">
                      {preset.description}
                    </p>
                  ) : null}
                  <dl className="flex items-center justify-between pt-1 text-xs">
                    <div>
                      <dt className="text-muted-foreground text-[10px] uppercase tracking-wider">
                        Desde
                      </dt>
                      <dd className="text-foreground/85 font-semibold">
                        {formatUYU(preset.price)}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-muted-foreground text-[10px] uppercase tracking-wider">
                        Talles
                      </dt>
                      <dd className="text-white/70">
                        {sizes.length > 0 ? sizes.join(" · ") : "—"}
                      </dd>
                    </div>
                  </dl>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-white/45">
                      {totalStock > 0
                        ? `${totalStock} u. disponibles`
                        : "Sin stock"}
                    </span>
                    <Link
                      href={`/personalizar?preset=${preset.slug}`}
                      className="bg-brand-red text-foreground hover:bg-[#ef4444] rounded-lg px-3 py-1.5 text-xs font-bold"
                    >
                      Personalizar →
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}