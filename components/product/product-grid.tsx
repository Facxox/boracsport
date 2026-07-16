import type { Product } from "@/lib/supabase/types"
import { ProductCard } from "./product-card"

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="border-border bg-card/40 rounded-2xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">
          No hay productos disponibles en esta categoría por ahora.
        </p>
        <p className="text-muted-foreground/70 mt-2 text-sm">
          Volvé más tarde o explorá otras categorías.
        </p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
