// Skeleton para /cuenta/pedidos.
export default function PedidosLoading() {
  const bar = "bg-muted motion-safe:animate-pulse motion-reduce:bg-muted/70"
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className={`h-8 w-48 rounded-lg ${bar}`} />
      <div className={`mt-2 h-4 w-64 rounded ${bar}`} />
      <ul className="mt-8 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className={`bg-card flex items-center justify-between rounded-xl border border-white/5 p-4 ${bar}`}
          >
            <div className="space-y-2">
              <div className={`h-4 w-32 rounded ${bar}`} />
              <div className={`h-3 w-40 rounded ${bar}`} />
            </div>
            <div className="space-y-2 text-right">
              <div className={`ml-auto h-4 w-20 rounded ${bar}`} />
              <div className={`ml-auto h-3 w-16 rounded ${bar}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
