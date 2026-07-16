"use client"

import { useState } from "react"
import Link from "next/link"
import { Share2 } from "lucide-react"
import { Button, ButtonLink } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { VariantPicker, type VariantOption } from "@/components/product/variant-picker"
import { formatUYU } from "@/lib/format"
import { buildWhatsAppUrl } from "@/lib/cart/whatsapp-message"
import { toast } from "sonner"

interface PDPClientProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    description: string
    images: string[]
    tags: string[]
    onSale: boolean
    category: string
    stock: number
  }
  variants: VariantOption[]
}

export function ProductPDPClient({ product, variants }: PDPClientProps) {
  // null hasta que el VariantPicker emita su selección inicial. Evita el flash
  // que ocurre si el padre elige variants[0] y el picker resuelve uno distinto
  // por su propia heurística de stock.
  const [selected, setSelected] = useState<VariantOption | null>(null)
  const addProduct = useCartStore((s) => s.addProduct)

  const hasVariants = variants.length > 0
  const effectivePrice = selected?.priceOverride ?? product.price
  const stock = selected?.stock ?? product.stock ?? 0
  // canAdd: con variantes exigimos una seleccionada con stock; sin variantes,
  // usamos el stock top-level para no permitir agregar agotados.
  const canAdd = hasVariants
    ? selected != null && selected.stock > 0
    : stock > 0

  function handleAdd() {
    if (hasVariants && (!selected || selected.stock <= 0)) {
      toast.error("Seleccioná una variante con stock disponible.")
      return
    }
    addProduct({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: effectivePrice,
      image: product.images?.[0],
      qty: 1,
      variantId: selected?.id ?? null,
      size: selected?.size || undefined,
      color: selected?.color || undefined,
      stockCap: hasVariants ? selected?.stock : stock,
    })
    toast.success("Producto agregado al carrito")
  }

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const text = `Mirá "${product.name}" en Borac Sport: ${url}`
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: product.name, text, url }).catch(() => null)
      return
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => toast.success("Link copiado al portapapeles"),
        () => toast.error("No se pudo copiar el link"),
      )
      return
    }
    toast.error("Tu navegador no soporta compartir.")
  }

  function handleWhatsApp() {
    const fakeLine = {
      kind: "product" as const,
      key: "tmp",
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: effectivePrice,
      qty: 1,
      image: product.images?.[0],
      variantId: selected?.id ?? null,
      size: selected?.size,
      color: selected?.color,
    }
    const url = buildWhatsAppUrl([fakeLine], { name: "" })
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener")
  }

  return (
    <div className="flex flex-col gap-4">
      {hasVariants ? (
        <VariantPicker
          variants={variants}
          basePrice={product.price}
          onChange={setSelected}
        />
      ) : (
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold">
            {formatUYU(product.price)}
          </span>
        </div>
      )}

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

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          size="lg"
          className="bg-brand-red text-foreground hover:bg-[#ef4444] w-full sm:w-auto"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          {canAdd ? "Agregar al carrito" : "Sin stock"}
        </Button>
        <ButtonLink
          href="/carrito"
          variant="outline"
          className="w-full sm:w-auto"
        >
          Ver carrito
        </ButtonLink>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          aria-label="Compartir"
          className="text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {!hasVariants && stock === 0 && (
        <p className="text-xs text-amber-400">Este producto no tiene stock por el momento.</p>
      )}

      <div className="mt-2">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="text-brand-red hover:text-brand-red/80 text-xs font-semibold"
        >
          ¿Dudas? Escribinos por WhatsApp →
        </button>
      </div>

      <Link
        href={`/productos?categoria=${product.category}`}
        className="text-muted-foreground hidden text-xs"
      >
        {/* hidden breadcrumb anchor for SEO */}
      </Link>
    </div>
  )
}