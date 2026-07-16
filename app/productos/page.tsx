import { Suspense } from "react"
import { ProductGrid } from "@/components/product/product-grid"
import { CategoryFilter } from "@/components/home/category-filter"
import { getProducts } from "@/lib/supabase/queries/products"
import { CATEGORIES, type Category } from "@/lib/constants"
import { getActiveCategories } from "@/lib/supabase/queries/categories"

export const revalidate = 60

type SearchParams = Promise<{ category?: string; q?: string }>

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const requestedCategory = sp.category as Category | undefined

  const [dbCategories, products] = await Promise.all([
    getActiveCategories(),
    getProducts({
      category: undefined,
      search: sp.q,
      from: 0,
      to: 23,
    }),
  ])

  // Validamos el slug de categoría contra la DB y el set legacy hardcoded.
  const known = new Set<string>([
    ...dbCategories.map((c) => c.slug),
    ...(CATEGORIES as readonly string[]),
  ])
  const safeCategory =
    requestedCategory && known.has(requestedCategory)
      ? (requestedCategory as Category)
      : undefined

  const filteredProducts = safeCategory
    ? await getProducts({
        category: safeCategory,
        search: sp.q,
        from: 0,
        to: 23,
      })
    : products

  const filterCategories = dbCategories.length > 0
    ? dbCategories.map((c) => ({ slug: c.slug, label: c.label, emoji: c.emoji }))
    : (CATEGORIES as readonly Category[]).map((slug) => ({
        slug,
        label: slug,
        emoji: "",
      }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">
          Catálogo completo
        </h1>
        <p className="text-muted-foreground mt-2">
          Indumentaria, uniformes, DTF y merchandising.
        </p>
      </div>
      <Suspense>
        <CategoryFilter categories={filterCategories} />
      </Suspense>
      <ProductGrid products={filteredProducts} />
    </div>
  )
}