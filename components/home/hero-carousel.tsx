"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"
import type { HeroSlideRow } from "@/lib/supabase/types"

const AUTOPLAY_MS = 6000

export function HeroCarousel({ slides }: { slides: HeroSlideRow[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(
    () => setIndex((i) => (i + 1) % slides.length),
    [slides.length],
  )

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const t = setTimeout(next, AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [paused, index, next, slides.length])

  if (slides.length === 0) return null
  const slide = slides[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Hero del sitio"
      className="relative isolate overflow-hidden border-b border-white/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== index}
          className={
            "absolute inset-0 -z-10 transition-opacity duration-700 " +
            (i === index ? "opacity-100" : "opacity-0")
          }
        >
          {s.kind === "video" ? (
            <video
              src={s.url}
              poster={s.poster_url ?? undefined}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.url} alt="" className="h-full w-full object-cover" />
          )}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,5,5,0.65) 0%, rgba(5,5,5,0.45) 40%, rgba(5,5,5,0.9) 100%)",
            }}
          />
        </div>
      ))}

      <div className="mx-auto max-w-7xl px-4 py-20 md:py-32">
        <div className="max-w-3xl" key={slide.id}>
          <span className="border-brand-red/30 bg-brand-red/10 text-brand-red inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="h-3 w-3" />
            Configurador express
          </span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            {slide.heading || (
              <>
                Diseñá tu equipo <span className="text-brand-red">a tu medida</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-balance text-white/85 md:text-lg">
            {slide.subheading ||
              "Indumentaria deportiva, uniformes corporativos, impresión DTF y merchandising personalizado. Una experiencia premium desde el primer boceto."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href={slide.cta_href}
              size="lg"
              className="bg-brand-red text-foreground hover:bg-[#ef4444] glow-red w-full text-base font-bold sm:w-auto"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {slide.cta_label || "Diseñá tu equipo"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/productos"
              variant="outline"
              size="lg"
              className="w-full text-base sm:w-auto"
            >
              Ver catálogo
            </ButtonLink>
          </div>
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Ir al slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={
                "h-2 rounded-full transition-all " +
                (i === index ? "w-8 bg-brand-red" : "w-2 bg-white/40 hover:bg-white/70")
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}