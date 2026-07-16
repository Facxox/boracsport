"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CATEGORIES } from "@/lib/constants"
import { createClient } from "@/lib/supabase/server"
import type { Json, UserRole } from "@/lib/supabase/types"

function text(value: FormDataEntryValue | null, max: number) {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, max)
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error("No autenticado")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()
  const role = (profile as { role?: UserRole } | null)?.role
  if (role !== "admin" && role !== "superadmin") throw new Error("Sin permisos")
  return supabase
}

function parseProduct(formData: FormData) {
  const name = text(formData.get("name"), 120)
  const slug = text(formData.get("slug"), 120).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
  const description = text(formData.get("description"), 4000)
  const category = text(formData.get("category"), 60)
  const price = Number(formData.get("price"))
  const stock = Number(formData.get("stock"))
  const tags = text(formData.get("tags"), 500).split(",").map((tag) => tag.trim()).filter(Boolean)
  const images = text(formData.get("images"), 4000)
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean)
  if (!name) throw new Error("Nombre requerido")
  if (!slug) throw new Error("Slug requerido")
  if (!(CATEGORIES as readonly string[]).includes(category)) throw new Error("Categoría inválida")
  if (!Number.isFinite(price) || price < 0) throw new Error("Precio inválido")
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock inválido")
  return {
    name,
    slug,
    description,
    category,
    price,
    stock,
    tags,
    images,
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    on_sale: formData.get("on_sale") === "on",
  }
}

export async function createProductAction(formData: FormData) {
  const supabase = await requireAdmin()
  const data = parseProduct(formData)
  const { data: row, error } = await supabase.from("products").insert([data] as never).select("id").single()
  if (error) throw new Error(error.message)
  revalidatePath("/admin/productos"); revalidatePath("/productos"); revalidatePath("/")
  redirect(`/admin/productos/${(row as { id: string }).id}`)
}

export async function updateProductAction(id: string, formData: FormData) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const data = parseProduct(formData)
  const { error } = await supabase.from("products").update(data as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/productos"); revalidatePath(`/admin/productos/${id}`); revalidatePath("/productos"); revalidatePath("/")
}

export async function deleteProductAction(id: string) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/productos"); revalidatePath("/productos"); revalidatePath("/")
  redirect("/admin/productos")
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("products").update({ active } as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/productos"); revalidatePath("/productos"); revalidatePath("/")
}

export async function toggleProductFeaturedAction(id: string, featured: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("products").update({ featured } as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/productos"); revalidatePath("/")
}

export async function toggleProductOnSaleAction(id: string, onSale: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("products").update({ on_sale: onSale } as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/productos")
  revalidatePath("/")
  revalidatePath("/productos")
}

function parseTemplate(formData: FormData) {
  const name = text(formData.get("name"), 120)
  const modelUrl = text(formData.get("model_url"), 1000)
  const modelFormat = text(formData.get("model_format"), 4) as "glb" | "gltf" | ""
  const mockupFront = text(formData.get("mockup_url_front"), 1000)
  const mockupBack = text(formData.get("mockup_url_back"), 1000)
  const price = Number(formData.get("price"))
  let zones: Json = []
  let sceneConfig: Json = {}
  let defaultConfig: Json = {}
  try { zones = JSON.parse(text(formData.get("editable_zones"), 20_000)) as Json } catch { throw new Error("Zonas inválidas") }
  try { sceneConfig = JSON.parse(text(formData.get("scene_config"), 10_000) || "{}") as Json } catch { throw new Error("scene_config inválido") }
  try { defaultConfig = JSON.parse(text(formData.get("default_config"), 10_000) || "{}") as Json } catch { throw new Error("default_config inválido") }
  if (!name) throw new Error("Nombre requerido")
  if (!mockupFront) throw new Error("Mockup frontal requerido")
  if (!mockupBack) throw new Error("Mockup trasero requerido")
  if (modelUrl && modelFormat !== "glb" && modelFormat !== "gltf") throw new Error("Formato de modelo inválido")
  if (!Number.isFinite(price) || price < 0) throw new Error("Precio inválido")
  return {
    name,
    mockup_url_front: mockupFront,
    mockup_url_back: mockupBack,
    model_url: modelUrl || null,
    model_format: modelFormat || null,
    price,
    editable_zones: zones,
    scene_config: sceneConfig,
    default_config: defaultConfig,
    active: formData.get("active") === "on",
  }
}

export async function createTemplateAction(formData: FormData) {
  const supabase = await requireAdmin()
  const data = parseTemplate(formData)
  const { data: row, error } = await supabase.from("templates").insert([data] as never).select("id").single()
  if (error) throw new Error(error.message)
  revalidatePath("/admin/templates"); revalidatePath("/personalizar")
  redirect(`/admin/templates/${(row as { id: string }).id}`)
}

export async function updateTemplateAction(id: string, formData: FormData) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const data = parseTemplate(formData)
  const { error } = await supabase.from("templates").update(data as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/templates"); revalidatePath(`/admin/templates/${id}`); revalidatePath("/personalizar")
}

export async function deleteTemplateAction(id: string) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("templates").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/templates"); revalidatePath("/personalizar")
  redirect("/admin/templates")
}

export async function toggleTemplateActiveAction(id: string, active: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("templates").update({ active } as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/templates"); revalidatePath("/personalizar")
}

// ---------- Categories ----------

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
}

function parseCategory(formData: FormData) {
  const slug = slugify(text(formData.get("slug"), 60) || text(formData.get("label"), 60))
  const label = text(formData.get("label"), 120)
  const emoji = text(formData.get("emoji"), 16)
  const description = text(formData.get("description"), 500)
  const displayOrder = Number(formData.get("display_order") ?? 0)
  if (!slug) throw new Error("Slug requerido")
  if (!label) throw new Error("Label requerido")
  if (!Number.isInteger(displayOrder) || displayOrder < 0) throw new Error("display_order inválido")
  return {
    slug,
    label,
    emoji,
    description,
    display_order: displayOrder,
    active: formData.get("active") === "on",
  }
}

export async function createCategoryAction(formData: FormData) {
  const supabase = await requireAdmin()
  const data = parseCategory(formData)
  const { data: row, error } = await supabase.from("categories").insert([data] as never).select("id").single()
  if (error) throw new Error(error.message)
  revalidatePath("/admin/categorias")
  revalidatePath("/")
  revalidatePath("/registro")
  revalidatePath("/cuenta")
  redirect(`/admin/categorias/${(row as { id: string }).id}`)
}

export async function updateCategoryAction(id: string, formData: FormData) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const data = parseCategory(formData)
  const { error } = await supabase.from("categories").update(data as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/categorias")
  revalidatePath(`/admin/categorias/${id}`)
  revalidatePath("/")
  revalidatePath("/registro")
  revalidatePath("/cuenta")
}

export async function deleteCategoryAction(id: string) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/categorias")
  revalidatePath("/")
  revalidatePath("/registro")
  revalidatePath("/cuenta")
  redirect("/admin/categorias")
}

