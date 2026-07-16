export function TrustRibbon() {
  return (
    <div className="bg-brand-red text-foreground sticky top-0 z-50 w-full text-center text-[11px] font-semibold tracking-wider uppercase md:text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-1.5 md:gap-6 md:py-2">
        <span className="hidden sm:inline">
          Enviamos tu pasión a todo Uruguay
        </span>
        <span aria-hidden className="hidden sm:inline opacity-50">•</span>
        <span>Logística premium con seguimiento a los 19 departamentos</span>
        <span aria-hidden className="hidden md:inline opacity-50">•</span>
        <span className="hidden md:inline">3 cuotas sin recargo</span>
      </div>
    </div>
  )
}
