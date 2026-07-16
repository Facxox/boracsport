"use client"

import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"
import {
  deleteProductAction,
  toggleProductActiveAction,
  toggleProductFeaturedAction,
  toggleProductOnSaleAction,
} from "@/app/admin/actions"

interface ProductRowProps {
  id: string
  name: string
  price: number
  stock: number
  active: boolean
  featured: boolean
  onSale: boolean
}

export function ProductRow({ id, name, price, stock, active, featured, onSale }: ProductRowProps) {
  const [pending, startTransition] = useTransition()

  function handleToggleActive(next: boolean) {
    startTransition(async () => {
      try {
        await toggleProductActiveAction(id, next)
        toast.success(next ? "Producto publicado" : "Producto oculto")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar el estado")
      }
    })
  }

  function handleToggleFeatured(next: boolean) {
    startTransition(async () => {
      try {
        await toggleProductFeaturedAction(id, next)
        toast.success(next ? "Producto destacado" : "Quitado de destacados")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo actualizar destacado")
      }
    })
  }

  function handleToggleOnSale(next: boolean) {
    startTransition(async () => {
      try {
        await toggleProductOnSaleAction(id, next)
        toast.success(next ? "Producto en oferta" : "Oferta removida")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo actualizar oferta")
      }
    })
  }

  function handleDelete() {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      try {
        await deleteProductAction(id)
        toast.success("Producto eliminado")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  return (
    <tr className="border-t border-white/10 align-middle">
      <td className="p-4 font-semibold">
        <Link href={`/admin/productos/${id}`} className="hover:text-[#dc2626]">
          {name}
        </Link>
      </td>
      <td className="p-4">$U {Number(price).toLocaleString("es-UY")}</td>
      <td className="p-4">{stock}</td>
      <td className="p-4">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={active}
            disabled={pending}
            onChange={(e) => handleToggleActive(e.target.checked)}
            className="size-4 accent-[#dc2626]"
          />
          <span className={active ? "text-emerald-400" : "text-white/40"}>
            {active ? "Activo" : "Inactivo"}
          </span>
        </label>
        <label className="mt-1 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={featured}
            disabled={pending}
            onChange={(e) => handleToggleFeatured(e.target.checked)}
            className="size-4 accent-[#dc2626]"
          />
          <span className={featured ? "text-amber-400" : "text-white/40"}>
            {featured ? "Destacado" : "Normal"}
          </span>
        </label>
        <label className="mt-1 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={onSale}
            disabled={pending}
            onChange={(e) => handleToggleOnSale(e.target.checked)}
            className="size-4 accent-[#dc2626]"
          />
          <span className={onSale ? "text-orange-400" : "text-white/40"}>
            {onSale ? "En oferta" : "Sin oferta"}
          </span>
        </label>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/productos/${id}`}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  )
}