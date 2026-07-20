export default function ConfirmacionLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-8 w-72 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="bg-card h-44 animate-pulse rounded-2xl border border-white/5" />
      <div className="bg-card h-32 animate-pulse rounded-2xl border border-white/5" />
      <div className="bg-card h-40 animate-pulse rounded-2xl border border-white/5" />
    </div>
  )
}
