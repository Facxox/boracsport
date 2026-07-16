import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { getProductBySlug, getRelatedProducts } from "@/lib/supabase/queries/products"
import { ImageGallery } from "@/components/product/image-gallery"
import { ProductPDPClient } from "@/components/product/product-pdp-client"
import { ProductGrid } from "@/components/product/product-grid"
import { CATEGORY_LABELS } from "@/lib/constants"
import type { ProductVariantRow } from "@/lib/supabase/types"

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Producto no encontrado" }
  return { title: product.name, description: product.description }
}

function variantToOption(v: ProductVariantRow) {
  return {
    id: v.id,
    size: v.size ?? "",
    color: v.color ?? "",
    stock: Number(v.stock ?? 0),
    priceOverride: v.price_override != null ? Number(v.price_override) : null,
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)
  const images = (product.images ?? []).filter(
    (u): u is string => typeof u === "string" && u.length > 0,
  )
  const variants = (product.variants ?? []).map(variantToOption)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <Home className="h-3.5 w-3.5" />
          Inicio
        </Link>
        <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
        <Link
          href={`/productos?categoria=${product.category}`}
          className="text-muted-foreground hover:text-foreground"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
        <span className="font-medium">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ImageGallery images={images} alt={product.name} />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-brand-red text-xs font-semibold tracking-wider uppercase">
              {CATEGORY_LABELS[product.category]}
            </span>
            {product.on_sale && (
              <span className="rounded-full bg-[#dc2626] px-2 py-0.5 text-[10px] font-bold tracking-wider text-black uppercase shadow-lg shadow-[#dc2626]/40">
                Oferta
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">
            {product.name}
          </h1>

          <ProductPDPClient
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(product.price),
              description: product.description ?? "",
              images,
              tags: product.tags ?? [],
              onSale: Boolean(product.on_sale),
              category: product.category,
              stock: Number(product.stock ?? 0),
            }}
            variants={variants}
          />
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