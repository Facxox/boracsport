import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { getRecommendedFor } from "@/lib/supabase/queries/products"
import { createClient } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/product/product-grid"
import type { Category } from "@/lib/constants"
import type { InterestSlug } from "@/types/interest"

export async function RecommendedForYou() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("intereses")
    .eq("id", user.id)
    .maybeSingle()
  const raw = (profile as { intereses?: unknown } | null)?.intereses
  const intereses: InterestSlug[] = Array.isArray(raw)
    ? (raw.filter((slug): slug is string => typeof slug === "string") as InterestSlug[])
    : []

  if (intereses.length === 0) return null

  const products = await getRecommendedFor(intereses as Category[])

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">
            Recomendados para vos
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            En base a las categorías que elegiste al registrarte.
          </p>
        </div>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}
