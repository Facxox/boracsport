"use client"

// Paso 1 del flujo de recuperación: pide el email y dispara
// supabase.auth.resetPasswordForEmail. El usuario recibe un email con
// un link que lo lleva a /auth/callback?next=/reset-contrasena/nueva,
// donde Supabase intercambia el code por sesión y le permite cambiar la
// contraseña.

import { useState } from "react"
import Link from "next/link"
import { Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { getBaseUrl } from "@/lib/env"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RecuperarContrasena() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Email inválido.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const redirectTo = `${getBaseUrl()}/auth/callback?next=${encodeURIComponent("/reset-contrasena/nueva")}`
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      )
      if (err) {
        setError(err.message)
        return
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-card rounded-2xl border border-white/5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <Mail className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="font-display mt-4 text-2xl font-extrabold">
          Revisá tu casilla
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Si el email <strong className="text-foreground/90">{email}</strong>{" "}
          está registrado, te enviamos un link para restablecer la contraseña.
        </p>
        <p className="text-muted-foreground mt-4 text-xs">
          El link expira en 1 hora. Si no lo ves, revisá spam.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSent(false)
              setEmail("")
            }}
          >
            Probar con otro email
          </Button>
          <Link
            href="/login"
            className="text-brand-red text-sm font-semibold"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6">
      <h1 className="font-display text-2xl font-extrabold">
        Recuperar contraseña
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Ingresá el email asociado a tu cuenta. Te enviamos un link para
        restablecerla.
      </p>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando…
            </>
          ) : (
            "Enviar link de recuperación"
          )}
        </Button>
      </form>
      <p className="text-muted-foreground mt-5 text-center text-sm">
        ¿Te acordaste la contraseña?{" "}
        <Link href="/login" className="text-brand-red font-semibold">
          Ingresar
        </Link>
      </p>
    </div>
  )
}
