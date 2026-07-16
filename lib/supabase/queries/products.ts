// Queries de productos.
// TODAS las queries usan select explícito (no '*') y select category/tag/image/name/price.
// Re-validan cada 60 segundos.

import "server-only"
import { createClient } from "../server"
import type { Product } from "../types"
import type { Category } from "@/lib/constants"

const PRODUCT_COLUMNS =
  "id, slug, name, description, price, images, tags, category" as const

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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .maybeSingle()
    if (error) {
      console.warn("[getProductBySlug] error:", error.message)
      return null
    }
    return (data as unknown as Product | null) ?? null
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

export async function getOnSaleProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(ON_SALE_COLUMNS)
      .eq("active", true)
      .eq("on_sale", true)
      .order("created_at", { ascending: false })
      .limit(limit)
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
