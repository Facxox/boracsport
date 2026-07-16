import Link from "next/link"
import { listAllCategories } from "@/lib/supabase/queries/categories"
import { NewProductForm } from "./new-product-form"

export default async function NewProductPage() {
  const categories = await listAllCategories()
  const categoryOptions = categories.map((c) => ({ slug: c.slug, label: c.label, kind: c.kind }))

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/productos" className="text-sm text-white/60">← Productos</Link>
      <h1 className="mt-4 font-sans text-4xl font-extrabold tracking-tight">Nuevo producto</h1>
      <p className="mt-1 text-sm text-white/60">Completá los datos para publicar en el catálogo.</p>

      <NewProductForm categories={categoryOptions} />
    </main>
  )
}