"use client"

import type { ReactNode } from "react"
import { useState, useTransition } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { AdminField } from "@/components/admin/admin-field"
import { FileDropzone } from "@/components/admin/file-dropzone"
import {
  VariantMatrixEditor,
  type VariantFormValue,
} from "@/components/admin/variant-matrix-editor"
import { createProductAction } from "@/app/admin/actions"
import { safeImageUrl } from "@/lib/safe-image"

interface CategoryOption {
  slug: string
  label: string
  kind: "ropa" | "pelota" | "otro"
}

interface NewProductFormProps {
  categories: CategoryOption[]
}

export function NewProductForm({ categories }: NewProductFormProps) {
  const [pending, startTransition] = useTransition()
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<VariantFormValue[]>([])
  const [categorySlug, setCategorySlug] = useState<string>(categories[0]?.slug ?? "")

  const selectedCategory = categories.find((category) => category.slug === categorySlug)
  const currentKind = selectedCategory?.kind ?? "otro"
  const showVariants = currentKind === "ropa"
  const variantStock = variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)

  function handleSubmit(formData: FormData) {
    formData.delete("images")
    for (const url of images) formData.append("images", url)
    if (images.length === 0) formData.append("images", "")
    // Debug: ver qué se está enviando al server action.
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      const variantCount = Array.from(formData.keys()).filter((k) => /^variants\[\d+\]\[size\]$/.test(k)).length
      const stockRaw = formData.get("stock")
      console.info("[new-product] submit", {
        name: formData.get("name"),
        slug: formData.get("slug"),
        category: formData.get("category"),
        price: formData.get("price"),
        stockRaw,
        images: images.length,
        variantsInState: variants.length,
        variantInputsInForm: variantCount,
      })
    }
    startTransition(async () => {
      try {
        const result = await createProductAction(formData)
        if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
          console.info("[new-product] server action result", result)
        }
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        // Si el server action tuvo éxito pero no redirigió (caso edge),
        // navegamos manualmente al editor del producto.
        if (typeof window !== "undefined") {
          window.location.assign(`/admin/productos/${result.id}`)
        }
      } catch (submitErr) {
        // El `redirect()` de Next.js lanza una excepción que Next intercepta.
        // Si llega acá, fue un error real. Lo logueamos y mostramos al usuario.
        if (typeof window !== "undefined") {
          console.error("[new-product] submit threw", submitErr)
        }
        const message = submitErr instanceof Error ? submitErr.message : String(submitErr)
        // Si el mensaje es un NEXT_REDIRECT (digest), no es un error — Next está
        // navegando. No mostramos toast en ese caso.
        if (!message.includes("NEXT_REDIRECT")) {
          toast.error(message || "Error desconocido al guardar")
        }
      }
    })
  }

  return (
    <form
      id="new-product-form"
      action={handleSubmit}
      className="mt-8 grid gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:pb-0"
    >
      <div className="grid min-w-0 gap-6">
        <FormSection
          title="Información básica"
          description="Datos que identifican el producto dentro del catálogo."
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(260px,2fr)]">
            <AdminField name="name" label="Nombre" required />
            <AdminField
              name="slug"
              label="Slug"
              required
              placeholder="ej: camiseta-titular-2026"
              hint="Nombre único de la URL. Usá minúsculas y guiones."
            />
          </div>
          <AdminField
            name="description"
            label="Descripción"
            type="textarea"
            hint="Contá brevemente qué ofrece el producto y sus características principales."
          />
          <AdminField
            name="tags"
            label="Tags"
            placeholder="futbol, titular, 2026"
            hint="Separalos por comas para facilitar la organización y búsqueda."
          />
        </FormSection>

        <FormSection
          title="Organización y precio"
          description="La categoría define cómo se administra el inventario."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2 text-sm">
              Categoría
              <select
                name="category"
                value={categorySlug}
                onChange={(event) => setCategorySlug(event.target.value)}
                required
                className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-3"
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.label}
                    {category.kind === "ropa"
                      ? " · ropa"
                      : category.kind === "pelota"
                        ? " · pelota"
                        : ""}
                  </option>
                ))}
              </select>
              <span className="text-xs leading-5 text-white/50">
                {showVariants
                  ? "Esta categoría usa talles, colores y stock por combinación."
                  : "Esta categoría utiliza un único valor de stock."}
              </span>
            </label>
            <AdminField name="price" label="Precio UYU" type="number" required defaultValue="0" />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <span className="text-xs font-medium uppercase tracking-wider text-white/40">Inventario</span>
            <span className="rounded-full border border-[#dc2626]/30 bg-[#dc2626]/10 px-3 py-1 text-xs font-semibold text-[#f87171]">
              {showVariants ? "Variantes por talle y color" : "Stock simple"}
            </span>
          </div>
        </FormSection>

        <FormSection
          title="Inventario"
          description={
            showVariants
              ? "Agregá colores y cargá el stock disponible para cada talle."
              : "Indicá cuántas unidades están disponibles."
          }
          action={
            showVariants ? (
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                {variants.length} variante{variants.length === 1 ? "" : "s"}
              </span>
            ) : null
          }
        >
          {showVariants ? (
            <>
              <DerivedStockSummary value={variantStock} />
              <VariantMatrixEditor value={variants} onChange={setVariants} />
            </>
          ) : (
            <div className="max-w-sm">
              <AdminField
                name="stock"
                label="Stock disponible"
                type="number"
                required
                defaultValue="0"
                hint="Podrás actualizarlo después desde la edición del producto."
              />
            </div>
          )}
        </FormSection>

        <FormSection
          title="Imágenes"
          description="Mostrá el producto con fotos claras y ordenadas."
          action={
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
              {images.length} imagen{images.length === 1 ? "" : "es"}
            </span>
          }
        >
          <div className="rounded-xl border border-white/10 bg-black/15 p-3 sm:p-4">
            <FileDropzone
              bucket="boracsport_products"
              prefix="draft"
              kind="image"
              value={images}
              onChange={setImages}
            />
          </div>
          <p className="text-xs leading-5 text-white/50">
            La primera imagen se usa como portada. Podrás reordenarlas y agregar más después de crear el producto.
          </p>
        </FormSection>

        <FormSection
          title="Visibilidad"
          description="Elegí cómo querés presentar el producto cuando se cree."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <VisibilityOption
              name="active"
              label="Activo"
              description="Visible en el catálogo público."
              defaultChecked
            />
            <VisibilityOption
              name="featured"
              label="Destacado"
              description="Puede aparecer en espacios principales."
            />
            <VisibilityOption
              name="on_sale"
              label="En oferta"
              description="Se identifica como producto en oferta."
            />
          </div>
        </FormSection>
      </div>

      <ProductSummary
        category={selectedCategory?.label ?? "Sin categoría"}
        images={images}
        showVariants={showVariants}
        variantsCount={variants.length}
        variantStock={variantStock}
        pending={pending}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#09090b]/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {selectedCategory?.label ?? "Nuevo producto"}
            </p>
            <p className="text-[11px] text-white/50">
              {showVariants ? `${variants.length} variantes · ${variantStock} u.` : `${images.length} imágenes`}
            </p>
          </div>
          <button
            type="submit"
            form="new-product-form"
            disabled={pending}
            className="h-11 shrink-0 rounded-xl bg-[#dc2626] px-5 text-sm font-bold text-black disabled:opacity-50"
          >
            {pending ? "Creando…" : "Crear producto"}
          </button>
        </div>
      </div>
    </form>
  )
}

