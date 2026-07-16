import { notFound } from "next/navigation"
import Link from "next/link"
import { getProductBySlug, getRelatedProducts } from "@/lib/supabase/queries/products"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { ProductGrid } from "@/components/product/product-grid"
import { formatUYU } from "@/lib/format"
import { CATEGORY_LABELS } from "@/lib/constants"
import { ArrowLeft } from "lucide-react"

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Producto no encontrado" }
  return { title: product.name, description: product.description }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)
  const image = product.images?.[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <Link
        href="/productos"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="bg-muted/30 aspect-square overflow-hidden rounded-2xl border border-white/5">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center text-sm">
              Sin imagen
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-brand-red text-xs font-semibold tracking-wider uppercase">
            {CATEGORY_LABELS[product.category]}
          </span>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">
            {product.name}
          </h1>
          <p className="font-display text-2xl font-bold">
            {formatUYU(product.price)}
          </p>
          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>
          )}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="bg-muted/50 rounded-full border border-white/5 px-2.5 py-0.5 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image,
              }}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display mb-6 text-2xl font-extrabold">
            También te puede interesar
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
