"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { safeAuthNextPath } from "@/lib/auth/safe-next-path"
import { createClient } from "@/lib/supabase/client"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeAuthNextPath(searchParams.get("next"))
  const callbackFailed = searchParams.get("error") === "auth-callback-failed"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
        return
      }
      router.push(next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6">
      <h1 className="font-display text-2xl font-extrabold">Iniciar sesión</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Ingresá a tu cuenta para ver pedidos y diseños guardados.
      </p>

      <div className="mt-6">
        <GoogleAuthButton next={next} />
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="bg-white/10 h-px flex-1" />
        <span className="text-muted-foreground text-xs">o con email</span>
        <span className="bg-white/10 h-px flex-1" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {(error || callbackFailed) && (
          <p className="text-sm text-red-400" role="alert">
            {error ?? "No se pudo completar el inicio de sesión. Intentá nuevamente."}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>
      <div className="mt-3 flex justify-end">
        <Link
          href="/recuperar-contrasena"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <p className="text-muted-foreground mt-5 text-center text-sm">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-brand-red font-semibold">
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}
