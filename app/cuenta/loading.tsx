// Skeleton para /cuenta mientras se cargan los datos del usuario.
// Respeta prefers-reduced-motion: en lugar de la animación pulse, usa un
// gradiente estático cuando el usuario la pidió reducida.

export default function CuentaLoading() {
  const bar = "bg-muted motion-safe:animate-pulse motion-reduce:bg-muted/70"
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className={`h-8 w-40 rounded-lg ${bar}`} />
      <div className={`mt-3 h-4 w-72 rounded ${bar}`} />
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-16 rounded-xl ${bar}`} />
        ))}
      </div>
    </div>
  )
}
