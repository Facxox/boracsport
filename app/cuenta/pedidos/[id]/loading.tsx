// Skeleton para /cuenta/pedidos/[id].
export default function PedidoDetalleLoading() {
  const bar = "bg-muted motion-safe:animate-pulse motion-reduce:bg-muted/70"
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className={`h-4 w-32 rounded ${bar}`} />
      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-2">
          <div className={`h-4 w-24 rounded ${bar}`} />
          <div className={`h-8 w-40 rounded ${bar}`} />
          <div className={`h-3 w-56 rounded ${bar}`} />
        </div>
        <div className={`h-9 w-36 rounded-lg ${bar}`} />
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-card mt-4 h-44 rounded-2xl border border-white/5 ${bar}`}
        />
      ))}
    </div>
  )
}
