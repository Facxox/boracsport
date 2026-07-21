"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
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

function parseProductFields(formData: FormData) {
  const name = text(formData.get("name"), 120)
  const slug = text(formData.get("slug"), 120).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
  const description = text(formData.get("description"), 4000)
  const category = text(formData.get("category"), 60)
  const price = Number(formData.get("price"))
  // Stock: si el campo no está presente (productos con variantes, donde se
  // muestra "Stock total calculado" en lugar del input), no exigimos validación
  // ni fallamos. Lo dejamos en 0 y la lógica posterior lo sobrescribe con la
  // suma de variantes.
  const stockRaw = formData.get("stock")
  const stock =
    stockRaw == null || stockRaw === "" ? 0 : Number(stockRaw)
  const tags = text(formData.get("tags"), 500)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 250)
  const images = text(formData.get("images"), 4000)
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean)
  if (!name) throw new Error("Nombre requerido")
  if (!slug) throw new Error("Slug requerido")
  if (!category) throw new Error("Categoría requerida")
  if (!Number.isFinite(price) || price < 0) throw new Error("Precio inválido")
  // Validamos stock sólo si el campo fue enviado.
  if (stockRaw != null && (!Number.isInteger(stock) || stock < 0)) {
    throw new Error("Stock inválido")
  }
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

async function parseProduct(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  formData: FormData,
) {
  const fields = parseProductFields(formData)
  // Validamos contra la tabla `categories` (fuente de verdad). Cualquier
  // categoría creada desde /admin/categorias se acepta automáticamente.
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", fields.category)
    .maybeSingle()
  if (catErr) throw new Error(`Error al validar categoría: ${catErr.message}`)
  if (!cat) throw new Error(`Categoría inválida: "${fields.category}" no existe`)
  return { ...fields, category_id: (cat as { id: string }).id }
}

interface ParsedVariant {
  size: string
  color: string
  sku: string | null
  stock: number
  price_override: number | null
}

function parseVariants(formData: FormData): ParsedVariant[] {
  const variants: ParsedVariant[] = []
  for (const key of Array.from(formData.keys())) {
    const match = key.match(/^variants\[(\d+)\]\[size\]$/)
    if (!match) continue
    const idx = match[1]
    const size = text(formData.get(`variants[${idx}][size]`), 60)
    const color = text(formData.get(`variants[${idx}][color]`), 60)
    const sku = text(formData.get(`variants[${idx}][sku]`), 60) || null
    const stockRaw = formData.get(`variants[${idx}][stock]`)
    const priceRaw = formData.get(`variants[${idx}][price_override]`)
    const stock = Number(stockRaw ?? 0)
    const priceOverride = priceRaw == null || String(priceRaw) === "" ? null : Number(priceRaw)
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error(`Variante #${idx}: stock inválido`)
    }
    if (priceOverride != null && (!Number.isFinite(priceOverride) || priceOverride < 0)) {
      throw new Error(`Variante #${idx}: precio inválido`)
    }
    if (size && color) {
      variants.push({ size, color, sku, stock, price_override: priceOverride })
    }
  }
  return variants
}

