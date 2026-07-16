import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { HeroSlideRow } from "@/lib/supabase/types"
import { SlideEditor } from "../slide-editor"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export default async function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from("hero_slides").select("*").eq("id", id).maybeSingle()
  const slide = data as HeroSlideRow | null
  if (!slide) notFound()

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/hero" className="text-sm text-white/60">← Hero</Link>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Editar slide</p>
        <h1 className="mt-2 font-sans text-3xl font-extrabold tracking-tight">{slide.heading || "(sin título)"}</h1>
        <p className="mt-1 text-sm text-white/50">Orden {slide.display_order} · {slide.kind}</p>
      </div>

      <SlideEditor
        id={slide.id}
        initial={{
          kind: slide.kind,
          url: slide.url,
          poster_url: slide.poster_url,
          heading: slide.heading,
          subheading: slide.subheading,
          cta_label: slide.cta_label,
          cta_href: slide.cta_href,
          display_order: Number(slide.display_order),
          active: Boolean(slide.active),
        }}
      />
    </main>
  )
}