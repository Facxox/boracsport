// Skeleton para /registro/confirmacion mientras el cliente intercambia el
// código del email de confirmación por una sesión activa.
const bar = "bg-muted motion-safe:animate-pulse motion-reduce:bg-muted/70"

export default function ConfirmacionLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="bg-card rounded-2xl border border-white/5 p-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <div className={`h-6 w-6 rounded-full ${bar}`} />
        </div>
        <div className="mt-4 space-y-2 text-center">
          <div className={`mx-auto h-6 w-56 rounded ${bar}`} />
          <div className={`mx-auto h-3 w-72 rounded ${bar}`} />
          <div className={`mx-auto h-3 w-48 rounded ${bar}`} />
        </div>
        <div className="bg-card/40 mt-5 space-y-3 rounded-xl border border-white/5 p-4">
          <div className={`h-3 w-32 rounded ${bar}`} />
          <div className={`h-9 w-full rounded ${bar}`} />
          <div className={`h-9 w-full rounded ${bar}`} />
        </div>
      </div>
    </div>
  )
}
