import type { Product } from "@/lib/supabase/types"
import { AlertTriangle } from "lucide-react"
import { ProductCard } from "./product-card"

export function ProductGrid({
  products,
  hasVariantsByProduct,
  forceVariantFlow = false,
  emptyState,
}: {
  products: Product[]
  hasVariantsByProduct?: Set<string>
  /**
   * Contingencia: si la query de variantes falló (timeout/RLS/schema),
   * forzamos "Elegir opciones" en todas las cards en vez de "+ Agregar",
   * para que ningún producto entre al carrito sin selección de talle/color.
   */
  forceVariantFlow?: boolean
  emptyState?: React.ReactNode
}) {
  if (products.length === 0) {
    return (
      emptyState ?? (
        <div className="border-border bg-card/40 rounded-2xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            No hay productos disponibles en esta categoría por ahora.
          </p>
          <p className="text-muted-foreground/70 mt-2 text-sm">
            Volvé más tarde o explorá otras categorías.
          </p>
        </div>
      )
    )
  }
  return (
    <div className="space-y-4">
      {forceVariantFlow ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-200">Catálogo parcialmente disponible</p>
            <p className="text-amber-100/80">
              No pudimos verificar las variantes de cada producto. Te pedimos abrir cada producto
              para elegir talle y color antes de agregarlo al carrito.
            </p>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            hasVariants={forceVariantFlow || (hasVariantsByProduct?.has(p.id) ?? false)}
          />
        ))}
      </div>
    </div>
  )
}