export async function toggleCategoryActiveAction(id: string, active: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("categories").update({ active } as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/categorias")
  revalidatePath("/")
  revalidatePath("/registro")
  revalidatePath("/cuenta")
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) throw new Error("Lista vacía")
  for (const id of orderedIds) if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]
    const { error } = await supabase
      .from("categories")
      .update({ display_order: (i + 1) * 10 } as never)
      .eq("id", id)
    if (error) throw new Error(error.message)
  }
  revalidatePath("/admin/categorias")
  revalidatePath("/")
  revalidatePath("/registro")
  revalidatePath("/cuenta")
  revalidatePath("/productos")
}

// ---------- Hero slides ----------

function parseSlide(formData: FormData) {
  const kind = text(formData.get("kind"), 8)
  if (kind !== "image" && kind !== "video") throw new Error("Tipo inválido")
  const url = text(formData.get("url"), 1000)
  const posterUrl = text(formData.get("poster_url"), 1000)
  const heading = text(formData.get("heading"), 200)
  const subheading = text(formData.get("subheading"), 500)
  const ctaLabel = text(formData.get("cta_label"), 80) || "Diseñá tu equipo"
  const ctaHref = text(formData.get("cta_href"), 500) || "/personalizar"
  const displayOrder = Number(formData.get("display_order") ?? 0)
  if (!url) throw new Error("URL de media requerida")
  if (!Number.isInteger(displayOrder) || displayOrder < 0) throw new Error("display_order inválido")
  return {
    kind: kind as "image" | "video",
    url,
    poster_url: posterUrl || null,
    heading,
    subheading,
    cta_label: ctaLabel,
    cta_href: ctaHref,
    display_order: displayOrder,
    active: formData.get("active") === "on",
  }
}

export async function createSlideAction(formData: FormData) {
  const supabase = await requireAdmin()
  const data = parseSlide(formData)
  const { data: row, error } = await supabase.from("hero_slides").insert([data] as never).select("id").single()
  if (error) throw new Error(error.message)
  revalidatePath("/admin/hero")
  revalidatePath("/")
  redirect(`/admin/hero/${(row as { id: string }).id}`)
}

export async function updateSlideAction(id: string, formData: FormData) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const data = parseSlide(formData)
  const { error } = await supabase.from("hero_slides").update(data as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/hero")
  revalidatePath(`/admin/hero/${id}`)
  revalidatePath("/")
}

export async function deleteSlideAction(id: string) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("hero_slides").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/hero")
  revalidatePath("/")
  redirect("/admin/hero")
}

export async function toggleSlideActiveAction(id: string, active: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("hero_slides").update({ active } as never).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/hero")
  revalidatePath("/")
}

export async function reorderSlidesAction(orderedIds: string[]) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) throw new Error("Lista vacía")
  for (const id of orderedIds) if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]
    const { error } = await supabase
      .from("hero_slides")
      .update({ display_order: i + 1 } as never)
      .eq("id", id)
    if (error) throw new Error(error.message)
  }
  revalidatePath("/admin/hero")
  revalidatePath("/")
}