function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101012] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-sans text-lg font-bold tracking-tight">{title}</h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-white/50">{description}</p>
        </div>
        {action}
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

function DerivedStockSummary({ value }: { value: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#dc2626]/25 bg-[#dc2626]/5 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#f87171]">Stock total calculado</p>
        <p className="mt-1 text-xs text-white/50">Suma de todas las combinaciones con stock.</p>
      </div>
      <p className="font-sans text-3xl font-extrabold tracking-tight">
        {value} <span className="text-sm font-medium text-white/50">unidades</span>
      </p>
    </div>
  )
}

function VisibilityOption({
  name,
  label,
  description,
  defaultChecked = false,
}: {
  name: "active" | "featured" | "on_sale"
  label: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex min-h-24 cursor-pointer items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4 transition-colors has-[:checked]:border-[#dc2626]/60 has-[:checked]:bg-[#dc2626]/5">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-white/50">{description}</span>
      </span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-5 shrink-0 accent-[#dc2626]"
      />
    </label>
  )
}

function ProductSummary({
  category,
  images,
  showVariants,
  variantsCount,
  variantStock,
  pending,
}: {
  category: string
  images: string[]
  showVariants: boolean
  variantsCount: number
  variantStock: number
  pending: boolean
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 grid gap-5 rounded-2xl border border-white/10 bg-[#101012] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dc2626]">Resumen</p>
          <h2 className="mt-2 font-sans text-xl font-bold">Listo para crear</h2>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/30">
          {safeImageUrl(images[0]) ? (
            <Image
              src={safeImageUrl(images[0]) as string}
              alt="Portada del nuevo producto"
              fill
              sizes="(min-width: 1024px) 320px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center px-4 text-center text-xs leading-5 text-white/40">
              La primera imagen cargada aparecerá como portada.
            </div>
          )}
        </div>

        <dl className="grid gap-3 border-y border-white/10 py-4">
          <SummaryRow label="Categoría" value={category} />
          <SummaryRow label="Imágenes" value={`${images.length} cargadas`} />
          <SummaryRow label="Inventario" value={showVariants ? "Por variantes" : "Stock simple"} />
          {showVariants ? (
            <>
              <SummaryRow label="Variantes" value={String(variantsCount)} />
              <SummaryRow label="Stock total" value={`${variantStock} u.`} highlight />
            </>
          ) : null}
        </dl>

        <button
          type="submit"
          form="new-product-form"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-[#dc2626] px-5 text-sm font-bold text-black disabled:opacity-50"
        >
          {pending ? "Creando producto…" : "Crear producto"}
        </button>
        <p className="text-center text-[11px] leading-4 text-white/40">
          Revisá inventario, imágenes y visibilidad antes de continuar.
        </p>
      </div>
    </aside>
  )
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="text-white/50">{label}</dt>
      <dd className={highlight ? "font-bold text-[#f87171]" : "text-right font-medium text-white"}>{value}</dd>
    </div>
  )
}
