import Link from "next/link"
import { listAllCategories } from "@/lib/supabase/queries/categories"
import { NewProductForm } from "./new-product-form"

export default async function NewProductPage() {
  const categories = await listAllCategories()
  const categoryOptions = categories.map((c) => ({ slug: c.slug, label: c.label, kind: c.kind }))

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link href="/admin/productos" className="text-sm text-white/60 transition-colors hover:text-white">
        ← Productos
      </Link>
      <div className="mt-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">Catálogo</p>
        <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">Nuevo producto</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Organizá la información, el inventario y la publicación antes de agregarlo al catálogo.
        </p>
      </div>

      <NewProductForm categories={categoryOptions} />
    </main>
  )
}