import { CreditCard, MapPinned, PackageCheck } from "lucide-react"

const benefits = [
  {
    icon: MapPinned,
    title: "Llegamos a todo Uruguay",
    description: "Enviamos tu pasión a los 19 departamentos.",
  },
  {
    icon: PackageCheck,
    title: "Seguimiento de tu pedido",
    description: "Logística cuidada para que sepas dónde está en cada etapa.",
  },
  {
    icon: CreditCard,
    title: "Pagá en 3 cuotas",
    description: "Comprá más cómodo, sin recargo.",
  },
] as const

export function TrustRibbon() {
  return (
    <section aria-label="Beneficios de compra" className="border-b border-white/5 bg-background">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-6 md:grid-cols-3 md:gap-4 md:py-8">
        {benefits.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-card/70 p-4 transition-colors hover:border-brand-red/35 hover:bg-card"
          >
            <span className="bg-brand-red/10 text-brand-red flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:bg-brand-red group-hover:text-white">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
