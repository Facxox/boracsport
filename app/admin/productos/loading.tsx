// Skeleton para /admin/productos mientras se carga el listado.
const bar = "bg-muted motion-safe:animate-pulse motion-reduce:bg-muted/70"

export default function AdminProductosLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className={`h-3 w-24 rounded ${bar}`} />
      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-2">
          <div className={`h-3 w-20 rounded ${bar}`} />
          <div className={`h-9 w-44 rounded ${bar}`} />
          <div className={`h-3 w-64 rounded ${bar}`} />
        </div>
        <div className={`h-10 w-36 rounded-xl ${bar}`} />
      </div>
      <div className="mt-8 space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-12 w-full rounded-xl ${bar}`} />
        ))}
      </div>
    </main>
  )
}
