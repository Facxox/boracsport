// Queries de productos.
// TODAS las queries usan select explícito (no '*') y select category/tag/image/name/price.
// Re-validan cada 60 segundos.

import "server-only"
import { createClient } from "../server"
import type { Product, ProductVariantRow } from "../types"
import type { Category } from "@/lib/constants"

const PRODUCT_COLUMNS =
  "id, slug, name, description, price, images, tags, category" as const

const PRODUCT_DETAIL_COLUMNS =
  "id, slug, name, description, price, images, tags, category, stock, active, featured, on_sale, product_variants:product_variants(id, size, color, sku, stock, price_override, active)" as const

export type ProductWithVariants = Product & {
  stock: number
  variants: ProductVariantRow[]
}

export type GetProductsParams = {
  category?: Category
  search?: string
  from?: number
  to?: number
}

export async function getProducts({
  category,
  search,
  from = 0,
  to = 11,
}: GetProductsParams = {}): Promise<Product[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (category) query = query.eq("category", category)
    if (search) query = query.ilike("name", `%${search}%`)

    const { data, error } = await query
    if (error) {
      console.warn("[getProducts] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as Product[]
  } catch (err) {
    console.warn("[getProducts] exception:", err)
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  try {
    const supabase = await createClient()
    // Primero el producto plano (sin embed) — así un fallo de RLS o un
    // schema mismatch en el join no rompe la PDP.
    const { data: row, error } = await supabase
      .from("products")
      .select("id, slug, name, description, price, images, tags, category, stock, active, featured, on_sale")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle()
    if (error) {
      console.warn("[getProductBySlug] product error:", error.message)
      return null
    }
    if (!row) return null

    // Variantes en una segunda query tolerante a fallos.
    let variants: ProductVariantRow[] = []
    try {
      const { data: variantRows } = await supabase
        .from("product_variants")
        .select("id, product_id, size, color, sku, stock, price_override, active")
        .eq("product_id", (row as { id: string }).id)
        .order("created_at", { ascending: true })
      variants = (variantRows ?? []) as unknown as ProductVariantRow[]
    } catch (variantErr) {
      console.warn("[getProductBySlug] variants fetch failed:", variantErr)
    }

    return {
      ...(row as unknown as ProductWithVariants),
      variants,
    }
  } catch (err) {
    console.warn("[getProductBySlug] exception:", err)
    return null
  }
}

export async function getRelatedProducts(
  category: Category,
  excludeId: string,
): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("category", category)
      .eq("active", true)
      .neq("id", excludeId)
      .limit(4)
    if (error) {
      console.warn("[getRelatedProducts] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as Product[]
  } catch (err) {
    console.warn("[getRelatedProducts] exception:", err)
    return []
  }
}

export async function getRecommendedFor(
  intereses: Category[] | null | undefined,
): Promise<Product[]> {
  if (!intereses || intereses.length === 0) return []
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .in("category", intereses)
      .limit(8)
    if (error) {
      console.warn("[getRecommendedFor] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as Product[]
  } catch (err) {
    console.warn("[getRecommendedFor] exception:", err)
    return []
  }
}

const ON_SALE_COLUMNS =
  "id, slug, name, description, price, images, tags, category, stock, featured, active, on_sale" as const

export async function getOnSaleProducts(limit = 8, from = 0): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(ON_SALE_COLUMNS)
      .eq("active", true)
      .eq("on_sale", true)
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1)
    if (error) {
      console.warn("[getOnSaleProducts] error:", error.message)
      return []
    }
    return (data ?? []) as unknown as Product[]
  } catch (err) {
    console.warn("[getOnSaleProducts] exception:", err)
    return []
  }
}