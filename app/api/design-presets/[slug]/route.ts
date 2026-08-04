import { NextResponse } from "next/server"
import { getDesignPresetBySlug } from "@/lib/supabase/queries/design-presets"

// Endpoint público (anon o authenticated): devuelve el preset por slug.
// RLS ya filtra por active=true.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  if (!slug || slug.length > 80) {
    return NextResponse.json({ error: "Slug inválido" }, { status: 400 })
  }
  try {
    const preset = await getDesignPresetBySlug(slug)
    if (!preset) {
      return NextResponse.json({ error: "Preset no encontrado" }, { status: 404 })
    }
    return NextResponse.json(preset)
  } catch (err) {
    console.warn("[api/design-presets] error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}