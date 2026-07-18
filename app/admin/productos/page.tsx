import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { ProductRow } from "@/lib/supabase/types"
import { ProductRow as ProductRowComponent } from "./product-row"

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("id, name, price, stock, active, featured, on_sale")
    .order("created_at", { ascending: false })
  const products = (data ?? []) as Pick<ProductRow, "id" | "name" | "price" | "stock" | "active" | "featured" | "on_sale">[]

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <Link href="/admin" className="text-sm text-white/60">← Panel</Link>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Catálogo</p>
          <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-white/60">
            Creá, editá y publicá los productos del catálogo.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-10 items-center rounded-xl bg-[#dc2626] px-4 text-sm font-bold text-black"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/50">
                  Todavía no hay productos.{" "}
                  <Link href="/admin/productos/nuevo" className="text-[#dc2626] underline">
                    Crear el primero
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <ProductRowComponent
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  stock={Number(product.stock)}
                  active={Boolean(product.active)}
                  featured={Boolean(product.featured)}
                  onSale={Boolean(product.on_sale)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}