async function replaceVariants(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  productId: string,
  variants: ParsedVariant[],
  formData: FormData,
) {
  // Si el form NO trae inputs `variants[N][size]`, el producto no está
  // usando la matriz (categoría sin variantes como pelota/otro). Si
  // antes tenía variantes, las borramos para no dejar stock huérfano.
  const hasMatrixInputs = Array.from(formData.keys()).some((k) =>
    /^variants\[\d+\]\[size\]$/.test(k),
  )
  if (!hasMatrixInputs) {
    // Borrado defensivo: si la categoría cambió de ropa a otro sin limpiar
    // variantes, las borramos para que el stock top-level sea la única verdad.
    const { error: orphanDeleteError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId)
    if (orphanDeleteError) {
      console.warn("[replaceVariants] no se pudieron limpiar variantes huérfanas:", orphanDeleteError.message)
    }
    return
  }

  // Filtrar filas vacías (sin size, color ni stock > 0) ANTES de borrar.
  // Si la matriz está totalmente vacía, NO borramos ni tocamos nada: el
  // producto sigue siendo de "stock simple" y su `products.stock` top-level
  // sigue siendo válido.
  const validRows = variants.filter(
    (v) => ((v.size || "").trim() !== "" || (v.color || "").trim() !== "") && v.stock >= 0,
  )
  if (validRows.length === 0) return

  // 1) Borrar TODAS las variantes previas de este producto (delete + insert
  //    es más simple que diff y suficiente porque el admin edita raramente).
  const { error: delError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId)
  if (delError) {
    throw new Error(describeSupabaseError(delError, "No se pudieron limpiar las variantes anteriores"))
  }

  // Reconciliar products.stock con la suma de variantes válidas. Sin esto,
  // el stock top-level queda inconsistente con la realidad (los pedidos
  // decrementan variants.stock; el catálogo lee products.stock).
  const variantStock = validRows.reduce(
    (acc, v) => acc + (Number.isInteger(v.stock) && v.stock >= 0 ? v.stock : 0),
    0,
  )
  const { error: stockSyncError } = await supabase
    .from("products")
    .update({ stock: variantStock } as never)
    .eq("id", productId)
  if (stockSyncError) {
    // No podemos recuperar el stock previo sin otra query; logueamos y
    // continuamos. El admin verá el stock desfasado y lo corrige.
    console.error("[replaceVariants] no se pudo sincronizar products.stock:", stockSyncError.message)
  }

  // 2) Deduplicar por (size, color) — si la matriz tiene duplicados,
  //    sumamos el stock.
  const dedup = new Map<string, ParsedVariant>()
  for (const v of validRows) {
    const key = `${(v.size || "").trim()}|${(v.color || "").trim()}`
    const prev = dedup.get(key)
    if (prev) {
      dedup.set(key, { ...prev, stock: prev.stock + v.stock })
    } else {
      dedup.set(key, v)
    }
  }

  const rows = Array.from(dedup.values()).map((v) => ({ ...v, product_id: productId }))
  const { error: insError } = await supabase.from("product_variants").insert(rows as never)
  if (insError) {
    throw new Error(describeSupabaseError(insError, "No se pudieron insertar las variantes"))
  }
}

function describeSupabaseError(
  error: { message?: string; details?: string; hint?: string; code?: string } | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback
  // Mensajes amigables para errores comunes de unicidad (Postgres 23505).
  if (error.code === "23505") {
    const m = error.message ?? ""
    if (m.includes("products_slug_key")) return "Ya existe un producto con ese slug. Elegí otro."
    if (m.includes("categories_slug_key")) return "Ya existe una categoría con ese slug. Elegí otro."
    return "Ya existe un registro con esos datos únicos."
  }
  // En producción NO exponemos details/hint (pueden leakear schema). En dev
  // los incluimos para debugging.
  const isDev = process.env.NODE_ENV !== "production"
  const parts: string[] = []
  if (error.message) parts.push(error.message)
  if (isDev) {
    if (error.details) parts.push(`detalles: ${error.details}`)
    if (error.hint) parts.push(`sugerencia: ${error.hint}`)
    if (error.code) parts.push(`[${error.code}]`)
  }
  return parts.length > 0 ? parts.join(" — ") : fallback
}

// Server Actions de Next.js lanzan una excepción especial `redirect()` que
// NO debe tratarse como error. La reconocemos por el digest "NEXT_REDIRECT".
function isNextRedirect(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false
  const digest = (err as { digest?: unknown }).digest
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")
}

