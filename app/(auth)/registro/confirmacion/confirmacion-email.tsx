"use client"

// Pantalla post-registro cuando Supabase requiere confirmar el email
// (data.session viene null). Ofrece:
//   - Mensaje claro de qué hacer.
//   - Botón "Reenviar email" (auth.resend).
//   - Link a login y a cambiar de email.

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ConfirmacionEmail() {
  const router = useRouter()
  const params = useSearchParams()
  const initialEmail = params.get("email") ?? ""
  const [email, setEmail] = useState(initialEmail)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  // Si el usuario ya tiene sesión activa, lo mandamos a su cuenta.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/cuenta")
    })
  }, [router])

  // Cooldown de 60s para evitar spam del botón "Reenviar".
  useEffect(() => {
    if (countdown <= 0) return
    const handle = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(handle)
  }, [countdown])

  async function onResend() {
    if (!EMAIL_REGEX.test(email.trim()) || resending || countdown > 0) return
    setResending(true)
    setError(null)
    setMessage(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      })
      if (err) {
        setError(err.message)
      } else {
        setMessage("Te reenviamos el email de confirmación.")
        setCountdown(60)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reenviar")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
        <Mail className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="font-display mt-4 text-2xl font-extrabold">
        Confirmá tu email
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Te enviamos un email para confirmar tu cuenta. Hacé click en el link
        que está adentro para terminar el registro.
      </p>

      <div className="bg-card/40 mt-5 space-y-2 rounded-xl border border-white/5 p-4 text-left text-sm">
        <label htmlFor="email" className="block font-medium">
          ¿No lo recibiste? Reenvialo a:
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="bg-background w-full rounded-md border border-white/10 px-3 py-2 text-sm"
          placeholder="tu@email.com"
        />
        <Button
          type="button"
          onClick={onResend}
          disabled={resending || countdown > 0 || !EMAIL_REGEX.test(email.trim())}
          className="w-full"
          variant="outline"
        >
          {resending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reenviando…
            </>
          ) : countdown > 0 ? (
            `Reenviar en ${countdown}s`
          ) : (
            "Reenviar email"
          )}
        </Button>
        {message ? (
          <p className="text-xs text-emerald-400" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="text-muted-foreground mt-5 space-y-1 text-xs">
        <p>Revisá también la carpeta de spam o promociones.</p>
        <p>
          ¿Te equivocaste de email?{" "}
          <Link
            href="/registro?step=datos"
            className="text-brand-red font-semibold underline-offset-2 hover:underline"
          >
            Empezá de nuevo
          </Link>
        </p>
        <p>
          ¿Ya confirmaste?{" "}
          <Link href="/login" className="text-brand-red font-semibold">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
