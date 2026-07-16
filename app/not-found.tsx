import Link from "next/link"
import { ButtonLink } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-6xl font-extrabold text-brand-red">404</h1>
      <p className="font-display mt-3 text-2xl font-extrabold">
        Página no encontrada
      </p>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        La página que buscás no existe o fue movida. Probá volver al inicio o
        explorar el catálogo.
      </p>
      <div className="mt-6 flex gap-2">
        <ButtonLink href="/">Volver al inicio</ButtonLink>
        <ButtonLink href="/productos" variant="outline">
          Ver catálogo
        </ButtonLink>
      </div>
    </div>
  )
}
