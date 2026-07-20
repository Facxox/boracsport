import { Suspense } from "react"
import Link from "next/link"
import { ProductGrid } from "@/components/product/product-grid"
import { CategoryFilter } from "@/components/home/category-filter"
import { ProductSearch } from "@/components/product/product-search"
import {
  getProducts,
  getProductIdsWithVariants,
} from "@/lib/supabase/queries/products"
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
  const searchTerm = typeof sp.q === "string" ? sp.q : ""

  const [dbCategories, products] = await Promise.all([
    getActiveCategories(),
    getProducts({
      category: undefined,
      search: searchTerm,
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
        search: searchTerm,
        from: 0,
        to: 23,
      })
    : products

  const variantsLookup = await getProductIdsWithVariants(
    filteredProducts.map((p) => p.id),
  )
  const hasVariantsByProduct = variantsLookup.ids
  const variantsLookupErrored = variantsLookup.errored

  const filterCategories = dbCategories.length > 0
    ? dbCategories.map((c) => ({ slug: c.slug, label: c.label, emoji: c.emoji }))
    : (CATEGORIES as readonly Category[]).map((slug) => ({
        slug,
        label: slug,
        emoji: "",
      }))

  const totalResults = filteredProducts.length
  const hasActiveFilter = Boolean(safeCategory) || searchTerm.length > 0

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

      <div className="mb-4">
        <ProductSearch placeholder="Buscar por nombre, categoría o tag…" />
      </div>

      <Suspense>
        <CategoryFilter categories={filterCategories} />
      </Suspense>

      <div
        className="mb-4 flex items-center justify-between text-xs"
        aria-live="polite"
      >
        <span className="text-muted-foreground">
          {totalResults === 0
            ? "Sin resultados"
            : `${totalResults} ${totalResults === 1 ? "producto" : "productos"}`}
        </span>
        {hasActiveFilter ? (
          <span className="text-muted-foreground/80">Filtros aplicados</span>
        ) : null}
      </div>

      <ProductGrid
        products={filteredProducts}
        hasVariantsByProduct={hasVariantsByProduct}
        forceVariantFlow={variantsLookupErrored}
        emptyState={<EmptyCatalogState />}
      />
    </div>
  )
}

function EmptyCatalogState() {
  return (
    <div className="border-border bg-card/40 rounded-2xl border border-dashed py-16 text-center">
      <p className="text-muted-foreground">
        No encontramos productos con esos filtros.
      </p>
      <p className="text-muted-foreground/70 mt-2 text-sm">
        Probá con otro término o limpiá los filtros para ver todo el catálogo.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/productos"
          className="bg-brand-red text-foreground hover:bg-[#ef4444] inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Limpiar filtros
        </Link>
        <Link
          href="/personalizar"
          className="hover:text-foreground inline-flex items-center text-sm font-medium underline-offset-2 hover:underline"
        >
          Ir al personalizador 3D
        </Link>
      </div>
    </div>
  )
}
