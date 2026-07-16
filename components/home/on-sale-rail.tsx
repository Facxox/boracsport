import { ProductGrid } from "@/components/product/product-grid"
import { getOnSaleProducts } from "@/lib/supabase/queries/products"

export async function OnSaleRail() {
  const products = await getOnSaleProducts(8)
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">
            <span className="mr-2">🔥</span>En oferta
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Productos destacados con precio especial por tiempo limitado.
          </p>
        </div>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}