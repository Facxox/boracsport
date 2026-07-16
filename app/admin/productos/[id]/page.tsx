import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ProductRow, ProductVariantRow } from "@/lib/supabase/types"
import { listAllCategories } from "@/lib/supabase/queries/categories"
import { ProductForm } from "../product-form"

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const supabase = await createClient()
  const [{ data }, categories, variantsRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    listAllCategories(),
    supabase
      .from("product_variants")
      .select("id, size, color, sku, stock, price_override")
      .eq("product_id", id)
      .order("created_at", { ascending: true }),
  ])
  const product = data as ProductRow | null
  if (!product) notFound()
  const variants = ((variantsRes.data ?? []) as unknown as ProductVariantRow[]).map((v) => ({
    size: v.size ?? "",
    color: v.color ?? "",
    sku: v.sku ?? "",
    stock: Number(v.stock ?? 0),
    price_override: v.price_override == null ? "" : String(v.price_override),
  }))

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/productos" className="text-sm text-white/60">← Productos</Link>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Editar</p>
          <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">{product.name}</h1>
          <p className="mt-1 text-sm text-white/50">/{product.slug}</p>
        </div>
      </div>

      <ProductForm
        id={product.id}
        categories={categories.map((c) => ({ slug: c.slug, label: c.label, kind: c.kind }))}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          category: product.category,
          price: Number(product.price),
          stock: Number(product.stock),
          tags: product.tags ?? [],
          images: product.images ?? [],
          active: Boolean(product.active),
          featured: Boolean(product.featured),
          on_sale: Boolean(product.on_sale),
          variants,
        }}
      />
    </main>
  )
}