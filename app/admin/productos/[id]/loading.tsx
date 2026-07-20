// Skeleton para /admin/productos/[id] mientras carga el producto a editar.
const bar = "bg-muted motion-safe:animate-pulse motion-reduce:bg-muted/70"

export default function AdminProductoEditLoading() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className={`h-3 w-24 rounded ${bar}`} />
      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-2">
          <div className={`h-3 w-16 rounded ${bar}`} />
          <div className={`h-9 w-64 rounded ${bar}`} />
          <div className={`h-3 w-32 rounded ${bar}`} />
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className={`h-3 w-24 rounded ${bar}`} />
            <div className={`h-9 w-full rounded ${bar}`} />
          </div>
        ))}
        <div className={`h-40 w-full rounded-xl ${bar}`} />
        <div className={`h-10 w-32 rounded-lg ${bar}`} />
      </div>
    </main>
  )
}
