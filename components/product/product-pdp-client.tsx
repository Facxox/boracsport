"use client"

// Client de la página de producto.
// - Variantes via VariantPicker.
// - Botón principal "Agregar al carrito" (desktop).
// - Barra sticky inferior en móvil con precio + variante + stock + agregar.
// - Banner de feedback persistente durante ~6 s tras agregar (con links
//   "Ver carrito" / "Seguir comprando"). El drawer del carrito ya se abre
//   automáticamente por addProduct(), así que el banner es redundancia
//   accesible.

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Share2, ShoppingBag } from "lucide-react"
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

const FEEDBACK_DURATION_MS = 6000

export function ProductPDPClient({ product, variants }: PDPClientProps) {
  const [selected, setSelected] = useState<VariantOption | null>(null)
  const [lastAdded, setLastAdded] = useState<{ qty: number; ts: number } | null>(null)
  const addProduct = useCartStore((s) => s.addProduct)

  const hasVariants = variants.length > 0
  const effectivePrice = selected?.priceOverride ?? product.price
  const stock = selected?.stock ?? product.stock ?? 0
  const canAdd = hasVariants
    ? selected != null && selected.stock > 0
    : stock > 0

  const variantLabel = selected
    ? [selected.color, selected.size].filter(Boolean).join(" · ")
    : ""

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
    setLastAdded({ qty: 1, ts: Date.now() })
    toast.success("Producto agregado al carrito")
  }

  // Limpia el banner después del timeout para que no quede en pantalla
  // indefinidamente al refrescar la página.
  useEffect(() => {
    if (!lastAdded) return
    const handle = setTimeout(() => setLastAdded(null), FEEDBACK_DURATION_MS)
    return () => clearTimeout(handle)
  }, [lastAdded])

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
    <div className="flex flex-col gap-4 pb-24 md:pb-0">
      {hasVariants ? (
        <VariantPicker variants={variants} basePrice={product.price} onChange={setSelected} />
      ) : (
        <div className="bg-card/40 flex items-center justify-between gap-3 rounded-xl border border-white/5 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-bold">{formatUYU(product.price)}</span>
            {stock > 0 ? (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                En stock ({stock})
              </span>
            ) : (
              <span className="rounded-full border border-red-400/40 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                Sin stock
              </span>
            )}
          </div>
        </div>
      )}

      {product.description && (
        <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
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

      {/* Botones desktop */}
      <div className="mt-2 hidden flex-col gap-2 sm:flex sm:flex-row sm:items-center">
        <Button
          size="lg"
          className="bg-brand-red text-foreground hover:bg-[#ef4444] w-full sm:w-auto"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          {canAdd ? "Agregar al carrito" : "Sin stock"}
        </Button>
        <ButtonLink href="/carrito" variant="outline" className="w-full sm:w-auto">
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

      {/* Banner de feedback persistente */}
      {lastAdded ? (
        <div
          role="status"
          aria-live="polite"
          className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100 flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span>
              Agregaste <strong className="font-semibold">{product.name}</strong>
              {variantLabel ? <> · {variantLabel}</> : null} al carrito.
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <ButtonLink href="/carrito" size="sm" variant="outline" className="h-8">
              Ver carrito
            </ButtonLink>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLastAdded(null)}
              aria-label="Cerrar mensaje"
              className="text-emerald-200/80 hover:text-emerald-100 h-8 px-2"
            >
              Seguir comprando
            </Button>
          </div>
        </div>
      ) : null}

      {/* Sticky mobile CTA */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/85 fixed right-0 bottom-0 left-0 z-30 border-t border-white/5 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-display text-lg font-extrabold leading-tight">
              {formatUYU(effectivePrice)}
            </span>
            <span className="text-muted-foreground truncate text-[11px]">
              {variantLabel || product.name}
            </span>
          </div>
          <Button
            size="lg"
            className="bg-brand-red text-foreground hover:bg-[#ef4444] min-h-[44px] shrink-0 px-5"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {canAdd ? "Agregar" : "Sin stock"}
          </Button>
        </div>
      </div>
    </div>
  )
}
