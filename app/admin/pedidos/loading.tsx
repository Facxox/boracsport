// Skeleton para /admin/pedidos mientras se cargan los pedidos.
const bar = "bg-muted motion-safe:animate-pulse motion-reduce:bg-muted/70"

export default function AdminPedidosLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className={`h-3 w-24 rounded ${bar}`} />
      <div className={`mt-4 h-9 w-32 rounded ${bar}`} />
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <div className={`h-10 w-full ${bar}`} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`h-12 w-full border-t border-white/10 ${bar}`} />
        ))}
      </div>
    </main>
  )
}
