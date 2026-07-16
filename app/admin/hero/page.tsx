import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { HeroSlideRow } from "@/lib/supabase/types"
import { SlideNewForm } from "./slide-new-form"

export default async function AdminHeroPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("hero_slides")
    .select("id, kind, url, poster_url, heading, subheading, display_order, active, cta_label, cta_href")
    .order("display_order", { ascending: true })
  const slides = (data ?? []) as Pick<
    HeroSlideRow,
    "id" | "kind" | "url" | "poster_url" | "heading" | "subheading" | "display_order" | "active" | "cta_label" | "cta_href"
  >[]

  const nextOrder = slides.length === 0 ? 1 : Math.max(...slides.map((s) => Number(s.display_order))) + 10

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin" className="text-sm text-white/60">← Panel</Link>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Hero público</p>
        <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">Carrusel del Hero</h1>
        <p className="mt-1 text-sm text-white/60">
          Las imágenes o videos que se muestran en la portada. Si no hay slides activos, el sitio usa el gradiente por defecto.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="font-sans text-lg font-bold">Crear nuevo slide</h2>
        <SlideNewForm nextOrder={nextOrder} />
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-lg font-bold">Existentes</h2>
        {slides.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">No hay slides todavía.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {slides.map((slide) => (
              <li
                key={slide.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#101012]"
              >
                <div className="relative aspect-video w-full bg-black">
                  {slide.kind === "video" ? (
                    <video
                      src={slide.url}
                      poster={slide.poster_url ?? undefined}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.url} alt="" className="h-full w-full object-cover" />
                  )}
                  <span
                    className={
                      "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold " +
                      (slide.active
                        ? "bg-emerald-500/80 text-black"
                        : "bg-black/70 text-white/70")
                    }
                  >
                    {slide.active ? "Activo" : "Oculto"}
                  </span>
                  <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                    {slide.kind}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-sans text-sm font-bold">{slide.heading || "(sin título)"}</p>
                  <p className="mt-0.5 text-xs text-white/50">Orden {slide.display_order}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/hero/${slide.id}`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}