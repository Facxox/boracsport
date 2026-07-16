"use client"

export default function CheckoutError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="font-display text-3xl font-extrabold">No pudimos cargar el checkout</h1><p className="text-muted-foreground mt-3">Revisá tu conexión e intentá nuevamente.</p><button type="button" onClick={reset} className="mt-6 rounded-xl bg-brand-red px-5 py-3 text-sm font-bold text-black">Intentar de nuevo</button></div>
}
