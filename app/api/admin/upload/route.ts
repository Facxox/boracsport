// Admin upload route. Validates role server-side, whitelists MIME/extension per
// bucket, and stores files under <prefix>/<uuid>.<ext>.

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/supabase/types"

const ALLOWED_BUCKETS = ["boracsport_products", "boracsport_templates", "boracsport_hero", "boracsport_orders"] as const
type Bucket = (typeof ALLOWED_BUCKETS)[number]

type Kind = "image" | "model" | "media"

const RULES: Record<Bucket, { kinds: Kind[]; mimes: Record<Kind, string[]>; maxBytes: number }> = {
  boracsport_products: {
    kinds: ["image"],
    mimes: { image: ["image/jpeg", "image/png", "image/webp"], model: [], media: [] },
    maxBytes: 8 * 1024 * 1024,
  },
  boracsport_templates: {
    kinds: ["image", "model"],
    mimes: {
      image: ["image/jpeg", "image/png", "image/webp"],
      model: ["model/gltf-binary", "model/gltf+json", "application/octet-stream"],
      media: [],
    },
    maxBytes: 30 * 1024 * 1024,
  },
  boracsport_hero: {
    kinds: ["image", "media"],
    mimes: {
      image: ["image/jpeg", "image/png", "image/webp"],
      model: [],
      media: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"],
    },
    maxBytes: 80 * 1024 * 1024,
  },
  boracsport_orders: {
    kinds: ["image"],
    mimes: { image: ["image/jpeg", "image/png", "image/webp"], model: [], media: [] },
    maxBytes: 8 * 1024 * 1024,
  },
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "model/gltf-binary": "glb",
  "model/gltf+json": "gltf",
}

function extFromName(name: string): string | null {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : null
}

function safePrefix(value: string) {
  return value
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 200)
}

async function assertAdmin() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { error: "No autenticado" as const, status: 401 }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle()
  const role = (profile as { role?: UserRole } | null)?.role
  if (role !== "admin" && role !== "superadmin") {
    return { error: "Sin permisos" as const, status: 403 }
  }
  return { supabase }
}

export async function POST(request: Request) {
  const auth = await assertAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const supabase = auth.supabase

  const form = await request.formData()
  const bucket = String(form.get("bucket") ?? "")
  if (!(ALLOWED_BUCKETS as readonly string[]).includes(bucket)) {
    return NextResponse.json({ error: "Bucket inválido" }, { status: 400 })
  }
  const typedBucket = bucket as Bucket
  const rules = RULES[typedBucket]

  const prefixRaw = String(form.get("prefix") ?? "")
  const prefix = safePrefix(prefixRaw)
  if (!prefix) {
    return NextResponse.json({ error: "Prefix requerido" }, { status: 400 })
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ error: "Sin archivos" }, { status: 400 })
  }

  const urls: string[] = []
  const paths: string[] = []
  for (const file of files) {
    if (file.size > rules.maxBytes) {
      return NextResponse.json(
        { error: `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB > ${rules.maxBytes / 1024 / 1024}MB)` },
        { status: 413 },
      )
    }

    let kind: Kind | null = null
    if (rules.mimes.image.includes(file.type)) kind = "image"
    else if (rules.mimes.model.includes(file.type)) kind = "model"
    else if (rules.mimes.media.includes(file.type)) kind = "media"

    if (!kind) {
      return NextResponse.json(
        { error: `Tipo no permitido: ${file.type || "desconocido"}` },
        { status: 415 },
      )
    }

    let ext = EXT_BY_MIME[file.type]
    if (!ext) {
      const fromName = extFromName(file.name)
      if (!fromName) return NextResponse.json({ error: "Extensión no reconocida" }, { status: 415 })
      ext = fromName
    }

    const id = crypto.randomUUID()
    const path = `${prefix}/${id}.${ext}`

    const { error } = await supabase.storage
      .from(typedBucket)
      .upload(path, file, { contentType: file.type, upsert: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from(typedBucket).getPublicUrl(path)
    urls.push(pub.publicUrl)
    paths.push(path)
  }

  return NextResponse.json({ urls, paths })
}