export async function createProductAction(
  formData: FormData,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  let createdProductId: string | null = null
  let authenticatedClient: Awaited<ReturnType<typeof requireAdmin>> | null = null
  try {
    const supabase = await requireAdmin()
    authenticatedClient = supabase
    const data = await parseProduct(supabase, formData)
    const variants = parseVariants(formData)
    // Sólo pisamos `products.stock` con la suma de variantes si el form
    // efectivamente incluyó inputs de matriz y esas variantes son válidas.
    // Si la matriz quedó vacía (el admin borró todas las celdas), respetamos
    // el stock numérico del input principal.
    const validVariants = variants.filter(
      (v) => ((v.size || "").trim() !== "" || (v.color || "").trim() !== "") && v.stock >= 0,
    )
    const totalStock = validVariants.length > 0
      ? validVariants.reduce((acc, v) => acc + (Number.isInteger(v.stock) && v.stock >= 0 ? v.stock : 0), 0)
      : data.stock
    const { data: row, error } = await supabase
      .from("products")
      .insert([{ ...data, stock: totalStock }] as never)
      .select("id")
      .single()
    if (error || !row) {
      const msg = describeSupabaseError(error, "No se pudo crear el producto")
      console.error("[createProductAction] insert error:", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      })
      throw new Error(msg)
    }
    const productId = (row as { id: string }).id
    createdProductId = productId
    await replaceVariants(supabase, productId, variants, formData)
    revalidatePath("/admin/productos"); revalidatePath("/productos"); revalidatePath("/productos/[slug]", "page"); revalidatePath("/")
    redirect(`/admin/productos/${productId}`)
  } catch (err) {
    // El `redirect()` de Next.js lanza una excepción especial con digest
    // "NEXT_REDIRECT" — es flujo exitoso, no error. Re-lanzar tal cual.
    if (isNextRedirect(err)) throw err
    // Rollback si creamos un producto antes del fallo. Limpiamos primero
    // las variantes (si quedaron insertadas parcialmente) y luego el
    // producto. Si el delete de variantes falla por RLS, intentamos igual
    // borrar el producto para que la fila no quede huérfana en cascada.
    if (createdProductId && authenticatedClient) {
      try {
        await authenticatedClient
          .from("product_variants")
          .delete()
          .eq("product_id", createdProductId)
      } catch (rollbackVariantsErr) {
        console.error("[createProductAction] rollback variantes falló:", rollbackVariantsErr)
      }
      try {
        const { error: rollbackError } = await authenticatedClient
          .from("products")
          .delete()
          .eq("id", createdProductId)
        if (rollbackError) {
          console.error("[createProductAction] rollback falló:", {
            code: rollbackError.code,
            message: rollbackError.message,
            details: rollbackError.details,
            hint: rollbackError.hint,
          })
        } else {
          console.warn(`[createProductAction] rollback: producto ${createdProductId} eliminado`)
        }
      } catch (rollbackErr) {
        console.error("[createProductAction] rollback falló:", rollbackErr)
      }
    }
    const message = err instanceof Error ? err.message : String(err)
    console.error("[createProductAction] failed:", message)
    return { ok: false, error: message }
  }
  // Inalcanzable (redirect lanza), pero TS lo exige.
  return { ok: false, error: "unexpected" }
}

export async function updateProductAction(
  id: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(id)) return { ok: false, error: "ID inválido" }
  try {
    const supabase = await requireAdmin()
    const data = await parseProduct(supabase, formData)
    const variants = parseVariants(formData)
    // Sólo pisamos `products.stock` con la suma de variantes si el form
    // efectivamente incluyó inputs de matriz y esas variantes son válidas.
    // Si la matriz quedó vacía, respetamos el stock del input principal.
    const validVariants = variants.filter(
      (v) => ((v.size || "").trim() !== "" || (v.color || "").trim() !== "") && v.stock >= 0,
    )
    const totalStock = validVariants.length > 0
      ? validVariants.reduce((acc, v) => acc + (Number.isInteger(v.stock) && v.stock >= 0 ? v.stock : 0), 0)
      : data.stock
    const { error } = await supabase
      .from("products")
      .update({ ...data, stock: totalStock } as never)
      .eq("id", id)
    if (error) {
      const msg = describeSupabaseError(error, "No se pudo actualizar el producto")
      console.error("[updateProductAction] update error:", msg)
      throw new Error(msg)
    }
    await replaceVariants(supabase, id, variants, formData)
    revalidatePath("/admin/productos"); revalidatePath(`/admin/productos/${id}`); revalidatePath("/productos"); revalidatePath("/productos/[slug]", "page"); revalidatePath("/")
    return { ok: true }
  } catch (err) {
    if (isNextRedirect(err)) throw err
    const message = err instanceof Error ? err.message : String(err)
    console.error("[updateProductAction] failed:", message)
    return { ok: false, error: message }
  }
}

export async function deleteProductAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(id)) return { ok: false, error: "ID inválido" }
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) {
      const msg = describeSupabaseError(error, "No se pudo eliminar el producto")
      console.error("[deleteProductAction] delete error:", msg)
      throw new Error(msg)
    }
    revalidatePath("/admin/productos"); revalidatePath("/productos"); revalidatePath("/productos/[slug]", "page"); revalidatePath("/")
    redirect("/admin/productos")
    return { ok: true }
  } catch (err) {
    if (isNextRedirect(err)) throw err
    const message = err instanceof Error ? err.message : String(err)
    console.error("[deleteProductAction] failed:", message)
    return { ok: false, error: message }
  }
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("products").update({ active } as never).eq("id", id)
  if (error) throw new Error(describeSupabaseError(error, "No se pudo actualizar el estado"))
  revalidatePath("/admin/productos"); revalidatePath("/productos"); revalidatePath("/productos/[slug]", "page"); revalidatePath("/")
}

export async function toggleProductFeaturedAction(id: string, featured: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("products").update({ featured } as never).eq("id", id)
  if (error) throw new Error(describeSupabaseError(error, "No se pudo actualizar destacado"))
  revalidatePath("/admin/productos"); revalidatePath("/productos"); revalidatePath("/productos/[slug]", "page"); revalidatePath("/")
}

