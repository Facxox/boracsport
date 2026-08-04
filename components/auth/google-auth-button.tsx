"use client"

// Botón "Continuar con Google" — usa Supabase OAuth.
// El callback en /auth/callback intercambia el code por sesión y respeta `next`.
//
// `next` es la ruta a la que se debe ir después del callback. Por defecto
// vamos a /cuenta. Desde el registro de Google vamos a /cuenta igual: el
// usuario completa sus intereses más tarde desde el editor inline de la cuenta
// (que ya existe y maneja slugs activos), en vez de forzar el wizard de 2 pasos
// que está pensado para signUp con email/password.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/shared/social-icons"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface GoogleAuthButtonProps {
  /** Ruta a la que se redirige tras el callback de OAuth. */
  next?: string
  /** Texto del botón. Por defecto "Continuar con Google". */
  label?: string
  className?: string
}

export function GoogleAuthButton({
  next = "/cuenta",
  label = "Continuar con Google",
  className,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      // Construimos el redirectTo en base a window.location.origin para
      // que funcione tanto en dev como en prod y en previews de Vercel.
      const origin =
        typeof window !== "undefined" ? window.location.origin : ""
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          // Pedimos prompt=select_account para que, si el usuario ya tiene
          // varias cuentas de Google logueadas en el navegador, pueda elegir.
          queryParams: {
            prompt: "select_account",
          },
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // signInWithOAuth redirige solo — no hace falta hacer nada más.
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar con Google")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        disabled={loading}
        className={cn("w-full", className)}
      >
        <GoogleIcon className="mr-2 h-4 w-4" aria-hidden />
        {loading ? "Conectando con Google…" : label}
      </Button>
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
