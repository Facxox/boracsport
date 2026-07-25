import Link from "next/link"
import { Sparkles } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"

export const metadata = {
  title: "Personalizar",
}

export default function PersonalizarPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center md:py-28">
      <span className="border-brand-red/30 bg-brand-red/10 text-brand-red inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
        <Sparkles className="h-3 w-3" />
        Próximamente
      </span>
      <h1 className="font-display mt-5 text-4xl font-extrabold md:text-5xl">
        El configurador 3D está en reconstrucción
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-balance text-sm md:text-base">
        Estamos rehaciendo el personalizador 3D desde cero para que sea más
        rápido, configurable y consistente con el resto de la tienda. Mientras
        tanto, podés explorar el catálogo y coordinar tu diseño por WhatsApp.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/productos" size="lg">
          Ver catálogo
        </ButtonLink>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm font-medium underline-offset-2 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
