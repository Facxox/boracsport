import { Suspense } from "react"
import { HeroSection } from "@/components/home/hero-section"
import { CategoryFilter } from "@/components/home/category-filter"
import { ProductGrid } from "@/components/product/product-grid"
import { OnSaleRail } from "@/components/home/on-sale-rail"
import { RecommendedForYou } from "@/components/home/recommended-for-you"
import { TrustRibbon } from "@/components/layout/trust-ribbon"
import { getProducts } from "@/lib/supabase/queries/products"
import { getActiveCategories } from "@/lib/supabase/queries/categories"

import { CATEGORIES, type Category } from "@/lib/constants"

export const revalidate = 60

type SearchParams = Promise<{ category?: string }>

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const requestedCategory = sp.category as Category | undefined
  const safeCategory =
    requestedCategory && (CATEGORIES as readonly string[]).includes(requestedCategory)
      ? requestedCategory
      : undefined
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getProducts({ category: safeCategory, from: 0, to: 11 }),
  ])

  return (
    <>
      <div className="hidden"><TrustRibbon /></div>
      <HeroSection />
      <Suspense><OnSaleRail /></Suspense>
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">Catálogo</h2>
            <p className="text-muted-foreground mt-1 text-sm">Elegí tu vertical y encontrá la solución para tu equipo.</p>
          </div>
        </div>
        <Suspense>
          <CategoryFilter
            categories={categories.map((c) => ({ slug: c.slug, label: c.label, emoji: c.emoji }))}
          />
        </Suspense>
        <ProductGrid products={products} />
      </section>
      <Suspense><RecommendedForYou /></Suspense>
    </>
  )
}