export async function toggleProductOnSaleAction(id: string, onSale: boolean) {
  if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  const { error } = await supabase.from("products").update({ on_sale: onSale } as never).eq("id", id)
  if (error) throw new Error(describeSupabaseError(error, "No se pudo actualizar oferta"))
  revalidatePath("/admin/productos")
  revalidatePath("/")
  revalidatePath("/productos")
  revalidatePath("/productos/[slug]", "page")
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
  const kindRaw = text(formData.get("kind"), 16)
  const kind: "ropa" | "pelota" | "otro" =
    kindRaw === "ropa" || kindRaw === "pelota" || kindRaw === "otro" ? kindRaw : "otro"
  if (!slug) throw new Error("Slug requerido")
  if (!label) throw new Error("Label requerido")
  if (!Number.isInteger(displayOrder) || displayOrder < 0) throw new Error("display_order inválido")
  return {
    slug,
    label,
    emoji,
    description,
    display_order: displayOrder,
    kind,
    active: formData.get("active") === "on",
  }
}

export async function createCategoryAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const data = parseCategory(formData)
    const { data: row, error } = await supabase.from("categories").insert([data] as never).select("id").single()
    if (error || !row) {
      const msg = describeSupabaseError(error, "No se pudo crear la categoría")
      console.error("[createCategoryAction] error:", msg)
      throw new Error(msg)
    }
    revalidatePath("/admin/categorias")
    revalidatePath("/")
    revalidatePath("/registro")
    revalidatePath("/cuenta")
    redirect(`/admin/categorias/${(row as { id: string }).id}`)
  } catch (err) {
    if (isNextRedirect(err)) throw err
    const message = err instanceof Error ? err.message : String(err)
    console.error("[createCategoryAction] failed:", message)
    return { ok: false, error: message }
  }
}

export async function updateCategoryAction(
  id: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(id)) return { ok: false, error: "ID inválido" }
  try {
    const supabase = await requireAdmin()
    const data = parseCategory(formData)
    const { error } = await supabase.from("categories").update(data as never).eq("id", id)
    if (error) {
      const msg = describeSupabaseError(error, "No se pudo actualizar la categoría")
      console.error("[updateCategoryAction] error:", msg)
      throw new Error(msg)
    }
    revalidatePath("/admin/categorias")
    revalidatePath(`/admin/categorias/${id}`)
    revalidatePath("/")
    revalidatePath("/registro")
    revalidatePath("/cuenta")
    return { ok: true }
  } catch (err) {
    if (isNextRedirect(err)) throw err
    const message = err instanceof Error ? err.message : String(err)
    console.error("[updateCategoryAction] failed:", message)
    return { ok: false, error: message }
  }
}

export async function deleteCategoryAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(id)) return { ok: false, error: "ID inválido" }
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) {
      const msg = describeSupabaseError(error, "No se pudo eliminar la categoría")
      console.error("[deleteCategoryAction] error:", msg)
      throw new Error(msg)
    }
    revalidatePath("/admin/categorias")
    revalidatePath("/")
    revalidatePath("/registro")
  revalidatePath("/cuenta")
    redirect("/admin/categorias")
    return { ok: true }
  } catch (err) {
    if (isNextRedirect(err)) throw err
    const message = err instanceof Error ? err.message : String(err)
    console.error("[deleteCategoryAction] failed:", message)
    return { ok: false, error: message }
  }
}

export async function toggleCategoryActiveAction(id: string, active: boolean): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(id)) return { ok: false, error: "ID inválido" }
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase.from("categories").update({ active } as never).eq("id", id)
    if (error) {
      const msg = describeSupabaseError(error, "No se pudo actualizar el estado")
      throw new Error(msg)
    }
    revalidatePath("/admin/categorias")
    revalidatePath("/")
    revalidatePath("/registro")
    revalidatePath("/cuenta")
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[toggleCategoryActiveAction] failed:", message)
    return { ok: false, error: message }
  }
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) throw new Error("Lista vacía")
  for (const id of orderedIds) if (!isUuid(id)) throw new Error("ID inválido")
  const supabase = await requireAdmin()
  // Las updates son independientes (cada fila es su propia fila). Las
  // disparamos en paralelo para reducir N round-trips a 1 latencia.
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("categories")
        .update({ display_order: (i + 1) * 10 } as never)
        .eq("id", id),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
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
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("hero_slides")
        .update({ display_order: i + 1 } as never)
        .eq("id", id),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
  revalidatePath("/admin/hero")
  revalidatePath("/")
}
