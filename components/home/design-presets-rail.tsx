import Link from "next/link"
import Image from "next/image"
import {
  listActiveDesignPresets,
  getDesignPresetVariantsLookup,
} from "@/lib/supabase/queries/design-presets"
import { safeImageUrl } from "@/lib/safe-image"

function formatUYU(value: number) {
  return `$U ${Math.round(value).toLocaleString("es-UY")}`
}

export async function DesignPresetsRail() {
  const presets = await listActiveDesignPresets()
  if (presets.length === 0) return null

  const lookup = await getDesignPresetVariantsLookup(presets.map((p) => p.id))
  const variantsByPreset = lookup.variantsByPreset

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">
            <span className="mr-2">🎨</span>Diseños base
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Empezá con una composición pre-armada y personalizala a tu medida.
          </p>
        </div>
        <Link
          href="/disenos-base"
          className="text-foreground/85 hover:text-foreground text-xs font-semibold underline-offset-4 hover:underline"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {presets.slice(0, 4).map((preset) => {
          const variants = variantsByPreset.get(preset.id) ?? []
          const totalStock = variants.reduce((acc, v) => acc + v.stock, 0)
          return (
            <Link
              key={preset.id}
              href={`/disenos-base/${preset.slug}`}
              className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#101012] transition-colors hover:border-[#dc2626]/40"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-white/5">
                {preset.preview_url ? (
                  <Image
                    src={safeImageUrl(preset.preview_url) ?? preset.preview_url}
                    alt={preset.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                    sin preview
                  </div>
                )}
              </div>
              <div className="space-y-1 p-3">
                <p className="font-display text-sm font-bold leading-tight">
                  {preset.name}
                </p>
                {preset.description ? (
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {preset.description}
                  </p>
                ) : null}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-foreground/85 font-semibold">
                    {formatUYU(preset.price)}
                  </span>
                  <span className="text-white/45">
                    {totalStock > 0 ? `${totalStock} u.` : "Sin stock"}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}